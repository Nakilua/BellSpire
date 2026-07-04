import { useMemo, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Church,
  DoorOpen,
  Dumbbell,
  Flag,
  Hammer,
  Landmark,
  Layers,
  LockKeyhole,
  Map as MapIcon,
  MapPin,
  Maximize2,
  MessageCircle,
  PackageOpen,
  Route,
  ScrollText,
  Sparkles,
  Tent,
  X,
  type LucideIcon
} from "lucide-react";
import { DungeonMapArt, PlayerMarker, WorldMapArt, ZoneMapArt } from "./atlas/MapArt";
import atlasDeepZooms from "../data/atlasDeepZooms.json";
import mapAnnotations from "../data/mapAnnotations.json";
import mapServices from "../data/mapServices.json";
import pois from "../data/pois.json";
import regionTopography from "../data/regionTopography.json";
import { getActiveDungeon, getCurrentRoom, getCurrentZone } from "../game/selectors";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
}

type MapLayer = "routes" | "services" | "danger" | "guild" | "details";
type AtlasScope = "world" | "zone" | "dungeon";
type AtlasAnnotationKind = "major" | "route" | "service" | "danger" | "dungeon" | "optional";

interface RegionTopography {
  id: string;
  zoneId: string;
  name: string;
  levelRange: string;
  terrainType: string;
  terrain: string;
  x: number;
  y: number;
  locked: boolean;
  danger: string;
  services: string[];
  landmarks: string[];
  guildHooks: string[];
  connections: string[];
  sourceNote: string;
}

interface MapService {
  id: string;
  zoneId: string;
  poiId?: string;
  label: string;
  kind: string;
  x: number;
  y: number;
  summary: string;
  sourceNote: string;
}

interface MapAnnotation {
  id: string;
  scope: "zone" | "dungeon";
  zoneId?: string;
  dungeonId?: string;
  label: string;
  kind: AtlasAnnotationKind;
  x: number;
  y: number;
  priority: number;
  note: string;
  sourceNote: string;
}

interface DungeonRoom {
  id: string;
  name: string;
  type: string;
  lesson: string;
  scene: string;
  object?: string;
  encounterId?: string;
}

interface DungeonDefinition {
  id: string;
  name: string;
  source: string;
  levelRange: string;
  mode: string;
  rooms: DungeonRoom[];
}

interface AtlasDeepZoom {
  id: string;
  scope: "zone" | "dungeon";
  zoneId?: string;
  dungeonId?: string;
  title: string;
  subtitle: string;
  imageClass: string;
  assetName?: string;
  detailIntent?: string;
  annotationIds?: string[];
  focus: string[];
  verbs: string[];
  sourceNote: string;
}

const regions = regionTopography as RegionTopography[];
const services = mapServices as MapService[];
const annotations = mapAnnotations as MapAnnotation[];
const deepZooms = atlasDeepZooms as AtlasDeepZoom[];
const layerLabels: Record<MapLayer, string> = {
  routes: "Routes",
  services: "Services",
  danger: "Danger",
  guild: "Guild",
  details: "Details"
};
const serviceKindLabels: Record<string, string> = {
  landmark: "Landmarks",
  ledger: "Civic",
  trainer: "Training",
  guild: "Guild",
  craft: "Crafting",
  market: "Market",
  faction: "Faction",
  shrine: "Shrine",
  rest: "Rest",
  social: "Social",
  material: "Materials",
  dungeon: "Dungeon",
  danger: "Danger",
  route: "Routes",
  preview: "Locked Preview"
};
const dungeonRoomPositions: Record<string, { x: number; y: number }> = {
  "shrine-descent": { x: 13, y: 34 },
  "hall-threaded-names": { x: 35, y: 40 },
  "broken-bell-niche": { x: 50, y: 37 },
  "pilgrim-bone-walk": { x: 57, y: 53 },
  "candleless-alcove": { x: 49, y: 69 },
  "warden-chamber": { x: 79, y: 42 },
  "road-seal-exit": { x: 82, y: 73 }
};

export function MapPanel({ state }: Props) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDungeonRoomId, setSelectedDungeonRoomId] = useState<string | null>(null);
  const [atlasScope, setAtlasScope] = useState<AtlasScope | null>(null);
  const [layers, setLayers] = useState<Record<MapLayer, boolean>>({
    routes: true,
    services: true,
    danger: true,
    guild: false,
    details: true
  });
  const dungeon = getActiveDungeon(state) as DungeonDefinition | undefined;
  const room = getCurrentRoom(state) as DungeonRoom | undefined;
  const zone = getCurrentZone(state);
  const zonePois = pois.filter((poi) => poi.zoneId === zone.id);
  const zoneServices = services.filter((entry) => entry.zoneId === zone.id);
  const activeService = zoneServices.find((entry) => entry.id === selectedServiceId) ?? zoneServices[0];
  const activeRoomId = room?.id ?? dungeon?.rooms[state.dungeon?.roomIndex ?? 0]?.id;
  const selectedRoom = dungeon?.rooms.find((entry) => entry.id === (selectedDungeonRoomId ?? activeRoomId)) ?? room;
  const lockedRegions = regions.filter((entry) => entry.locked);
  const currentRegion = regions.find((entry) => entry.zoneId === zone.id) ?? regions[0];
  const liveTravelers = state.realm.players.filter((player) => player.zoneId === zone.id).map((player) => player.name);
  const routePairs = useMemo(() => {
    const byId = new globalThis.Map(regions.map((entry) => [entry.id, entry]));
    const seen = new Set<string>();

    return regions.flatMap((entry) =>
      entry.connections.flatMap((connectionId) => {
        const target = byId.get(connectionId);
        if (!target) {
          return [];
        }
        const key = [entry.id, target.id].sort().join(":");
        if (seen.has(key)) {
          return [];
        }
        seen.add(key);
        return [{ from: entry, to: target }];
      })
    );
  }, []);

  function toggleLayer(layer: MapLayer) {
    setLayers((current) => ({
      ...current,
      [layer]: !current[layer]
    }));
  }

  function openAtlas(scope: AtlasScope) {
    setAtlasScope(scope);
  }

  return (
    <section className="panel atlas-panel">
      <div className="panel-title">
        <MapIcon size={15} />
        <span>Map</span>
      </div>

      {dungeon && state.dungeon ? (
        <div>
          <div className="map-heading-row">
            <p className="panel-copy">{dungeon.name}</p>
            <button className="map-open-button" type="button" onClick={() => openAtlas("dungeon")}>
              <Maximize2 size={13} />
              <span>Atlas View</span>
            </button>
          </div>
          <DungeonMapPlate
            dungeon={dungeon}
            activeRoomId={activeRoomId}
            selectedRoomId={selectedRoom?.id}
            onSelectRoom={setSelectedDungeonRoomId}
            showDetails
          />
          {selectedRoom ? <DungeonRoomDetail dungeon={dungeon} room={selectedRoom} activeRoomId={activeRoomId} /> : null}
          <DungeonRouteList dungeon={dungeon} activeRoomId={activeRoomId} selectedRoomId={selectedRoom?.id} onSelectRoom={setSelectedDungeonRoomId} />
          {room ? <p className="panel-note">Current room: {room.lesson}</p> : null}
        </div>
      ) : (
        <div>
          <div className="map-heading-row">
            <p className="panel-copy">
              {zone.name} / {zone.levelRange}
            </p>
            <button className="map-open-button" type="button" onClick={() => openAtlas("zone")}>
              <Maximize2 size={13} />
              <span>Atlas View</span>
            </button>
          </div>
          <div className="map-layer-row" aria-label="Map layers">
            {(Object.keys(layerLabels) as MapLayer[]).map((layer) => (
              <button className={`map-layer-button ${layers[layer] ? "active" : ""}`} type="button" onClick={() => toggleLayer(layer)} key={layer}>
                <Layers size={12} />
                <span>{layerLabels[layer]}</span>
              </button>
            ))}
          </div>

          <WorldMapPlate state={state} layers={layers} routePairs={routePairs} onOpenWorld={() => openAtlas("world")} />

          <div className="map-readout">
            <div className="map-readout-title">
              <Route size={14} />
              <span>{currentRegion.name}</span>
            </div>
            <p>{currentRegion.terrain}</p>
            {layers.danger ? <MapReadoutList label="Danger" values={[currentRegion.danger]} /> : null}
            <MapReadoutList label="Landmarks" values={currentRegion.landmarks} />
            {layers.services ? <MapReadoutList label="Services" values={currentRegion.services} /> : null}
            {layers.guild ? <MapReadoutList label="Guild hooks" values={currentRegion.guildHooks} /> : null}
          </div>

          <ZoneMapPlate
            zoneId={zone.id}
            zonePois={zonePois}
            currentPoiId={state.locationPoiId}
            zoneServices={zoneServices}
            activeService={selectedServiceId ? activeService : undefined}
            showServices={layers.services}
            showDetails={layers.details}
            onSelectService={setSelectedServiceId}
            liveTravelers={liveTravelers}
          />
          {layers.services ? <ServiceLegend services={zoneServices} selectedService={activeService} onSelect={setSelectedServiceId} /> : null}
          <div className="locked-list">
            {lockedRegions.slice(0, 4).map((entry) => (
              <div className="locked-row" key={entry.id}>
                <span>{entry.name}</span>
                <small>{entry.terrainType} / {entry.levelRange}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      <AtlasDialog title={getAtlasTitle(atlasScope, zone.name, dungeon?.name)} open={atlasScope !== null} onOpenChange={(open) => !open && setAtlasScope(null)}>
        {atlasScope === "world" ? <WorldMapPlate state={state} layers={layers} routePairs={routePairs} expanded /> : null}
        {atlasScope === "zone" ? (
          <div className="atlas-dialog-grid atlas-dialog-grid-closeup">
            <ZoneMapPlate
              zoneId={zone.id}
              zonePois={zonePois}
              currentPoiId={state.locationPoiId}
              zoneServices={zoneServices}
              activeService={selectedServiceId ? activeService : undefined}
              showServices={layers.services}
              showDetails={layers.details}
              onSelectService={setSelectedServiceId}
              liveTravelers={liveTravelers}
              expanded
            />
            <AtlasCloseupPanel zoneId={zone.id} services={zoneServices} />
          </div>
        ) : null}
        {atlasScope === "dungeon" && dungeon ? (
          <div className="atlas-dialog-grid">
            <DungeonMapPlate
              dungeon={dungeon}
              activeRoomId={activeRoomId}
              selectedRoomId={selectedRoom?.id}
              onSelectRoom={setSelectedDungeonRoomId}
              showDetails
              expanded
            />
            <div className="atlas-closeup-stack">
              {selectedRoom ? <DungeonRoomDetail dungeon={dungeon} room={selectedRoom} activeRoomId={activeRoomId} /> : null}
              <AtlasDungeonCloseup dungeon={dungeon} />
            </div>
          </div>
        ) : null}
      </AtlasDialog>
    </section>
  );
}

function WorldMapPlate({
  state,
  layers,
  routePairs,
  onOpenWorld,
  expanded = false
}: {
  state: GameState;
  layers: Record<MapLayer, boolean>;
  routePairs: { from: RegionTopography; to: RegionTopography }[];
  onOpenWorld?: () => void;
  expanded?: boolean;
}) {
  const zone = getCurrentZone(state);

  return (
    <div className={`world-map custom-map-plate living-map ${expanded ? "expanded" : ""}`} aria-label="Bellspire world topology">
      <WorldMapArt />
      {layers.routes ? (
        <svg className="topography-routes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {routePairs.map((pair) => (
            <line x1={pair.from.x} y1={pair.from.y} x2={pair.to.x} y2={pair.to.y} key={`${pair.from.id}-${pair.to.id}`} />
          ))}
        </svg>
      ) : null}

      {regions.map((region) => {
        const active = region.zoneId === zone.id;
        return (
          <div
            className={`topography-region ${region.terrainType} ${active ? "active" : ""} ${region.locked ? "locked" : ""}`}
            key={region.id}
            style={{ left: `${region.x}%`, top: `${region.y}%` }}
            title={`${region.name}: ${region.terrain}`}
          >
            <span className="region-pin" />
            <strong>{region.name}</strong>
            <small>{region.levelRange}</small>
          </div>
        );
      })}
      {layers.services
        ? services
            .filter((entry) => entry.kind === "preview")
            .map((entry) => (
              <button
                className="service-pin preview"
                key={entry.id}
                style={{ left: `${entry.x}%`, top: `${entry.y}%` }}
                title={`${entry.label}: ${entry.summary}`}
                type="button"
              >
                <span className="service-pin-icon" aria-hidden="true">
                  <span className="service-pin-mark" />
                </span>
                <small>{entry.label}</small>
              </button>
            ))
        : null}
      {onOpenWorld ? (
        <button className="map-corner-button" type="button" onClick={onOpenWorld}>
          <Maximize2 size={12} />
          <span>World</span>
        </button>
      ) : null}
    </div>
  );
}

function ZoneMapPlate({
  zoneId,
  zonePois,
  currentPoiId,
  zoneServices,
  activeService,
  showServices,
  showDetails,
  onSelectService,
  liveTravelers = [],
  expanded = false
}: {
  zoneId: string;
  zonePois: typeof pois;
  currentPoiId: string;
  zoneServices: MapService[];
  activeService?: MapService;
  showServices: boolean;
  showDetails: boolean;
  onSelectService: (id: string) => void;
  liveTravelers?: string[];
  expanded?: boolean;
}) {
  return (
    <div className={`node-map topographic-node-map custom-map-plate living-map zone-${zoneId} ${expanded ? "expanded" : ""}`} aria-label={`${zoneId} detailed atlas map`}>
      <ZoneMapArt zoneId={zoneId} />
      <PlayerMarker poiId={currentPoiId} />
      {liveTravelers.length > 0 ? (
        <div className="live-travelers-cartouche" title="Real players in this zone right now">
          <span className="live-dot" />
          <span>{liveTravelers.join(", ")} on this road</span>
        </div>
      ) : null}
      {zonePois.map((poi) => (
        <div
          className={`map-node ${poi.id === currentPoiId ? "active" : ""} ${poi.x < 18 ? "edge-left" : ""} ${poi.x > 82 ? "edge-right" : ""}`}
          key={poi.id}
          style={{ left: `${poi.x}%`, top: `${poi.y}%` }}
          title={`${poi.name}: ${poi.type}`}
        >
          <span />
          <small>{poi.name}</small>
        </div>
      ))}
      {showServices
        ? zoneServices.map((entry) => (
            <button
              className={`service-pin ${entry.kind} ${activeService?.id === entry.id ? "active" : ""}`}
              key={entry.id}
              style={{ left: `${entry.x}%`, top: `${entry.y}%` }}
              title={`${entry.label}: ${entry.summary}`}
              type="button"
              aria-label={`${entry.label}: ${entry.summary}`}
              onClick={() => onSelectService(entry.id)}
            >
              <span className="service-pin-icon" aria-hidden="true">
                <span className="service-pin-mark" />
              </span>
              <small>{entry.label}</small>
            </button>
          ))
        : null}
      <AtlasAnnotationLayer scope="zone" zoneId={zoneId} expanded={expanded} showDetails={showDetails} />
    </div>
  );
}

function DungeonMapPlate({
  dungeon,
  activeRoomId,
  selectedRoomId,
  onSelectRoom,
  showDetails,
  expanded = false
}: {
  dungeon: DungeonDefinition;
  activeRoomId?: string;
  selectedRoomId?: string;
  onSelectRoom: (id: string) => void;
  showDetails: boolean;
  expanded?: boolean;
}) {
  return (
    <div className={`dungeon-ink-map custom-map-plate living-map ${expanded ? "expanded" : ""}`} aria-label={`${dungeon.name} detailed dungeon route`}>
      <DungeonMapArt activeRoomId={activeRoomId} />
      {dungeon.rooms.map((entry, index) => {
        const position = dungeonRoomPositions[entry.id] ?? { x: 50, y: 50 };
        const isActive = entry.id === activeRoomId;
        const isSelected = entry.id === selectedRoomId;

        return (
          <button
            className={`dungeon-room-pin ${isActive ? "active" : ""} ${isSelected ? "selected" : ""} ${entry.type.toLowerCase().includes("optional") ? "optional" : ""}`}
            key={entry.id}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            title={`${entry.name}: ${entry.lesson}`}
            type="button"
            onClick={() => onSelectRoom(entry.id)}
          >
            <span>{index + 1}</span>
            <small>{entry.name}</small>
          </button>
        );
      })}
      {expanded ? null : <AtlasAnnotationLayer scope="dungeon" dungeonId={dungeon.id} expanded={expanded} showDetails={showDetails} />}
    </div>
  );
}

function AtlasAnnotationLayer({
  scope,
  zoneId,
  dungeonId,
  expanded,
  showDetails
}: {
  scope: MapAnnotation["scope"];
  zoneId?: string;
  dungeonId?: string;
  expanded: boolean;
  showDetails: boolean;
}) {
  if (!showDetails) {
    return null;
  }

  const visibleAnnotations = annotations.filter((entry) => {
    if (!expanded && entry.priority > 1) {
      return false;
    }
    if (scope === "zone") {
      return entry.scope === "zone" && entry.zoneId === zoneId;
    }
    return entry.scope === "dungeon" && entry.dungeonId === dungeonId;
  });

  if (visibleAnnotations.length === 0) {
    return null;
  }

  return (
    <div className="atlas-annotation-layer" aria-hidden="true">
      {visibleAnnotations.map((entry) => (
        <div
          className={`atlas-annotation ${entry.kind} priority-${entry.priority}`}
          key={entry.id}
          style={{ left: `${entry.x}%`, top: `${entry.y}%` }}
          title={`${entry.label}: ${entry.note}`}
          data-source-note={entry.sourceNote}
        >
          <span>{entry.label}</span>
          {expanded ? <small>{entry.note}</small> : null}
        </div>
      ))}
    </div>
  );
}

function AtlasCloseupPanel({ zoneId, services }: { zoneId: string; services: MapService[] }) {
  const config = getZoneCloseup(zoneId);
  const zooms = deepZooms.filter((entry) => entry.scope === "zone" && entry.zoneId === zoneId);

  if (!config) {
    return null;
  }

  return (
    <aside className="atlas-closeup-panel" aria-label={`${config.title} close-up`}>
      <div>
        <span>Close-Up Plate</span>
        <strong>{config.title}</strong>
        <p>{config.description}</p>
      </div>
      <div className={`atlas-closeup-plate ${config.className}`} aria-hidden="true" />
      <div className="atlas-closeup-services">
        {services.slice(0, 8).map((entry) => (
          <span className={`service-kind-chip ${entry.kind}`} key={entry.id}>
            {entry.label}
          </span>
        ))}
      </div>
      <DeepZoomLedger zooms={zooms} />
      <small>{config.sourceNote}</small>
    </aside>
  );
}

function AtlasDungeonCloseup({ dungeon }: { dungeon: DungeonDefinition }) {
  const zooms = deepZooms.filter((entry) => entry.scope === "dungeon" && entry.dungeonId === dungeon.id);

  if (zooms.length === 0) {
    return null;
  }

  const primary = zooms.find((entry) => entry.imageClass === "closeup-warden-chamber") ?? zooms[0];

  return (
    <aside className="atlas-closeup-panel" aria-label="Warden Chamber close-up">
      <div>
        <span>Boss-Room Plate</span>
        <strong>{primary.title}</strong>
        <p>{primary.subtitle}</p>
      </div>
      <div className={`atlas-closeup-plate ${primary.imageClass}`} aria-hidden="true" />
      <div className="atlas-closeup-services">
        {primary.focus.slice(0, 5).map((label) => (
          <span className="service-kind-chip dungeon" key={label}>
            {label}
          </span>
        ))}
      </div>
      <DeepZoomLedger zooms={zooms} />
      <small>{primary.sourceNote}</small>
    </aside>
  );
}

function DeepZoomLedger({ zooms }: { zooms: AtlasDeepZoom[] }) {
  if (!zooms.length) {
    return null;
  }

  return (
    <div className="deep-zoom-ledger" aria-label="Deep zoom atlas entries">
      <span>Deep Zooms</span>
      {zooms.map((zoom) => (
        <article className="deep-zoom-card" key={zoom.id}>
          <strong>{zoom.title}</strong>
          <p>{zoom.subtitle}</p>
          {zoom.detailIntent ? <p>{zoom.detailIntent}</p> : null}
          <div className="deep-zoom-chip-row">
            {zoom.focus.slice(0, 6).map((item) => (
              <i key={item}>{item}</i>
            ))}
          </div>
          <small>Player verbs: {zoom.verbs.join(" / ")}</small>
          {zoom.assetName ? <small>Asset: {zoom.assetName}</small> : null}
        </article>
      ))}
    </div>
  );
}

function getZoneCloseup(zoneId: string) {
  const closeups: Record<string, { title: string; description: string; className: string; sourceNote: string }> = {
    "saint-veyra": {
      title: "Saint Veyra Service Districts",
      description: "A denser city close-up for the cathedral road, civic services, training, crafting, markets, shrine care, and guild work.",
      className: "closeup-saint-veyra",
      sourceNote: "Saint Veyra district/service entries from the compendium, workbook, map services, and source-governed annotations."
    },
    "hearthmere-fields": {
      title: "Little Dawn Shrine Road",
      description: "A shrine-hill close-up for Olla, shrine rest, road candle work, field supplies, wax beds, and the Cryptlet stair.",
      className: "closeup-little-dawn",
      sourceNote: "Hearthmere Fields, Road Shrine of Little Dawn, Olla, and Pilgrim Trial Cryptlet entries from source-governed runtime data."
    }
  };

  return closeups[zoneId];
}

function DungeonRouteList({
  dungeon,
  activeRoomId,
  selectedRoomId,
  onSelectRoom
}: {
  dungeon: DungeonDefinition;
  activeRoomId?: string;
  selectedRoomId?: string;
  onSelectRoom: (id: string) => void;
}) {
  return (
    <div className="stack-sm dungeon-route-list">
      {dungeon.rooms.map((entry, index) => (
        <button
          className={`route-row ${entry.id === activeRoomId ? "active" : ""} ${entry.id === selectedRoomId ? "selected" : ""}`}
          key={entry.id}
          type="button"
          onClick={() => onSelectRoom(entry.id)}
        >
          <span>{index + 1}</span>
          <div>
            <p>{entry.name}</p>
            <small>{entry.type} / {entry.lesson}</small>
          </div>
        </button>
      ))}
    </div>
  );
}

function DungeonRoomDetail({ dungeon, room, activeRoomId }: { dungeon: DungeonDefinition; room: DungeonRoom; activeRoomId?: string }) {
  const index = dungeon.rooms.findIndex((entry) => entry.id === room.id);

  return (
    <div className={`dungeon-room-detail ${room.id === activeRoomId ? "active" : ""}`}>
      <div>
        <span>Room {index + 1}</span>
        <strong>{room.name}</strong>
      </div>
      <p>{room.scene}</p>
      <MapReadoutList label="Lesson" values={[room.lesson]} />
      {room.object ? <MapReadoutList label="Object" values={[room.object]} /> : null}
      {room.encounterId ? <MapReadoutList label="Encounter" values={[room.encounterId]} /> : null}
    </div>
  );
}

function ServiceLegend({
  services,
  selectedService,
  onSelect
}: {
  services: MapService[];
  selectedService?: MapService;
  onSelect: (id: string) => void;
}) {
  const grouped = services.reduce<Record<string, MapService[]>>((groups, entry) => {
    const label = serviceKindLabels[entry.kind] ?? "Services";
    groups[label] = groups[label] ? [...groups[label], entry] : [entry];
    return groups;
  }, {});

  if (services.length === 0) {
    return null;
  }

  return (
    <div className="service-legend" aria-label="Map services">
      <div className="service-legend-title">
        <ScrollText size={13} />
        <span>Source-Governed Services</span>
      </div>
      {Object.entries(grouped).map(([group, entries]) => (
        <div className="service-legend-group" key={group}>
          <span>{group}</span>
          {entries.map((entry) => (
            <button className={`service-legend-row ${selectedService?.id === entry.id ? "active" : ""}`} key={entry.id} type="button" onClick={() => onSelect(entry.id)}>
              <span className={`service-kind ${entry.kind}`}>
                <ServiceIcon kind={entry.kind} />
              </span>
              <div>
                <strong>{entry.label}</strong>
                <p>{entry.summary}</p>
              </div>
            </button>
          ))}
        </div>
      ))}
      {selectedService ? (
        <div className="service-detail">
          <strong>{selectedService.label}</strong>
          <p>{selectedService.summary}</p>
          <small>{selectedService.sourceNote}</small>
        </div>
      ) : null}
    </div>
  );
}

function AtlasDialog({ title, open, onOpenChange, children }: { title: string; open: boolean; onOpenChange: (open: boolean) => void; children: ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay atlas-dialog-overlay" />
        <Dialog.Content className="atlas-dialog-content">
          <div className="atlas-dialog-header">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button className="icon-button" type="button" aria-label="Close atlas view">
                <X size={15} />
              </button>
            </Dialog.Close>
          </div>
          <div className="atlas-dialog-body">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ServiceIcon({ kind }: { kind: string }) {
  const icons: Record<string, LucideIcon> = {
    landmark: Church,
    trainer: Dumbbell,
    guild: ScrollText,
    craft: Hammer,
    market: PackageOpen,
    faction: Flag,
    ledger: Landmark,
    rest: Tent,
    social: MessageCircle,
    material: PackageOpen,
    shrine: Sparkles,
    dungeon: DoorOpen,
    route: Route,
    danger: Flag,
    preview: LockKeyhole
  };
  const Icon = icons[kind] ?? MapPin;

  return <Icon aria-hidden="true" size={13} strokeWidth={2.4} />;
}

function MapReadoutList({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="map-readout-list">
      <span>{label}</span>
      <p>{values.join(" / ")}</p>
    </div>
  );
}

function getAtlasTitle(scope: AtlasScope | null, zoneName: string, dungeonName?: string) {
  if (scope === "world") {
    return "BellSpire World Atlas";
  }
  if (scope === "dungeon") {
    return dungeonName ?? "Dungeon Atlas";
  }
  return `${zoneName} Atlas`;
}
