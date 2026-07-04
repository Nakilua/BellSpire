import pois from "../../data/pois.json";
import regionTopography from "../../data/regionTopography.json";

// Hand-authored SVG cartography for the living map plates. Drawn in a
// 160x100 coordinate space matching the plate's 16:10 aspect so shapes stay
// undistorted; data coordinates (0-100 percent) are mapped through X()/Y().
// Region and POI placement comes from the same source-governed JSON the rest
// of the game reads; only the ink is hand-authored.

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
const BLOOD = "rgba(182, 58, 84, 0.7)";

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
      <filter id={`roughink${idSuffix}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="4" seed="19" result="w" />
        <feDisplacementMap in="SourceGraphic" in2="w" scale="1.1" />
      </filter>
      <filter id={`roughland${idSuffix}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="8" result="w" />
        <feDisplacementMap in="SourceGraphic" in2="w" scale="3.4" />
      </filter>
    </defs>
  );
}

function OrnateFrame() {
  return (
    <g fill="none">
      <rect x="1.6" y="1.2" width="156.8" height="97.6" stroke="rgba(215, 167, 86, 0.34)" strokeWidth="0.5" />
      <rect x="3.4" y="2.6" width="153.2" height="94.8" stroke="rgba(215, 167, 86, 0.16)" strokeWidth="0.3" />
      {/* corner quatrefoils */}
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

/* --- cartographic vocabulary ---------------------------------- */

function Mountains({ cx, cy, scale = 1, tone = INK }: { cx: number; cy: number; scale?: number; tone?: string }) {
  // hachured twin peaks
  const s = scale;
  return (
    <g stroke={tone} strokeWidth="0.32" fill="none" strokeLinecap="round">
      <path d={`M${cx - 4 * s} ${cy + 1.6 * s} L${cx - 1.6 * s} ${cy - 3 * s} L${cx + 0.6 * s} ${cy + 1.6 * s}`} />
      <path d={`M${cx - 0.2 * s} ${cy + 1.6 * s} L${cx + 2.4 * s} ${cy - 4.4 * s} L${cx + 5 * s} ${cy + 1.6 * s}`} />
      {/* shading hachures on the east faces */}
      <path d={`M${cx - 1.6 * s} ${cy - 3 * s} l0.7 1.4 m-0.3 -0.4 l0.7 1.5 m-0.3 -0.4 l0.7 1.5`} strokeWidth="0.2" opacity="0.7" />
      <path d={`M${cx + 2.4 * s} ${cy - 4.4 * s} l0.8 1.7 m-0.35 -0.5 l0.8 1.8 m-0.35 -0.5 l0.8 1.8 m-0.35 -0.5 l0.7 1.6`} strokeWidth="0.2" opacity="0.7" />
    </g>
  );
}

function Trees({ cx, cy, spread = 1, count = 5, tone = INK_DIM }: { cx: number; cy: number; spread?: number; count?: number; tone?: string }) {
  // round-cap forest cluster, medieval style
  const offsets = [
    [0, 0], [-3.2, 1.4], [3, 1.2], [-1.6, -1.8], [1.8, -1.6], [-4.6, -0.4], [4.4, -0.2], [0.2, 2.6]
  ].slice(0, count);
  return (
    <g stroke={tone} strokeWidth="0.3" fill="none">
      {offsets.map(([dx, dy], index) => (
        <g key={index}>
          <path d={`M${cx + dx * spread} ${cy + dy * spread} m-1.1 0 a1.1 1.15 0 1 1 2.2 0`} />
          <path d={`M${cx + dx * spread} ${cy + dy * spread} v1.5`} />
        </g>
      ))}
    </g>
  );
}

function Waves({ cx, cy, w = 6, tone = "rgba(126, 138, 162, 0.4)" }: { cx: number; cy: number; w?: number; tone?: string }) {
  return (
    <g stroke={tone} strokeWidth="0.28" fill="none" strokeLinecap="round">
      <path d={`M${cx - w / 2} ${cy} q${w / 4} -1.1 ${w / 2} 0 q${w / 4} 1.1 ${w / 2} 0`} />
      <path d={`M${cx - w / 3} ${cy + 1.6} q${w / 5} -0.9 ${w / 2.5} 0`} />
    </g>
  );
}

function Steeple({ cx, cy, scale = 1, tone = INK, crossTone = WAX }: { cx: number; cy: number; scale?: number; tone?: string; crossTone?: string }) {
  const s = scale;
  return (
    <g stroke={tone} strokeWidth="0.34" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M${cx - 1.5 * s} ${cy + 1.8 * s} L${cx - 1.5 * s} ${cy - 1.4 * s} L${cx} ${cy - 3.4 * s} L${cx + 1.5 * s} ${cy - 1.4 * s} L${cx + 1.5 * s} ${cy + 1.8 * s} Z`} />
      <path d={`M${cx} ${cy - 3.4 * s} L${cx} ${cy - 4.7 * s} M${cx - 0.65 * s} ${cy - 4.1 * s} L${cx + 0.65 * s} ${cy - 4.1 * s}`} stroke={crossTone} />
      <path d={`M${cx} ${cy + 1.8 * s} L${cx} ${cy + 0.6 * s}`} strokeWidth="0.24" opacity="0.7" />
    </g>
  );
}

function Keep({ cx, cy, scale = 1, tone = INK }: { cx: number; cy: number; scale?: number; tone?: string }) {
  const s = scale;
  return (
    <g stroke={tone} strokeWidth="0.34" fill="none" strokeLinejoin="round">
      <path
        d={`M${cx - 2.4 * s} ${cy + 1.6 * s} L${cx - 2.4 * s} ${cy - 1.8 * s} L${cx - 1.7 * s} ${cy - 1.8 * s} L${cx - 1.7 * s} ${cy - 1.1 * s} L${cx - 0.7 * s} ${cy - 1.1 * s} L${cx - 0.7 * s} ${cy - 1.8 * s} L${cx + 0.7 * s} ${cy - 1.8 * s} L${cx + 0.7 * s} ${cy - 1.1 * s} L${cx + 1.7 * s} ${cy - 1.1 * s} L${cx + 1.7 * s} ${cy - 1.8 * s} L${cx + 2.4 * s} ${cy - 1.8 * s} L${cx + 2.4 * s} ${cy + 1.6 * s} Z`}
      />
      <path d={`M${cx - 0.5 * s} ${cy + 1.6 * s} L${cx - 0.5 * s} ${cy + 0.2 * s} A0.5 0.55 0 0 1 ${cx + 0.5 * s} ${cy + 0.2 * s} L${cx + 0.5 * s} ${cy + 1.6 * s}`} strokeWidth="0.26" />
    </g>
  );
}

function CryptArch({ cx, cy, scale = 1, tone = INK }: { cx: number; cy: number; scale?: number; tone?: string }) {
  const s = scale;
  return (
    <g stroke={tone} strokeWidth="0.34" fill="none">
      <path d={`M${cx - 1.9 * s} ${cy + 1.4 * s} L${cx - 1.9 * s} ${cy - 0.4 * s} A1.9 2 0 0 1 ${cx + 1.9 * s} ${cy - 0.4 * s} L${cx + 1.9 * s} ${cy + 1.4 * s}`} />
      <path d={`M${cx - 0.8 * s} ${cy + 1.4 * s} L${cx - 0.8 * s} ${cy + 0.2 * s} A0.8 0.9 0 0 1 ${cx + 0.8 * s} ${cy + 0.2 * s} L${cx + 0.8 * s} ${cy + 1.4 * s}`} strokeWidth="0.24" opacity="0.8" />
      <path d={`M${cx - 2.6 * s} ${cy + 1.4 * s} h${5.2 * s}`} strokeWidth="0.26" />
    </g>
  );
}

function Marsh({ cx, cy, tone = INK_DIM }: { cx: number; cy: number; tone?: string }) {
  return (
    <g stroke={tone} strokeWidth="0.28" fill="none" strokeLinecap="round">
      <path d={`M${cx - 3.4} ${cy} h2.2 M${cx - 0.4} ${cy} h2.6 M${cx - 2.2} ${cy + 1.4} h2.4 M${cx + 1} ${cy + 1.4} h1.8 M${cx - 1} ${cy + 2.8} h2`} />
      <path d={`M${cx} ${cy - 0.8} v-1.8 m-0.8 1.8 l-0.3 -1.3 m1.9 1.3 l0.3 -1.3`} />
    </g>
  );
}

function Moon({ cx, cy, scale = 1, tone = INK }: { cx: number; cy: number; scale?: number; tone?: string }) {
  const s = scale;
  return (
    <path
      d={`M${cx + 1.6 * s} ${cy - 1.2 * s} a2 2 0 1 0 -2.2 3 a1.55 1.55 0 1 1 2.2 -3`}
      stroke={tone}
      strokeWidth="0.32"
      fill="none"
    />
  );
}

function terrainMark(region: RegionRow) {
  const cx = X(region.x);
  const cy = Y(region.y);
  const tone = region.locked ? INK_DIM : INK;
  switch (region.terrainType) {
    case "capital":
      return (
        <g key={region.id}>
          <Steeple cx={cx} cy={cy - 0.6} scale={1.15} tone={INK} />
          <Keep cx={cx - 4.6} cy={cy + 0.8} scale={0.7} tone={INK_DIM} />
          <Keep cx={cx + 4.6} cy={cy + 0.8} scale={0.7} tone={INK_DIM} />
        </g>
      );
    case "fields":
      return (
        <g key={region.id} stroke={tone} strokeWidth="0.26" fill="none" strokeLinecap="round">
          <path d={`M${cx - 4.4} ${cy + 0.4} h3 M${cx - 4.4} ${cy + 1.5} h3 M${cx + 1.4} ${cy + 0.4} h3 M${cx + 1.4} ${cy + 1.5} h3`} />
          <path d={`M${cx - 0.3} ${cy + 0.8} v-2.2 m-0.9 2.2 l-0.35 -1.7 m2.15 1.7 l0.35 -1.7`} />
        </g>
      );
    case "woods":
      return <Trees key={region.id} cx={cx} cy={cy} tone={tone} />;
    case "coast":
      return <Waves key={region.id} cx={cx} cy={cy} tone={region.locked ? "rgba(126, 138, 162, 0.3)" : "rgba(126, 138, 162, 0.5)"} />;
    case "industrial":
      return (
        <g key={region.id} stroke={tone} strokeWidth="0.32" fill="none">
          <path d={`M${cx - 2.4} ${cy + 1.4} v-2.6 h1.7 v2.6 M${cx + 0.6} ${cy + 1.4} v-4.4 h1.3 v4.4`} />
          <path d={`M${cx + 1.25} ${cy - 4.9} q0.9 -0.7 0.5 -1.6`} strokeWidth="0.24" strokeDasharray="0.5 0.55" />
          <path d={`M${cx - 3} ${cy + 1.4} h6.4`} strokeWidth="0.26" />
        </g>
      );
    case "cathedral-wood":
      return (
        <g key={region.id}>
          <Trees cx={cx - 3.4} cy={cy + 0.4} count={3} spread={0.8} tone={INK_DIM} />
          <Steeple cx={cx + 2.4} cy={cy} scale={0.95} tone={tone} />
        </g>
      );
    case "fen":
      return <Marsh key={region.id} cx={cx} cy={cy} tone={tone} />;
    case "abbey":
      return (
        <g key={region.id}>
          <Steeple cx={cx} cy={cy} scale={0.9} tone={tone} />
          <path d={`M${cx - 3} ${cy + 1.8} h6`} stroke={tone} strokeWidth="0.26" fill="none" />
        </g>
      );
    case "vale":
      return (
        <g key={region.id}>
          <path d={`M${cx - 4.4} ${cy + 0.6} q2 -3.4 4.4 0 q2.4 3.2 4.4 0`} stroke={tone} strokeWidth="0.32" fill="none" />
          <Moon cx={cx + 0.2} cy={cy - 2.6} scale={0.65} tone={BLOOD} />
        </g>
      );
    case "spires":
      return (
        <g key={region.id} stroke={tone} strokeWidth="0.32" fill="none">
          <path d={`M${cx - 3} ${cy + 1.6} L${cx - 1.7} ${cy - 3.2} L${cx - 0.5} ${cy + 1.6}`} />
          <path d={`M${cx + 0.5} ${cy + 1.6} L${cx + 1.8} ${cy - 4.6} L${cx + 3} ${cy + 1.6}`} stroke={BLOOD} />
          <path d={`M${cx - 1.7} ${cy - 3.2} l0.5 1.2 m-0.2 -0.3 l0.5 1.2`} strokeWidth="0.2" opacity="0.7" />
        </g>
      );
    case "castle":
      return <Keep key={region.id} cx={cx} cy={cy} scale={1.25} tone={tone} />;
    case "mooncrypt":
      return (
        <g key={region.id}>
          <CryptArch cx={cx} cy={cy + 0.6} scale={0.85} tone={tone} />
          <Moon cx={cx + 2.8} cy={cy - 2.4} scale={0.55} tone={tone} />
        </g>
      );
    case "cathedral":
      return <Steeple key={region.id} cx={cx} cy={cy} scale={1.2} tone={tone} />;
    case "underground":
      return <CryptArch key={region.id} cx={cx} cy={cy} scale={1.05} tone={tone} />;
    default:
      return <circle key={region.id} cx={cx} cy={cy} r="1.1" stroke={tone} fill="none" strokeWidth="0.3" />;
  }
}

/* --- world ------------------------------------------------------ */

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

      {/* landmass with rough vellum edge */}
      <g filter="url(#roughland-w)">
        <path
          d="M-4 22 Q14 15 30 17 Q44 21 58 14 Q72 8 88 12 Q104 16 118 10 Q136 4 152 9 Q158 11 164 10 L164 104 L-4 104 Z"
          fill="url(#vellum-w)"
        />
      </g>
      {/* triple coastline strokes */}
      <g fill="none" filter="url(#roughink-w)">
        <path d="M-4 22 Q14 15 30 17 Q44 21 58 14 Q72 8 88 12 Q104 16 118 10 Q136 4 152 9 Q158 11 164 10" stroke={INK} strokeWidth="0.5" />
        <path d="M-4 19.4 Q14 12.4 30 14.4 Q44 18.4 58 11.4 Q72 5.4 88 9.4 Q104 13.4 118 7.4 Q136 1.4 152 6.4" stroke={INK_FAINT} strokeWidth="0.35" />
        <path d="M-4 17 Q14 10 30 12 Q44 16 58 9 Q72 3 88 7 Q104 11 118 5" stroke="rgba(126, 138, 162, 0.28)" strokeWidth="0.3" />
      </g>
      {/* coastal stipple shading on the land side */}
      <g fill={INK_FAINT}>
        {[8, 20, 34, 47, 62, 76, 92, 108, 124, 140].map((sx, index) => (
          <g key={sx}>
            <circle cx={sx} cy={23 - (index % 3)} r="0.22" />
            <circle cx={sx + 4} cy={24.6 - (index % 2)} r="0.18" />
            <circle cx={sx + 8} cy={23.8} r="0.15" />
          </g>
        ))}
      </g>
      <Waves cx={22} cy={7} />
      <Waves cx={78} cy={4.6} w={8} />
      <Waves cx={130} cy={6.4} />

      {/* the Veyra river */}
      <g fill="none" filter="url(#roughink-w)">
        <path d="M47 16 Q42 26 36 32 Q28 41 39 50 Q48 57 44 68 Q41 76 48 86 Q52 93 49 100" stroke="rgba(89, 128, 138, 0.5)" strokeWidth="1.2" />
        <path d="M47 16 Q42 26 36 32 Q28 41 39 50 Q48 57 44 68 Q41 76 48 86 Q52 93 49 100" stroke="rgba(126, 168, 175, 0.35)" strokeWidth="0.35" />
      </g>

      {/* dread pools over the far gothic lands */}
      <ellipse cx="106" cy="86" rx="42" ry="15" fill="url(#dreadpool-w)" />
      <ellipse cx="138" cy="25" rx="26" ry="14" fill="url(#dreadpool-w)" opacity="0.8" />

      {/* ridge line near the Bloodglass Spires */}
      <Mountains cx={128} cy={13} scale={0.9} tone={INK_DIM} />
      <Mountains cx={148} cy={24} scale={0.75} tone={INK_DIM} />

      {/* pilgrim roads */}
      <g fill="none" strokeLinecap="round" filter="url(#roughink-w)">
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
              stroke={open ? "rgba(215, 167, 86, 0.6)" : "rgba(150, 140, 158, 0.2)"}
              strokeWidth={open ? 0.55 : 0.35}
              strokeDasharray={open ? "2 1.3" : "0.8 1.6"}
              key={`${route.from.id}-${route.to.id}`}
            />
          );
        })}
      </g>

      {/* terrain marks per region */}
      <g filter="url(#roughink-w)">{regions.map((region) => terrainMark(region))}</g>

      {/* candlelight over the playable first road */}
      <ellipse cx={X(27)} cy={Y(41)} rx="26" ry="13" fill="url(#candlepool-w)" opacity="0.55" />

      {/* compass rose */}
      <g transform="translate(14, 82)" stroke={INK_DIM} strokeWidth="0.32" fill="none" filter="url(#roughink-w)">
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

/* --- zones ------------------------------------------------------ */

export function ZoneMapArt({ zoneId }: { zoneId: string }) {
  return (
    <svg className="living-map-art" viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden="true">
      <MapArtDefs idSuffix="-z" />
      <rect width="160" height="100" fill="url(#vellum-z)" />
      {zoneId === "saint-veyra" ? <SaintVeyraArt /> : <HearthmereArt />}
      <OrnateFrame />
      <rect width="160" height="100" fill="transparent" filter="url(#vellumgrain-z)" opacity="0.9" />
    </svg>
  );
}

function CityBlock({ x, y, w, h, tilt = 0 }: { x: number; y: number; w: number; h: number; tilt?: number }) {
  return (
    <g transform={`rotate(${tilt} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x} y={y} width={w} height={h} stroke={INK_DIM} strokeWidth="0.3" fill="rgba(240, 228, 208, 0.045)" />
      {/* roof hatching */}
      <path d={`M${x + 0.5} ${y + h - 0.4} L${x + w - 0.4} ${y + 0.5}`} stroke={INK_FAINT} strokeWidth="0.2" />
    </g>
  );
}

function SaintVeyraArt() {
  // The cathedral city: a walled oval on the west bank of the Veyra, the
  // cathedral close at heart, districts hatched between radial streets,
  // the east gate opening onto the Old Pilgrim Road. POI anchor: (12,28).
  const cx = X(24);
  const cy = Y(46);
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* the Veyra river with banks */}
      <g filter="url(#roughink-z)">
        <path d="M118 -4 Q112 26 116 48 Q120 72 112 104" stroke="rgba(89, 128, 138, 0.5)" strokeWidth="3.4" />
        <path d="M118 -4 Q112 26 116 48 Q120 72 112 104" stroke="rgba(126, 168, 175, 0.4)" strokeWidth="0.4" />
        <path d="M114 -4 Q108 26 112 48 Q116 72 108 104" stroke={INK_FAINT} strokeWidth="0.3" />
        <path d="M122 -4 Q116 26 120 48 Q124 72 116 104" stroke={INK_FAINT} strokeWidth="0.3" />
      </g>
      <Waves cx={116} cy={20} w={4} tone="rgba(126, 168, 175, 0.3)" />
      <Waves cx={114} cy={64} w={4} tone="rgba(126, 168, 175, 0.3)" />

      {/* city wall: irregular oval with towers */}
      <g filter="url(#roughink-z)">
        <path
          d={`M${cx} ${cy - 34} Q${cx + 30} ${cy - 30} ${cx + 36} ${cy - 6} Q${cx + 39} ${cy + 14} ${cx + 22} ${cy + 27} Q${cx + 2} ${cy + 37} ${cx - 20} ${cy + 26} Q${cx - 36} ${cy + 14} ${cx - 33} ${cy - 10} Q${cx - 29} ${cy - 30} ${cx} ${cy - 34} Z`}
          stroke={INK}
          strokeWidth="0.55"
          fill="rgba(240, 228, 208, 0.02)"
        />
        {/* wall towers */}
        {[
          [cx, cy - 34], [cx + 36, cy - 6], [cx + 22, cy + 27], [cx - 20, cy + 26], [cx - 33, cy - 10]
        ].map(([tx, ty]) => (
          <rect key={`${tx}${ty}`} x={tx - 1.3} y={ty - 1.3} width="2.6" height="2.6" stroke={INK} strokeWidth="0.4" fill="#1a120d" />
        ))}
        {/* east gate */}
        <path d={`M${cx + 35.4} ${cy + 3} l4.4 0.6`} stroke={WAX} strokeWidth="0.5" />
        <path d={`M${cx + 34.6} ${cy + 1} h2.4 v4.4 h-2.4`} stroke={INK} strokeWidth="0.45" fill="#1a120d" />
      </g>

      {/* radial streets */}
      <g stroke={INK_FAINT} strokeWidth="0.32" filter="url(#roughink-z)">
        <path d={`M${cx} ${cy - 33} L${cx} ${cy - 9}`} />
        <path d={`M${cx} ${cy + 9} L${cx} ${cy + 35}`} />
        <path d={`M${cx - 32} ${cy - 2} L${cx - 9} ${cy - 1}`} />
        <path d={`M${cx + 9} ${cy + 1} L${cx + 36} ${cy + 3}`} stroke="rgba(215, 167, 86, 0.4)" strokeDasharray="1.4 1" />
        <path d={`M${cx - 24} ${cy - 22} L${cx - 7} ${cy - 7}`} />
        <path d={`M${cx + 24} ${cy - 22} L${cx + 7} ${cy - 7}`} />
        <path d={`M${cx - 22} ${cy + 21} L${cx - 7} ${cy + 7}`} />
        <path d={`M${cx + 20} ${cy + 22} L${cx + 7} ${cy + 7}`} />
      </g>

      {/* district blocks */}
      <g filter="url(#roughink-z)">
        <CityBlock x={cx - 20} y={cy - 20} w={6} h={4.4} tilt={-8} />
        <CityBlock x={cx + 12} y={cy - 21} w={5.4} h={4.6} tilt={7} />
        <CityBlock x={cx - 26} y={cy + 4} w={6.4} h={4.2} tilt={4} />
        <CityBlock x={cx + 16} y={cy + 8} w={6} h={4.6} tilt={-5} />
        <CityBlock x={cx - 10} y={cy + 16} w={5.2} h={4} tilt={-10} />
        <CityBlock x={cx + 4} y={cy + 17} w={5.6} h={4.2} tilt={6} />
        <CityBlock x={cx - 6} y={cy - 26} w={5} h={4} tilt={3} />
      </g>

      {/* the cathedral close */}
      <g filter="url(#roughink-z)">
        <circle cx={cx} cy={cy} r="8.6" stroke="rgba(215, 167, 86, 0.4)" strokeWidth="0.35" strokeDasharray="0.7 1" />
        <Steeple cx={cx} cy={cy} scale={1.7} tone={INK} />
        <path d={`M${cx - 5.4} ${cy + 3.4} h10.8`} stroke={INK_DIM} strokeWidth="0.3" />
      </g>

      {/* the Old Pilgrim Road heading east over the bridge */}
      <g filter="url(#roughink-z)">
        <path d={`M${cx + 40} ${cy + 3.6} Q128 ${cy + 6} 160 ${cy + 10}`} stroke="rgba(215, 167, 86, 0.55)" strokeWidth="0.55" strokeDasharray="2 1.3" />
        {/* bridge over the Veyra */}
        <path d={`M112 ${cy + 6.4} q4 -1.8 8 -0.4`} stroke={INK} strokeWidth="0.55" />
        <path d={`M113.5 ${cy + 7.6} v-1.4 M117.5 ${cy + 7} v-1.4`} stroke={INK_DIM} strokeWidth="0.3" />
      </g>

      {/* fields outside the walls */}
      <g stroke={INK_FAINT} strokeWidth="0.24" filter="url(#roughink-z)">
        <path d="M132 24 h12 M132 27 h12 M132 30 h12" />
        <path d="M134 74 h13 M134 77 h13 M134 80 h13" />
      </g>
      <Trees cx={146} cy={52} count={4} spread={0.9} tone={INK_FAINT} />

      <ellipse cx={cx} cy={cy - 4} rx="30" ry="20" fill="url(#candlepool-z)" opacity="0.4" />
      <Cartouche x={6} y={88} w={52} title="SAINT VEYRA" sub="cathedral seat of the Concord" />
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
      {/* dawn fog on the horizon */}
      <g stroke="rgba(150, 140, 158, 0.22)" strokeWidth="1.4" filter="url(#roughink-z)">
        <path d="M4 12 q22 -3 44 0 q22 3 44 0 q22 -3 44 0 q10 1.4 20 0.6" />
        <path d="M14 18 q20 -2.6 40 0 q20 2.6 40 0 q20 -2.6 40 0" strokeWidth="1" opacity="0.7" />
      </g>

      {/* field plots: irregular hatched parcels along the road */}
      <g filter="url(#roughink-z)">
        {[
          { x: 10, y: 28, w: 22, h: 13, tilt: -3 },
          { x: 38, y: 22, w: 19, h: 11, tilt: 2 },
          { x: 14, y: 60, w: 24, h: 14, tilt: 2.5 },
          { x: 48, y: 64, w: 20, h: 12, tilt: -2 },
          { x: 86, y: 24, w: 22, h: 12, tilt: 3 },
          { x: 96, y: 70, w: 20, h: 12, tilt: -3 },
          { x: 126, y: 30, w: 20, h: 12, tilt: -2 }
        ].map((plot, index) => (
          <g key={index} transform={`rotate(${plot.tilt} ${plot.x + plot.w / 2} ${plot.y + plot.h / 2})`}>
            <rect x={plot.x} y={plot.y} width={plot.w} height={plot.h} stroke={INK_FAINT} strokeWidth="0.3" />
            {Array.from({ length: 4 }, (_, row) => (
              <path
                d={`M${plot.x + 1.2} ${plot.y + 2 + row * (plot.h - 3.4) / 3} h${plot.w - 2.4}`}
                stroke="rgba(215, 167, 86, 0.18)"
                strokeWidth="0.24"
                key={row}
              />
            ))}
          </g>
        ))}
      </g>

      {/* low stone walls between parcels */}
      <g stroke={INK_DIM} strokeWidth="0.34" strokeDasharray="1.3 0.9" filter="url(#roughink-z)">
        <path d="M8 46 Q30 43 40 45" />
        <path d="M84 40 Q98 37 112 40" />
        <path d="M70 78 Q88 74 104 78" />
      </g>

      {/* the Old Pilgrim Road: double-inked with milestones */}
      <g filter="url(#roughink-z)">
        <path
          d={`M0 ${Y(45)} Q${X(20)} ${Y(46)} ${crossX} ${crossY} Q${X(56)} ${Y(50)} ${shrineX} ${shrineY} Q${X(74)} ${Y(58)} ${cryptX} ${cryptY}`}
          stroke="rgba(215, 167, 86, 0.55)"
          strokeWidth="0.6"
          strokeDasharray="2.2 1.4"
        />
        <path
          d={`M0 ${Y(45) + 1.4} Q${X(20)} ${Y(46) + 1.4} ${crossX} ${crossY + 1.4}`}
          stroke={INK_FAINT}
          strokeWidth="0.3"
        />
        {/* milestones */}
        {[[X(14), Y(45.4)], [X(30), Y(46.6)], [X(56), Y(50.4)]].map(([mx, my]) => (
          <path d={`M${mx} ${my - 1.2} v1.6`} stroke={INK} strokeWidth="0.45" key={`${mx}`} />
        ))}
      </g>

      {/* the clawed signpost at the crossing */}
      <g stroke={INK} strokeWidth="0.4" filter="url(#roughink-z)">
        <path d={`M${crossX + 4} ${crossY - 3} v-5.4 M${crossX + 2.2} ${crossY - 7.2} l3.8 -0.9 M${crossX + 2.5} ${crossY - 5.6} l3.2 -0.7`} />
        <path d={`M${crossX + 5.4} ${crossY - 4.6} l1.8 2 m-1.2 -2.4 l1.8 2 m-1.2 -2.4 l1.8 2`} stroke={BLOOD} strokeWidth="0.3" />
      </g>

      {/* shrine hill: contour lines climbing to the candle rail */}
      <g filter="url(#roughink-z)">
        <ellipse cx={shrineX} cy={shrineY - 1} rx="15" ry="8.4" stroke={INK_FAINT} strokeWidth="0.28" />
        <ellipse cx={shrineX} cy={shrineY - 1.6} rx="10.4" ry="5.6" stroke={INK_FAINT} strokeWidth="0.28" />
        <ellipse cx={shrineX} cy={shrineY - 2.2} rx="6" ry="3.2" stroke={INK_DIM} strokeWidth="0.3" />
        {/* candle rail: dotted ring of flames */}
        {Array.from({ length: 10 }, (_, index) => {
          const angle = (index / 10) * Math.PI * 2;
          const fx = shrineX + Math.cos(angle) * 4.6;
          const fy = shrineY - 2.2 + Math.sin(angle) * 2.4;
          return <circle cx={fx} cy={fy} r="0.28" fill="rgba(233, 188, 106, 0.8)" stroke="none" key={index} />;
        })}
        <Steeple cx={shrineX} cy={shrineY - 3.2} scale={0.85} tone={INK} />
      </g>

      {/* the cryptlet stair descending from the shrine */}
      <g stroke={INK} strokeWidth="0.4" filter="url(#roughink-z)">
        <path d={`M${cryptX - 3.4} ${cryptY - 2.4} h6.8 M${cryptX - 2.7} ${cryptY - 0.9} h5.4 M${cryptX - 2} ${cryptY + 0.6} h4 M${cryptX - 1.3} ${cryptY + 2.1} h2.6`} />
        <circle cx={cryptX} cy={cryptY - 4.2} r="0.8" stroke={WAX} strokeWidth="0.35" />
        <path d={`M${cryptX - 0.5} ${cryptY - 3.6} q0.5 0.5 1 0`} stroke={WAX} strokeWidth="0.3" />
      </g>

      {/* wolf trail pawprints north of the road */}
      <g fill="rgba(150, 140, 158, 0.55)" stroke="none">
        {[[52, 30], [57, 28.4], [62, 29.6], [67, 27.8], [72, 29]].map(([px, py]) => (
          <g key={px}>
            <circle cx={px} cy={py} r="0.45" />
            <circle cx={px - 0.7} cy={py - 0.8} r="0.2" />
            <circle cx={px} cy={py - 1} r="0.2" />
            <circle cx={px + 0.7} cy={py - 0.8} r="0.2" />
          </g>
        ))}
      </g>

      {/* copse near the glen border */}
      <Trees cx={140} cy={62} count={6} spread={1.1} tone={INK_FAINT} />

      <ellipse cx={shrineX} cy={shrineY} rx="20" ry="11" fill="url(#candlepool-z)" opacity="0.5" />
      <Cartouche x={6} y={88} w={58} title="HEARTHMERE FIELDS" sub="the Old Pilgrim Road to Little Dawn" />
    </g>
  );
}

/* --- dungeon ----------------------------------------------------- */

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

      {/* corridors: double-walled passages */}
      <g fill="none" strokeLinecap="round" filter="url(#roughink-d)">
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
            <path d={d} stroke={INK_FAINT} strokeWidth="4.6" strokeDasharray="0.001 0" opacity="0" />
            <path d={d} stroke={INK_DIM} strokeWidth="0.34" transform="translate(0 -2.6)" />
            <path d={d} stroke={INK_DIM} strokeWidth="0.34" transform="translate(0 2.6)" />
          </g>
        ))}
      </g>

      {/* chambers: rough double-stroked stone rooms */}
      {Object.entries(dungeonRoomArt).map(([roomId, room]) => {
        const isBoss = roomId === "warden-chamber";
        const isExit = roomId === "road-seal-exit";
        const active = roomId === activeRoomId;
        const rx = room.x * 1.6;
        const rw = room.w * 1.6;
        return (
          <g key={roomId} filter="url(#roughink-d)">
            <rect
              x={rx - rw / 2}
              y={room.y - room.h / 2}
              width={rw}
              height={room.h}
              rx="1.6"
              fill={active ? "rgba(215, 167, 86, 0.13)" : "rgba(16, 10, 8, 0.92)"}
              stroke={isBoss ? BLOOD : active ? WAX : INK_DIM}
              strokeWidth={isBoss || active ? 0.55 : 0.42}
            />
            <rect
              x={rx - rw / 2 + 1.1}
              y={room.y - room.h / 2 + 1.1}
              width={rw - 2.2}
              height={room.h - 2.2}
              rx="1"
              fill="none"
              stroke={INK_FAINT}
              strokeWidth="0.24"
            />
            {/* rubble in the corners */}
            <circle cx={rx - rw / 2 + 2} cy={room.y + room.h / 2 - 2} r="0.3" fill={INK_FAINT} stroke="none" />
            <circle cx={rx + rw / 2 - 2.4} cy={room.y - room.h / 2 + 2.2} r="0.26" fill={INK_FAINT} stroke="none" />
            {roomId === "shrine-descent" ? (
              <path d={`M${rx - 2.8} ${room.y - 2} h5.6 M${rx - 2.2} ${room.y - 0.5} h4.4 M${rx - 1.6} ${room.y + 1} h3.2 M${rx - 1} ${room.y + 2.5} h2`} stroke={INK_DIM} strokeWidth="0.32" fill="none" />
            ) : null}
            {roomId === "pilgrim-bone-walk" ? (
              <g fill={INK_FAINT} stroke="none">
                <circle cx={rx - 2} cy={room.y - 1} r="0.34" /><circle cx={rx + 1.6} cy={room.y + 2} r="0.3" /><circle cx={rx + 0.4} cy={room.y - 3} r="0.26" />
                <path d={`M${rx - 1} ${room.y + 3.4} h1.8`} stroke={INK_DIM} strokeWidth="0.26" />
              </g>
            ) : null}
            {roomId === "broken-bell-niche" ? (
              <path d={`M${rx - 1.1} ${room.y - 0.8} a1.1 1.2 0 0 1 2.2 0 l0.3 1.6 h-2.8 Z M${rx} ${room.y + 1.6} v0.7`} stroke={WAX} strokeWidth="0.3" fill="none" opacity="0.8" />
            ) : null}
            {isBoss ? (
              <g stroke={BLOOD} strokeWidth="0.4" fill="none">
                <path d={`M${rx - 1.8} ${room.y + 1.8} L${rx - 1.8} ${room.y - 0.6} A1.8 1.8 0 0 1 ${rx + 1.8} ${room.y - 0.6} L${rx + 1.8} ${room.y + 1.8}`} />
                <path d={`M${rx} ${room.y + 1.8} L${rx} ${room.y + 3}`} />
                <circle cx={rx} cy={room.y - 0.4} r="0.5" strokeWidth="0.3" />
              </g>
            ) : null}
            {isExit ? <circle cx={rx} cy={room.y} r="1.5" stroke={WAX} strokeWidth="0.42" fill="rgba(215, 167, 86, 0.14)" /> : null}
          </g>
        );
      })}

      {/* candles along the walk */}
      <g fill="rgba(233, 188, 106, 0.85)" stroke="none">
        <circle cx="38.4" cy="37.6" r="0.55" /><circle cx="68.8" cy="38.4" r="0.55" /><circle cx="86.4" cy="45" r="0.55" /><circle cx="108.8" cy="47.6" r="0.55" />
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

/* --- overlays ----------------------------------------------------- */

export function PlayerMarker({ poiId }: { poiId: string }) {
  const poi = pois.find((entry) => entry.id === poiId);
  if (!poi) {
    return null;
  }
  return (
    <svg className="living-map-art living-map-overlay" viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden="true">
      <circle cx={X(poi.x)} cy={Y(poi.y)} r="1.7" fill="#e9bc6a" className="player-marker-core" />
      <circle cx={X(poi.x)} cy={Y(poi.y)} r="3.4" fill="none" stroke="rgba(233, 188, 106, 0.7)" strokeWidth="0.4" className="player-marker-pulse" />
    </svg>
  );
}
