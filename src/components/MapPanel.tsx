import { useMemo, useState } from "react";
import { Layers, Map as MapIcon, Route } from "lucide-react";
import pois from "../data/pois.json";
import regionTopography from "../data/regionTopography.json";
import { getActiveDungeon, getCurrentRoom, getCurrentZone } from "../game/selectors";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
}

type MapLayer = "routes" | "services" | "danger" | "guild";

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

const regions = regionTopography as RegionTopography[];
const layerLabels: Record<MapLayer, string> = {
  routes: "Routes",
  services: "Services",
  danger: "Danger",
  guild: "Guild"
};

export function MapPanel({ state }: Props) {
  const [layers, setLayers] = useState<Record<MapLayer, boolean>>({
    routes: true,
    services: true,
    danger: true,
    guild: false
  });
  const dungeon = getActiveDungeon(state);
  const room = getCurrentRoom(state);
  const zone = getCurrentZone(state);
  const zonePois = pois.filter((poi) => poi.zoneId === zone.id);
  const lockedRegions = regions.filter((entry) => entry.locked);
  const currentRegion = regions.find((entry) => entry.zoneId === zone.id) ?? regions[0];
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

  return (
    <section className="panel">
      <div className="panel-title">
        <MapIcon size={15} />
        <span>Map</span>
      </div>

      {dungeon && state.dungeon ? (
        <div>
          <p className="panel-copy">{dungeon.name}</p>
          <div className="dungeon-ink-map" aria-label={`${dungeon.name} hand-drawn dungeon route`}>
            <DungeonAtlasInk activeIndex={state.dungeon.roomIndex} />
          </div>
          <div className="stack-sm">
            {dungeon.rooms.map((entry, index) => (
              <div className={`route-row ${index === state.dungeon?.roomIndex ? "active" : ""}`} key={entry.id}>
                <span>{index + 1}</span>
                <div>
                  <p>{entry.name}</p>
                  <small>{entry.type}</small>
                </div>
              </div>
            ))}
          </div>
          {room ? <p className="panel-note">Current room: {room.lesson}</p> : null}
        </div>
      ) : (
        <div>
          <p className="panel-copy">
            {zone.name} / {zone.levelRange}
          </p>
          <div className="map-layer-row" aria-label="Map layers">
            {(Object.keys(layerLabels) as MapLayer[]).map((layer) => (
              <button className={`map-layer-button ${layers[layer] ? "active" : ""}`} type="button" onClick={() => toggleLayer(layer)} key={layer}>
                <Layers size={12} />
                <span>{layerLabels[layer]}</span>
              </button>
            ))}
          </div>

          <div className="world-map" aria-label="Bellspire world topology">
            <WorldAtlasInk showDanger={layers.danger} showGuild={layers.guild} />
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
                >
                  <span className="region-pin" />
                  <strong>{region.name}</strong>
                  <small>{region.levelRange}</small>
                </div>
              );
            })}
          </div>

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

          <div className="node-map topographic-node-map">
            <ZoneAtlasInk zoneId={zone.id} />
            {zonePois.map((poi) => (
              <div
                className={`map-node ${poi.id === state.locationPoiId ? "active" : ""}`}
                key={poi.id}
                style={{ left: `${poi.x}%`, top: `${poi.y}%` }}
              >
                <span />
                <small>{poi.name}</small>
              </div>
            ))}
          </div>
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
    </section>
  );
}

function MapReadoutList({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="map-readout-list">
      <span>{label}</span>
      <p>{values.join(" / ")}</p>
    </div>
  );
}

function WorldAtlasInk({ showDanger, showGuild }: { showDanger: boolean; showGuild: boolean }) {
  return (
    <svg className="handdrawn-atlas world-ink" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path className="ink-land land-west" d="M12 35 C16 26, 24 23, 32 28 C39 32, 42 42, 39 51 C36 62, 27 69, 18 65 C10 60, 7 46, 12 35 Z" />
      <path className="ink-land land-east" d="M47 18 C61 9, 80 10, 91 24 C98 34, 94 48, 84 55 C76 61, 70 73, 60 81 C51 88, 40 82, 43 70 C46 56, 55 49, 53 38 C51 29, 40 25, 47 18 Z" />
      <path className="ink-land bellgrave-below-shape" d="M48 73 C55 66, 67 68, 73 78 C68 88, 54 91, 45 84 C42 80, 43 76, 48 73 Z" />
      <path className="ink-coast" d="M34 17 C37 20, 35 25, 39 29 C43 33, 48 31, 51 36 C55 43, 51 50, 55 55" />
      <path className="ink-road main-road" d="M20 36 C28 40, 36 45, 44 63 C52 55, 61 56, 72 50 C75 41, 77 34, 86 18" />
      <path className="ink-road lower-road" d="M44 63 C51 72, 58 80, 68 86" />
      <path className="ink-road coast-road" d="M20 36 C24 28, 31 22, 36 20 C42 19, 47 17, 52 16" />
      <path className="ink-hills" d="M40 61 l3 -5 l3 5 M47 58 l3 -6 l4 7 M55 57 l3 -5 l3 5" />
      <path className="ink-hills" d="M70 28 l3 -5 l4 6 M77 26 l4 -6 l4 7" />
      <path className="ink-forest" d="M39 67 c-2 -5, 3 -8, 5 -3 c2 -4, 7 -2, 5 3 c-3 3 -7 4 -10 0 Z" />
      <path className="ink-forest" d="M57 60 c-2 -4, 3 -7, 5 -3 c2 -4, 7 -2, 5 3 c-3 3 -7 4 -10 0 Z" />
      {showDanger ? <path className="ink-danger" d="M34 20 C39 15, 49 13, 56 17 C52 24, 44 27, 36 24 Z" /> : null}
      {showDanger ? <path className="ink-danger" d="M72 17 C80 10, 90 17, 91 27 C83 24, 76 25, 72 17 Z" /> : null}
      {showGuild ? <path className="ink-guild" d="M18 36 l4 -8 l4 8 M22 28 v14" /> : null}
      {showGuild ? <path className="ink-guild" d="M36 20 l3 -7 l3 7 M39 13 v12" /> : null}
    </svg>
  );
}

function ZoneAtlasInk({ zoneId }: { zoneId: string }) {
  if (zoneId === "saint-veyra") {
    return (
      <svg className="handdrawn-atlas zone-ink" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path className="ink-land" d="M16 56 C28 28, 62 18, 84 42 C79 68, 58 82, 28 76 C19 72, 12 66, 16 56 Z" />
        <path className="ink-road main-road" d="M18 62 C34 58, 48 50, 68 42 C75 39, 80 41, 84 46" />
        <path className="ink-road lower-road" d="M50 50 C47 39, 50 30, 57 22" />
        <path className="ink-cathedral" d="M49 39 l8 -18 l8 18 Z M53 39 v22 M61 39 v22" />
      </svg>
    );
  }

  return (
    <svg className="handdrawn-atlas zone-ink" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path className="ink-land" d="M8 58 C20 42, 35 31, 52 34 C68 37, 82 47, 92 64 C76 82, 48 86, 25 77 C15 73, 9 66, 8 58 Z" />
      <path className="ink-field" d="M17 60 C30 55, 45 53, 59 58 M18 66 C33 62, 48 62, 68 68 M23 49 C34 47, 43 48, 53 51" />
      <path className="ink-road main-road" d="M12 60 C27 58, 40 54, 52 49 C65 44, 78 42, 90 45" />
      <path className="ink-road lower-road" d="M52 49 C56 60, 61 69, 72 76" />
      <path className="ink-shrine" d="M69 40 l4 -9 l4 9 Z M71 40 v12 M75 40 v12" />
      <path className="ink-forest" d="M18 43 c-2 -4, 2 -8, 5 -3 c2 -4, 6 -2, 5 3 c-3 4 -7 4 -10 0 Z" />
      <path className="ink-hills" d="M74 75 l3 -5 l3 5 M81 74 l3 -5 l3 5" />
    </svg>
  );
}

function DungeonAtlasInk({ activeIndex }: { activeIndex: number }) {
  const rooms = [
    [12, 18],
    [27, 29],
    [42, 38],
    [55, 52],
    [42, 64],
    [70, 70],
    [86, 83]
  ];

  return (
    <svg className="handdrawn-atlas dungeon-ink" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path className="ink-cavern" d="M8 18 C22 8, 38 25, 50 34 C64 45, 54 63, 72 70 C84 75, 91 79, 92 89 C75 96, 62 84, 52 75 C41 66, 29 63, 24 50 C19 37, 2 31, 8 18 Z" />
      <path className="ink-road main-road" d="M12 18 C25 28, 36 31, 42 38 C50 46, 50 56, 42 64 C52 64, 61 68, 70 70 C75 75, 80 79, 86 83" />
      <path className="ink-hills" d="M52 51 l3 -5 l3 5 M58 54 l3 -5 l3 5" />
      {rooms.map(([x, y], index) => (
        <circle className={`ink-room ${index === activeIndex ? "active" : ""}`} cx={x} cy={y} r={index === 5 ? 4.8 : 3.2} key={`${x}-${y}`} />
      ))}
    </svg>
  );
}
