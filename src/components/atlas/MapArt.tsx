import {
  Bell,
  Castle,
  Church,
  DoorClosed,
  Factory,
  Flame,
  Landmark,
  Moon,
  MoonStar,
  Mountain,
  Skull,
  Sprout,
  Tent,
  TreePine,
  Trees,
  Waves as WavesIcon,
  Wheat,
  type LucideIcon
} from "lucide-react";
import pois from "../../data/pois.json";
import regionTopography from "../../data/regionTopography.json";

// SVG cartography for the living map plates, following the Waxlight rules in
// docs/UI_UX_GOALS.md: landmarks are medallion badges built from the same
// lucide icon set the client uses; organic rough filters touch terrain
// linework only, never icons or roads. Drawn in a 160x100 space matching the
// plate's 16:10 aspect; data coordinates (0-100) map through X()/Y().

interface RegionRow {
  id: string;
  zoneId: string;
  name: string;
  terrainType: string;
  x: number;
  y: number;
  locked: boolean;
  connections: string[];
}

const regions = regionTopography as RegionRow[];

const X = (x: number) => x * 1.6;
const Y = (y: number) => y;

const INK = "rgba(240, 228, 208, 0.66)";
const INK_DIM = "rgba(240, 228, 208, 0.34)";
const INK_FAINT = "rgba(240, 228, 208, 0.16)";
const WAX = "#d7a756";
const WAX_BRIGHT = "#e9bc6a";
const ASH = "rgba(168, 158, 176, 0.6)";
const BLOOD = "rgba(182, 58, 84, 0.75)";
const DISC = "#140d0a";

export function MapArtDefs({ idSuffix = "" }: { idSuffix?: string }) {
  return (
    <defs>
      <radialGradient id={`vellum${idSuffix}`} cx="40%" cy="32%" r="100%">
        <stop offset="0%" stopColor="#2e2118" />
        <stop offset="52%" stopColor="#241811" />
        <stop offset="100%" stopColor="#150e0a" />
      </radialGradient>
      <radialGradient id={`candlepool${idSuffix}`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(233, 188, 106, 0.6)" />
        <stop offset="50%" stopColor="rgba(215, 167, 86, 0.18)" />
        <stop offset="100%" stopColor="rgba(215, 167, 86, 0)" />
      </radialGradient>
      <radialGradient id={`dreadpool${idSuffix}`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(110, 26, 48, 0.42)" />
        <stop offset="100%" stopColor="rgba(110, 26, 48, 0)" />
      </radialGradient>
      <linearGradient id={`seaink${idSuffix}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#151a26" />
        <stop offset="100%" stopColor="#1a1622" />
      </linearGradient>
      <filter id={`vellumgrain${idSuffix}`} x="-2%" y="-2%" width="104%" height="104%">
        <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="4" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.85  0 0 0 0 0.74  0 0 0 0 0.55  0 0 0 0.045 0" result="t" />
        <feComposite in="t" in2="SourceGraphic" operator="over" />
      </filter>
      <filter id={`roughland${idSuffix}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="8" result="w" />
        <feDisplacementMap in="SourceGraphic" in2="w" scale="3.4" />
      </filter>
      <filter id={`roughline${idSuffix}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" seed="19" result="w" />
        <feDisplacementMap in="SourceGraphic" in2="w" scale="0.9" />
      </filter>
    </defs>
  );
}

/* --- medallions --------------------------------------------------- */

type MedallionState = "capital" | "open" | "locked" | "danger";

function Medallion({
  cx,
  cy,
  icon: Icon,
  state = "open",
  halo,
  r
}: {
  cx: number;
  cy: number;
  icon: LucideIcon;
  state?: MedallionState;
  halo?: string;
  r?: number;
}) {
  const radius = r ?? (state === "capital" ? 4.6 : state === "locked" ? 3 : 3.6);
  const ring = state === "locked" ? "rgba(150, 140, 158, 0.42)" : state === "danger" ? BLOOD : "rgba(215, 167, 86, 0.85)";
  const iconTone = state === "locked" ? ASH : state === "danger" ? "rgba(226, 141, 160, 0.9)" : WAX_BRIGHT;
  const iconSize = radius * 1.14;
  return (
    <g>
      {halo ? <circle cx={cx} cy={cy} r={radius * 2.6} fill={halo} opacity="0.55" /> : null}
      <circle cx={cx} cy={cy} r={radius} fill={DISC} stroke={ring} strokeWidth={state === "capital" ? 0.5 : 0.4} />
      <circle cx={cx} cy={cy} r={radius - 0.75} fill="none" stroke={ring} strokeWidth="0.16" opacity="0.75" />
      <Icon
        x={cx - iconSize / 2}
        y={cy - iconSize / 2}
        width={iconSize}
        height={iconSize}
        color={iconTone}
        strokeWidth={1.9}
        aria-hidden="true"
      />
    </g>
  );
}

const terrainIcon: Record<string, LucideIcon> = {
  capital: Church,
  fields: Wheat,
  woods: Trees,
  coast: WavesIcon,
  industrial: Factory,
  "cathedral-wood": TreePine,
  fen: Sprout,
  abbey: Landmark,
  vale: Moon,
  spires: Mountain,
  castle: Castle,
  mooncrypt: MoonStar,
  cathedral: Church,
  underground: DoorClosed
};

/* --- shared ornament ---------------------------------------------- */

function OrnateFrame() {
  return (
    <g fill="none">
      <rect x="1.6" y="1.2" width="156.8" height="97.6" stroke="rgba(215, 167, 86, 0.34)" strokeWidth="0.5" />
      <rect x="3.4" y="2.6" width="153.2" height="94.8" stroke="rgba(215, 167, 86, 0.16)" strokeWidth="0.3" />
      {[
        [3.4, 2.6],
        [156.6, 2.6],
        [3.4, 97.4],
        [156.6, 97.4]
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`} stroke="rgba(215, 167, 86, 0.4)" strokeWidth="0.3">
          <circle cx={cx} cy={cy} r="1.5" fill="#150e0a" />
          <path d={`M${cx} ${cy - 1.5} A0.75 0.75 0 0 1 ${cx} ${cy} A0.75 0.75 0 0 1 ${cx + 1.5} ${cy} M${cx} ${cy + 1.5} A0.75 0.75 0 0 1 ${cx} ${cy} A0.75 0.75 0 0 1 ${cx - 1.5} ${cy}`} />
        </g>
      ))}
    </g>
  );
}

function Cartouche({ x, y, w, title, sub }: { x: number; y: number; w: number; title: string; sub?: string }) {
  return (
    <g>
      <path
        d={`M${x} ${y} h${w} l2.2 2.6 l-2.2 ${sub ? 6.2 : 4.2} h-${w} l-2.2 -${sub ? 6.2 : 4.2} Z`}
        fill="rgba(14, 9, 7, 0.78)"
        stroke="rgba(215, 167, 86, 0.45)"
        strokeWidth="0.35"
      />
      <text
        x={x + w / 2}
        y={y + 3.4}
        textAnchor="middle"
        fill="rgba(233, 219, 200, 0.9)"
        fontSize="2.7"
        fontFamily="Cinzel, Georgia, serif"
        letterSpacing="0.4"
      >
        {title}
      </text>
      {sub ? (
        <text x={x + w / 2} y={y + 6.7} textAnchor="middle" fill="rgba(215, 167, 86, 0.75)" fontSize="1.9" fontFamily="EB Garamond, Georgia, serif" fontStyle="italic">
          {sub}
        </text>
      ) : null}
    </g>
  );
}

function WaveMark({ cx, cy, w = 6, tone = "rgba(126, 138, 162, 0.4)" }: { cx: number; cy: number; w?: number; tone?: string }) {
  return (
    <g stroke={tone} strokeWidth="0.28" fill="none" strokeLinecap="round">
      <path d={`M${cx - w / 2} ${cy} q${w / 4} -1.1 ${w / 2} 0 q${w / 4} 1.1 ${w / 2} 0`} />
      <path d={`M${cx - w / 3} ${cy + 1.6} q${w / 5} -0.9 ${w / 2.5} 0`} />
    </g>
  );
}

function Ridge({ cx, cy, scale = 1, tone = INK_DIM }: { cx: number; cy: number; scale?: number; tone?: string }) {
  const s = scale;
  return (
    <g stroke={tone} strokeWidth="0.32" fill="none" strokeLinecap="round" filter="none">
      <path d={`M${cx - 4 * s} ${cy + 1.6 * s} L${cx - 1.6 * s} ${cy - 3 * s} L${cx + 0.6 * s} ${cy + 1.6 * s}`} />
      <path d={`M${cx - 0.2 * s} ${cy + 1.6 * s} L${cx + 2.4 * s} ${cy - 4.4 * s} L${cx + 5 * s} ${cy + 1.6 * s}`} />
      <path d={`M${cx + 2.4 * s} ${cy - 4.4 * s} l0.8 1.7 m-0.35 -0.5 l0.8 1.8 m-0.35 -0.5 l0.8 1.8`} strokeWidth="0.2" opacity="0.7" />
    </g>
  );
}

/* --- world --------------------------------------------------------- */

export function WorldMapArt() {
  const byId = new Map(regions.map((entry) => [entry.id, entry]));
  const seen = new Set<string>();
  const routes = regions.flatMap((entry) =>
    entry.connections.flatMap((connectionId) => {
      const target = byId.get(connectionId);
      if (!target) return [];
      const key = [entry.id, target.id].sort().join(":");
      if (seen.has(key)) return [];
      seen.add(key);
      return [{ from: entry, to: target }];
    })
  );

  return (
    <svg className="living-map-art" viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden="true">
      <MapArtDefs idSuffix="-w" />
      <rect width="160" height="100" fill="url(#seaink-w)" />

      {/* landmass with rough vellum edge (terrain: rough allowed) */}
      <g filter="url(#roughland-w)">
        <path
          d="M-4 22 Q14 15 30 17 Q44 21 58 14 Q72 8 88 12 Q104 16 118 10 Q136 4 152 9 Q158 11 164 10 L164 104 L-4 104 Z"
          fill="url(#vellum-w)"
        />
      </g>
      <g fill="none" filter="url(#roughline-w)">
        <path d="M-4 22 Q14 15 30 17 Q44 21 58 14 Q72 8 88 12 Q104 16 118 10 Q136 4 152 9 Q158 11 164 10" stroke={INK} strokeWidth="0.5" />
        <path d="M-4 19.4 Q14 12.4 30 14.4 Q44 18.4 58 11.4 Q72 5.4 88 9.4 Q104 13.4 118 7.4 Q136 1.4 152 6.4" stroke={INK_FAINT} strokeWidth="0.35" />
      </g>
      <WaveMark cx={22} cy={7} />
      <WaveMark cx={78} cy={4.6} w={8} />
      <WaveMark cx={130} cy={6.4} />

      {/* the Veyra river (terrain: rough allowed) */}
      <g fill="none" filter="url(#roughline-w)">
        <path d="M47 16 Q42 26 36 32 Q28 41 39 50 Q48 57 44 68 Q41 76 48 86 Q52 93 49 100" stroke="rgba(89, 128, 138, 0.5)" strokeWidth="1.2" />
        <path d="M47 16 Q42 26 36 32 Q28 41 39 50 Q48 57 44 68 Q41 76 48 86 Q52 93 49 100" stroke="rgba(126, 168, 175, 0.35)" strokeWidth="0.35" />
      </g>

      {/* dread pools over the far gothic lands */}
      <ellipse cx="106" cy="86" rx="42" ry="15" fill="url(#dreadpool-w)" />
      <ellipse cx="138" cy="25" rx="26" ry="14" fill="url(#dreadpool-w)" opacity="0.8" />

      {/* ridge lines near the Bloodglass Spires (terrain) */}
      <Ridge cx={128} cy={13} scale={0.9} />
      <Ridge cx={148} cy={27} scale={0.7} />

      {/* pilgrim roads: clean dashes, no wobble */}
      <g fill="none" strokeLinecap="round">
        {routes.map((route) => {
          const open = !route.from.locked && !route.to.locked;
          const x1 = X(route.from.x);
          const y1 = Y(route.from.y);
          const x2 = X(route.to.x);
          const y2 = Y(route.to.y);
          const mx = (x1 + x2) / 2 + (y1 < y2 ? 3 : -3);
          const my = (y1 + y2) / 2;
          return (
            <path
              d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`}
              stroke={open ? "rgba(215, 167, 86, 0.55)" : "rgba(150, 140, 158, 0.18)"}
              strokeWidth={open ? 0.5 : 0.32}
              strokeDasharray={open ? "1.8 1.2" : "0.7 1.5"}
              key={`${route.from.id}-${route.to.id}`}
            />
          );
        })}
      </g>

      {/* candlelight over the playable first road */}
      <ellipse cx={X(27)} cy={Y(41)} rx="26" ry="13" fill="url(#candlepool-w)" opacity="0.5" />

      {/* region medallions: crisp, no filter */}
      {regions.map((region) => (
        <Medallion
          cx={X(region.x)}
          cy={Y(region.y)}
          icon={terrainIcon[region.terrainType] ?? Landmark}
          state={region.locked ? "locked" : region.terrainType === "capital" ? "capital" : "open"}
          halo={region.locked ? undefined : "url(#candlepool-w)"}
          key={region.id}
        />
      ))}

      {/* compass rose */}
      <g transform="translate(14, 82)" stroke={INK_DIM} strokeWidth="0.32" fill="none">
        <circle r="6" />
        <circle r="4.6" strokeWidth="0.2" />
        <path d="M0 -6 L1.3 -1.3 L6 0 L1.3 1.3 L0 6 L-1.3 1.3 L-6 0 L-1.3 -1.3 Z" fill="rgba(215, 167, 86, 0.16)" stroke={WAX} strokeWidth="0.3" />
        <path d="M-1.3 2 A1.7 1.7 0 0 1 1.3 2 L1.7 2.9 L-1.7 2.9 Z" stroke={WAX} strokeWidth="0.26" />
        <text x="0" y="-7.6" textAnchor="middle" fill="rgba(233, 219, 200, 0.75)" fontSize="2.4" fontFamily="Cinzel, Georgia, serif" stroke="none">
          N
        </text>
      </g>

      <Cartouche x={106} y={7} w={46} title="THE CONCORD LANDS" sub="as kept by the Roadwardens" />
      <OrnateFrame />
      <rect width="160" height="100" fill="transparent" filter="url(#vellumgrain-w)" opacity="0.9" />
    </svg>
  );
}

/* --- zones ---------------------------------------------------------- */

const poiIcon: Record<string, LucideIcon> = {
  "saint-veyra-capital": Bell,
  "hearthmere-crossing": Tent,
  "road-shrine-little-dawn": Flame,
  "pilgrim-trial-cryptlet": DoorClosed
};

export function ZoneMapArt({ zoneId }: { zoneId: string }) {
  const zonePois = pois.filter((poi) => poi.zoneId === zoneId);
  return (
    <svg className="living-map-art" viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden="true">
      <MapArtDefs idSuffix="-z" />
      <rect width="160" height="100" fill="url(#vellum-z)" />
      {zoneId === "saint-veyra" ? <SaintVeyraArt /> : <HearthmereArt />}
      {zonePois.map((poi) => (
        <Medallion
          cx={X(poi.x)}
          cy={Y(poi.y)}
          icon={poiIcon[poi.id] ?? Landmark}
          state={poi.id === "saint-veyra-capital" ? "capital" : "open"}
          halo="url(#candlepool-z)"
          key={poi.id}
        />
      ))}
      <OrnateFrame />
      <rect width="160" height="100" fill="transparent" filter="url(#vellumgrain-z)" opacity="0.9" />
    </svg>
  );
}

function SaintVeyraArt() {
  // The cathedral city, drawn with computed geometry: an oval wall with evenly
  // spaced towers, radial streets, axis-aligned district blocks, the Veyra
  // river and bridge carrying the Old Pilgrim Road east. The city centers on
  // the capital POI anchor so the medallion, label, and player marker align.
  const capital = pois.find((entry) => entry.id === "saint-veyra-capital");
  const cx = X(capital?.x ?? 26);
  const cy = Y(capital?.y ?? 44);
  const wallRx = 34;
  const wallRy = 30;
  const towers = Array.from({ length: 10 }, (_, index) => {
    const angle = (index / 10) * Math.PI * 2 - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * wallRx,
      y: cy + Math.sin(angle) * wallRy,
      isGate: index === 3 // east-southeast tower doubles as the pilgrim gate
    };
  });
  const gate = towers[3];

  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* the Veyra river with banks (terrain: rough allowed) */}
      <g filter="url(#roughline-z)">
        <path d="M118 -4 Q112 26 116 48 Q120 72 112 104" stroke="rgba(89, 128, 138, 0.5)" strokeWidth="3.4" />
        <path d="M118 -4 Q112 26 116 48 Q120 72 112 104" stroke="rgba(126, 168, 175, 0.4)" strokeWidth="0.4" />
        <path d="M113.6 -4 Q107.6 26 111.6 48 Q115.6 72 107.6 104" stroke={INK_FAINT} strokeWidth="0.3" />
        <path d="M122.4 -4 Q116.4 26 120.4 48 Q124.4 72 116.4 104" stroke={INK_FAINT} strokeWidth="0.3" />
      </g>
      <WaveMark cx={116} cy={20} w={4} tone="rgba(126, 168, 175, 0.3)" />
      <WaveMark cx={114} cy={68} w={4} tone="rgba(126, 168, 175, 0.3)" />

      {/* city wall: precise double ellipse with even towers */}
      <ellipse cx={cx} cy={cy} rx={wallRx} ry={wallRy} stroke={INK} strokeWidth="0.55" fill="rgba(240, 228, 208, 0.02)" />
      <ellipse cx={cx} cy={cy} rx={wallRx - 1.6} ry={wallRy - 1.6} stroke={INK_FAINT} strokeWidth="0.24" />
      {towers.map((tower, index) => (
        <rect
          x={tower.x - 1.2}
          y={tower.y - 1.2}
          width="2.4"
          height="2.4"
          fill={DISC}
          stroke={tower.isGate ? WAX : INK}
          strokeWidth={tower.isGate ? 0.5 : 0.38}
          key={index}
        />
      ))}

      {/* radial streets: uniform weight, stopping at the close */}
      <g stroke={INK_FAINT} strokeWidth="0.3">
        {Array.from({ length: 8 }, (_, index) => {
          const angle = (index / 8) * Math.PI * 2 - Math.PI / 2;
          const x1 = cx + Math.cos(angle) * 10;
          const y1 = cy + Math.sin(angle) * 9;
          const x2 = cx + Math.cos(angle) * (wallRx - 3.4);
          const y2 = cy + Math.sin(angle) * (wallRy - 3.4);
          return <path d={`M${x1} ${y1} L${x2} ${y2}`} key={index} />;
        })}
      </g>
      {/* ring street */}
      <ellipse cx={cx} cy={cy} rx={wallRx * 0.62} ry={wallRy * 0.62} stroke={INK_FAINT} strokeWidth="0.26" strokeDasharray="1.6 1.2" />

      {/* district blocks: axis-aligned, placed between radials */}
      <g>
        {[
          [-16, -14], [10, -17], [-21, 4], [15, 8], [-9, 15], [5, 16], [-2, -22], [19, -4]
        ].map(([dx, dy], index) => (
          <g key={index}>
            <rect x={cx + dx} y={cy + dy} width="6" height="4.4" stroke={INK_DIM} strokeWidth="0.3" fill="rgba(240, 228, 208, 0.045)" />
            <path d={`M${cx + dx + 0.6} ${cy + dy + 3.8} L${cx + dx + 5.4} ${cy + dy + 0.6}`} stroke={INK_FAINT} strokeWidth="0.18" />
          </g>
        ))}
      </g>

      {/* the cathedral close ring around the POI medallion */}
      <circle cx={cx} cy={cy} r="8.4" stroke="rgba(215, 167, 86, 0.4)" strokeWidth="0.3" strokeDasharray="0.7 1" />

      {/* the Old Pilgrim Road leaving the gate, bridging the Veyra */}
      <path d={`M${gate.x + 1.4} ${gate.y} Q104 ${gate.y + 3} 111 ${gate.y + 4.2}`} stroke="rgba(215, 167, 86, 0.55)" strokeWidth="0.5" strokeDasharray="1.8 1.2" />
      <path d={`M111 ${gate.y + 4.6} q4.5 -2 9 -0.6`} stroke={INK} strokeWidth="0.55" />
      <path d={`M112.6 ${gate.y + 5.4} v-1.6 M117.4 ${gate.y + 4.8} v-1.6`} stroke={INK_DIM} strokeWidth="0.3" />
      <path d={`M120 ${gate.y + 4.4} Q140 ${gate.y + 6} 160 ${gate.y + 8}`} stroke="rgba(215, 167, 86, 0.55)" strokeWidth="0.5" strokeDasharray="1.8 1.2" />

      {/* fields and copse outside the walls (terrain) */}
      <g stroke={INK_FAINT} strokeWidth="0.24">
        <path d="M132 24 h13 M132 27 h13 M132 30 h13" />
        <path d="M134 76 h13 M134 79 h13 M134 82 h13" />
      </g>

      <ellipse cx={cx} cy={cy - 2} rx="30" ry="20" fill="url(#candlepool-z)" opacity="0.35" />
      <Cartouche x={98} y={88} w={54} title="SAINT VEYRA" sub="cathedral seat of the Concord" />
    </g>
  );
}

function HearthmereArt() {
  // Field country between the capital gate and Little Dawn. POI anchors:
  // crossing (42,48) -> shrine (70,52) -> cryptlet stair (78,70).
  const crossX = X(42);
  const crossY = Y(48);
  const shrineX = X(70);
  const shrineY = Y(52);
  const cryptX = X(78);
  const cryptY = Y(70);
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* dawn fog on the horizon (terrain) */}
      <g stroke="rgba(150, 140, 158, 0.2)" strokeWidth="1.4" filter="url(#roughline-z)">
        <path d="M4 12 q22 -3 44 0 q22 3 44 0 q22 -3 44 0 q10 1.4 20 0.6" />
        <path d="M14 18 q20 -2.6 40 0 q20 2.6 40 0 q20 -2.6 40 0" strokeWidth="1" opacity="0.7" />
      </g>

      {/* field parcels: axis-aligned, even furrows */}
      <g>
        {[
          { x: 10, y: 28, w: 22, h: 13 },
          { x: 38, y: 22, w: 19, h: 11 },
          { x: 14, y: 60, w: 24, h: 14 },
          { x: 48, y: 64, w: 20, h: 12 },
          { x: 86, y: 24, w: 22, h: 12 },
          { x: 96, y: 70, w: 20, h: 12 },
          { x: 126, y: 30, w: 20, h: 12 }
        ].map((plot, index) => (
          <g key={index}>
            <rect x={plot.x} y={plot.y} width={plot.w} height={plot.h} stroke={INK_FAINT} strokeWidth="0.3" />
            {Array.from({ length: 4 }, (_, row) => (
              <path
                d={`M${plot.x + 1.2} ${plot.y + 2 + (row * (plot.h - 3.4)) / 3} h${plot.w - 2.4}`}
                stroke="rgba(215, 167, 86, 0.16)"
                strokeWidth="0.24"
                key={row}
              />
            ))}
          </g>
        ))}
      </g>

      {/* low stone walls (terrain: rough allowed) */}
      <g stroke={INK_DIM} strokeWidth="0.34" strokeDasharray="1.3 0.9" filter="url(#roughline-z)">
        <path d="M8 46 Q30 43 40 45" />
        <path d="M84 40 Q98 37 112 40" />
        <path d="M70 78 Q88 74 104 78" />
      </g>

      {/* the Old Pilgrim Road: clean wax dashes with milestones */}
      <path
        d={`M0 ${Y(45)} Q${X(20)} ${Y(46)} ${crossX} ${crossY} Q${X(56)} ${Y(50)} ${shrineX} ${shrineY} Q${X(74)} ${Y(58)} ${cryptX} ${cryptY}`}
        stroke="rgba(215, 167, 86, 0.55)"
        strokeWidth="0.55"
        strokeDasharray="2 1.3"
      />
      {[[X(14), Y(45.4)], [X(30), Y(46.6)], [X(56), Y(50.4)]].map(([mx, my]) => (
        <path d={`M${mx} ${my - 1.2} v1.6`} stroke={INK} strokeWidth="0.45" key={`${mx}`} />
      ))}

      {/* shrine hill contours + candle rail (terrain contours rough-allowed) */}
      <g filter="url(#roughline-z)">
        <ellipse cx={shrineX} cy={shrineY - 1} rx="15" ry="8.4" stroke={INK_FAINT} strokeWidth="0.28" />
        <ellipse cx={shrineX} cy={shrineY - 1.6} rx="10.4" ry="5.6" stroke={INK_FAINT} strokeWidth="0.28" />
      </g>
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        const fx = shrineX + Math.cos(angle) * 6.2;
        const fy = shrineY + Math.sin(angle) * 3.4;
        return <circle cx={fx} cy={fy} r="0.28" fill="rgba(233, 188, 106, 0.8)" key={index} />;
      })}

      {/* wolf trail pawprints north of the road (terrain detail) */}
      <g fill="rgba(150, 140, 158, 0.55)">
        {[[52, 30], [57, 28.4], [62, 29.6], [67, 27.8], [72, 29]].map(([px, py]) => (
          <g key={px}>
            <circle cx={px} cy={py} r="0.45" />
            <circle cx={px - 0.7} cy={py - 0.8} r="0.2" />
            <circle cx={px} cy={py - 1} r="0.2" />
            <circle cx={px + 0.7} cy={py - 0.8} r="0.2" />
          </g>
        ))}
      </g>

      <ellipse cx={shrineX} cy={shrineY} rx="20" ry="11" fill="url(#candlepool-z)" opacity="0.45" />
      <Cartouche x={94} y={88} w={58} title="HEARTHMERE FIELDS" sub="the Old Pilgrim Road to Little Dawn" />
    </g>
  );
}

/* --- dungeon --------------------------------------------------------- */

const dungeonRoomArt: Record<string, { x: number; y: number; w: number; h: number }> = {
  "shrine-descent": { x: 13, y: 34, w: 11, h: 12 },
  "hall-threaded-names": { x: 35, y: 40, w: 13, h: 10 },
  "broken-bell-niche": { x: 50, y: 37, w: 9, h: 9 },
  "pilgrim-bone-walk": { x: 57, y: 53, w: 10, h: 13 },
  "candleless-alcove": { x: 49, y: 69, w: 9, h: 9 },
  "warden-chamber": { x: 79, y: 42, w: 14, h: 15 },
  "road-seal-exit": { x: 82, y: 73, w: 10, h: 9 }
};

export function DungeonMapArt({ activeRoomId }: { activeRoomId?: string; clearedEncounterIds?: string[] }) {
  return (
    <svg className="living-map-art" viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden="true">
      <MapArtDefs idSuffix="-d" />
      <rect width="160" height="100" fill="url(#vellum-d)" />
      <rect width="160" height="100" fill="rgba(9, 8, 15, 0.5)" />

      {/* corridors: clean double-walled passages */}
      <g fill="none" strokeLinecap="round">
        {[
          "M20.8 34 C35.2 38, 44.8 40, 56 40",
          "M56 40 C67.2 39, 73.6 37, 80 37",
          "M80 37 C88 42, 91.2 48, 91.2 53",
          "M91.2 53 C86.4 60, 83.2 65, 78.4 69",
          "M91.2 53 C102.4 49, 115.2 45, 126.4 42",
          "M126.4 42 C128 53, 129.6 64, 131.2 73"
        ].map((d) => (
          <g key={d}>
            <path d={d} stroke="rgba(14, 9, 7, 0.9)" strokeWidth="4.6" />
            <path d={d} stroke={INK_DIM} strokeWidth="0.32" transform="translate(0 -2.6)" />
            <path d={d} stroke={INK_DIM} strokeWidth="0.32" transform="translate(0 2.6)" />
          </g>
        ))}
      </g>

      {/* chambers: precise double-stroked stone rooms */}
      {Object.entries(dungeonRoomArt).map(([roomId, room]) => {
        const isBoss = roomId === "warden-chamber";
        const isExit = roomId === "road-seal-exit";
        const active = roomId === activeRoomId;
        const rx = room.x * 1.6;
        const rw = room.w * 1.6;
        return (
          <g key={roomId}>
            <rect
              x={rx - rw / 2}
              y={room.y - room.h / 2}
              width={rw}
              height={room.h}
              fill={active ? "rgba(215, 167, 86, 0.13)" : "rgba(16, 10, 8, 0.92)"}
              stroke={isBoss ? BLOOD : active ? WAX : INK_DIM}
              strokeWidth={isBoss || active ? 0.55 : 0.42}
            />
            <rect
              x={rx - rw / 2 + 1.1}
              y={room.y - room.h / 2 + 1.1}
              width={rw - 2.2}
              height={room.h - 2.2}
              fill="none"
              stroke={INK_FAINT}
              strokeWidth="0.22"
            />
            {roomId === "shrine-descent" ? (
              <path d={`M${rx - 2.8} ${room.y - 2} h5.6 M${rx - 2.2} ${room.y - 0.5} h4.4 M${rx - 1.6} ${room.y + 1} h3.2 M${rx - 1} ${room.y + 2.5} h2`} stroke={INK_DIM} strokeWidth="0.32" fill="none" />
            ) : null}
            {roomId === "broken-bell-niche" ? (
              <Bell x={rx - 1.6} y={room.y - 1.6} width={3.2} height={3.2} color="rgba(215, 167, 86, 0.75)" strokeWidth={1.9} aria-hidden="true" />
            ) : null}
            {roomId === "pilgrim-bone-walk" ? (
              <g fill={INK_FAINT}>
                <circle cx={rx - 2} cy={room.y - 1} r="0.34" />
                <circle cx={rx + 1.6} cy={room.y + 2} r="0.3" />
                <circle cx={rx + 0.4} cy={room.y - 3} r="0.26" />
              </g>
            ) : null}
            {isBoss ? <Medallion cx={rx + rw / 2 - 0.6} cy={room.y - room.h / 2 + 0.6} icon={Skull} state="danger" r={2.4} /> : null}
            {isExit ? <Medallion cx={rx + rw / 2 - 0.6} cy={room.y - room.h / 2 + 0.6} icon={Bell} state="open" r={2.2} /> : null}
          </g>
        );
      })}

      {/* candles along the walk */}
      <g fill="rgba(233, 188, 106, 0.85)">
        <circle cx="38.4" cy="37.6" r="0.55" />
        <circle cx="68.8" cy="38.4" r="0.55" />
        <circle cx="86.4" cy="45" r="0.55" />
        <circle cx="108.8" cy="47.6" r="0.55" />
      </g>
      {activeRoomId && dungeonRoomArt[activeRoomId] ? (
        <ellipse
          cx={dungeonRoomArt[activeRoomId].x * 1.6}
          cy={dungeonRoomArt[activeRoomId].y}
          rx="15"
          ry="9.4"
          fill="url(#candlepool-d)"
          opacity="0.6"
        />
      ) : null}

      <Cartouche x={6} y={6} w={58} title="PILGRIM TRIAL CRYPTLET" sub="beneath the Road Shrine of Little Dawn" />
      <OrnateFrame />
      <rect width="160" height="100" fill="transparent" filter="url(#vellumgrain-d)" opacity="0.85" />
    </svg>
  );
}

/* --- overlays ---------------------------------------------------------- */

export function PlayerMarker({ poiId }: { poiId: string }) {
  const poi = pois.find((entry) => entry.id === poiId);
  if (!poi) {
    return null;
  }
  return (
    <svg className="living-map-art living-map-overlay" viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden="true">
      <circle cx={X(poi.x)} cy={Y(poi.y)} r="1.7" fill={WAX_BRIGHT} className="player-marker-core" />
      <circle cx={X(poi.x)} cy={Y(poi.y)} r="3.4" fill="none" stroke="rgba(233, 188, 106, 0.7)" strokeWidth="0.4" className="player-marker-pulse" />
    </svg>
  );
}
