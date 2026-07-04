import pois from "../../data/pois.json";
import regionTopography from "../../data/regionTopography.json";

// Hand-authored SVG map art for the three living map plates. Everything here
// is vector ink over dark parchment so the maps can render live state (player
// position, live realm travelers, cleared rooms) that painted plates cannot.
// Region and POI placement comes from the same source-governed JSON the rest
// of the game reads; only the terrain drawing is hand-authored.

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

export function MapArtDefs() {
  return (
    <defs>
      <radialGradient id="bell-parchment" cx="42%" cy="30%" r="95%">
        <stop offset="0%" stopColor="#2b2018" />
        <stop offset="55%" stopColor="#211710" />
        <stop offset="100%" stopColor="#140e0b" />
      </radialGradient>
      <radialGradient id="bell-candle" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(233, 188, 106, 0.85)" />
        <stop offset="45%" stopColor="rgba(215, 167, 86, 0.28)" />
        <stop offset="100%" stopColor="rgba(215, 167, 86, 0)" />
      </radialGradient>
      <radialGradient id="bell-dread" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(126, 31, 57, 0.5)" />
        <stop offset="100%" stopColor="rgba(126, 31, 57, 0)" />
      </radialGradient>
      <filter id="bell-grain" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
        <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.9  0 0 0 0 0.8  0 0 0 0 0.6  0 0 0 0.05 0" result="tint" />
        <feComposite in="tint" in2="SourceGraphic" operator="over" />
      </filter>
      <filter id="bell-rough">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="11" result="w" />
        <feDisplacementMap in="SourceGraphic" in2="w" scale="1.6" />
      </filter>
      <filter id="bell-soft-glow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="1.4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

const INK = "rgba(243, 233, 219, 0.62)";
const INK_DIM = "rgba(243, 233, 219, 0.3)";
const WAX = "#d7a756";
const BLOOD = "rgba(182, 58, 84, 0.75)";

function TerrainGlyph({ type, x, y, locked }: { type: string; x: number; y: number; locked: boolean }) {
  const stroke = locked ? INK_DIM : INK;
  const glyphs: Record<string, JSX.Element> = {
    capital: (
      <g>
        <path d={`M${x - 2.4} ${y + 1.6} L${x - 2.4} ${y - 1.4} L${x - 1} ${y - 2.4} L${x - 1} ${y + 1.6} M${x - 1} ${y - 0.6} L${x + 1} ${y - 0.6} L${x + 1} ${y + 1.6} M${x + 1} ${y - 0.6} L${x + 1} ${y - 3.2} L${x + 1.9} ${y - 4.6} L${x + 2.8} ${y - 3.2} L${x + 2.8} ${y + 1.6}`} />
        <path d={`M${x + 1.9} ${y - 4.6} L${x + 1.9} ${y - 5.6}`} stroke={WAX} />
      </g>
    ),
    fields: (
      <g>
        <path d={`M${x - 3} ${y + 0.6} q1.5 -1 3 0 q1.5 1 3 0`} />
        <path d={`M${x - 2.4} ${y + 1.8} q1.2 -0.8 2.4 0 q1.2 0.8 2.4 0`} />
        <path d={`M${x - 0.6} ${y - 0.6} l0.4 -1.8 m0.4 1.8 l0.2 -1.4 m-1.6 1.4 l-0.2 -1.2`} />
      </g>
    ),
    woods: (
      <g>
        <path d={`M${x - 1.8} ${y + 1.4} L${x - 1.8} ${y} M${x - 1.8} ${y} L${x - 2.8} ${y} L${x - 1.8} ${y - 2.4} L${x - 0.8} ${y} Z`} />
        <path d={`M${x + 1} ${y + 1.6} L${x + 1} ${y + 0.2} M${x + 1} ${y + 0.2} L${x} ${y + 0.2} L${x + 1} ${y - 2} L${x + 2} ${y + 0.2} Z`} />
      </g>
    ),
    coast: (
      <g>
        <path d={`M${x - 3} ${y} q1 -1.2 2 0 q1 1.2 2 0 q1 -1.2 2 0`} />
        <path d={`M${x - 2} ${y + 1.6} q1 -1 2 0 q1 1 2 0`} />
      </g>
    ),
    industrial: (
      <g>
        <path d={`M${x - 2} ${y + 1.4} L${x - 2} ${y - 1} L${x - 0.4} ${y - 1} L${x - 0.4} ${y + 1.4} Z`} />
        <path d={`M${x + 0.6} ${y + 1.4} L${x + 0.6} ${y - 2.6} L${x + 1.6} ${y - 2.6} L${x + 1.6} ${y + 1.4}`} />
        <path d={`M${x + 1.1} ${y - 3.4} q0.8 -0.6 0.4 -1.4`} strokeDasharray="0.6 0.5" />
      </g>
    ),
    "cathedral-wood": (
      <g>
        <path d={`M${x - 2.6} ${y + 1.4} L${x - 2.6} ${y} L${x - 3.4} ${y} L${x - 2.6} ${y - 2} L${x - 1.8} ${y} Z`} />
        <path d={`M${x} ${y + 1.4} L${x} ${y - 2} L${x + 0.9} ${y - 3.6} L${x + 1.8} ${y - 2} L${x + 1.8} ${y + 1.4}`} />
        <path d={`M${x + 0.9} ${y - 3.6} L${x + 0.9} ${y - 4.6} M${x + 0.4} ${y - 4.1} L${x + 1.4} ${y - 4.1}`} stroke={WAX} />
      </g>
    ),
    fen: (
      <g>
        <path d={`M${x - 2.6} ${y + 0.4} h1.6 M${x - 0.4} ${y + 0.4} h2 M${x - 1.6} ${y + 1.4} h1.8 M${x + 0.8} ${y + 1.4} h1.4`} />
        <path d={`M${x - 0.2} ${y - 0.4} l0 -1.6 m-0.7 1.6 l-0.2 -1.2 m1.6 1.2 l0.2 -1.2`} />
      </g>
    ),
    abbey: (
      <g>
        <path d={`M${x - 2} ${y + 1.4} L${x - 2} ${y - 0.8} L${x} ${y - 2.4} L${x + 2} ${y - 0.8} L${x + 2} ${y + 1.4} Z`} />
        <path d={`M${x} ${y - 2.4} L${x} ${y - 3.4} M${x - 0.6} ${y - 2.9} L${x + 0.6} ${y - 2.9}`} stroke={WAX} />
      </g>
    ),
    vale: (
      <g>
        <path d={`M${x - 3} ${y + 1} q1.4 -2.6 3 0 q1.6 2.4 3 0`} />
        <path d={`M${x - 0.4} ${y - 1.4} a0.9 0.9 0 1 1 0.9 1.2`} stroke={BLOOD} />
      </g>
    ),
    spires: (
      <g>
        <path d={`M${x - 2.2} ${y + 1.4} L${x - 1.2} ${y - 3} L${x - 0.4} ${y + 1.4}`} />
        <path d={`M${x + 0.4} ${y + 1.4} L${x + 1.4} ${y - 4.2} L${x + 2.2} ${y + 1.4}`} stroke={BLOOD} />
      </g>
    ),
    castle: (
      <g>
        <path d={`M${x - 2.2} ${y + 1.4} L${x - 2.2} ${y - 1.8} L${x - 1.4} ${y - 1.8} L${x - 1.4} ${y - 1} L${x - 0.6} ${y - 1} L${x - 0.6} ${y - 1.8} L${x + 0.6} ${y - 1.8} L${x + 0.6} ${y - 1} L${x + 1.4} ${y - 1} L${x + 1.4} ${y - 1.8} L${x + 2.2} ${y - 1.8} L${x + 2.2} ${y + 1.4} Z`} />
      </g>
    ),
    mooncrypt: (
      <g>
        <path d={`M${x + 1.8} ${y - 1.2} a2 2 0 1 0 -2.4 2.6 a1.5 1.5 0 1 1 2.4 -2.6`} />
        <path d={`M${x - 2.2} ${y + 1.6} h4.4`} strokeDasharray="0.7 0.6" />
      </g>
    ),
    cathedral: (
      <g>
        <path d={`M${x - 1.6} ${y + 1.6} L${x - 1.6} ${y - 1.6} L${x} ${y - 3.6} L${x + 1.6} ${y - 1.6} L${x + 1.6} ${y + 1.6} Z`} />
        <path d={`M${x} ${y - 3.6} L${x} ${y - 5} M${x - 0.7} ${y - 4.3} L${x + 0.7} ${y - 4.3}`} stroke={WAX} />
      </g>
    ),
    underground: (
      <g>
        <path d={`M${x - 2} ${y + 1.4} L${x - 2} ${y - 0.4} A2 2 0 0 1 ${x + 2} ${y - 0.4} L${x + 2} ${y + 1.4}`} />
        <path d={`M${x - 0.9} ${y + 1.4} L${x - 0.9} ${y} A0.9 0.9 0 0 1 ${x + 0.9} ${y} L${x + 0.9} ${y + 1.4}`} stroke={INK_DIM} />
      </g>
    )
  };

  return (
    <g fill="none" stroke={stroke} strokeWidth="0.35" strokeLinecap="round" strokeLinejoin="round" filter="url(#bell-rough)">
      {glyphs[type] ?? <circle cx={x} cy={y} r="1.2" />}
      {locked ? <path d={`M${x + 2.6} ${y - 2.6} l1.6 1.6 m0 -1.6 l-1.6 1.6`} stroke={BLOOD} strokeWidth="0.3" /> : null}
    </g>
  );
}

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
    <svg className="living-map-art" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <MapArtDefs />
      <rect x="0" y="0" width="100" height="100" fill="url(#bell-parchment)" />

      {/* northern sea and coastline */}
      <path
        d="M0 14 Q10 10 20 13 Q30 17 40 12 Q50 8 60 11 Q72 14 82 9 Q92 5 100 8 L100 0 L0 0 Z"
        fill="rgba(24, 26, 36, 0.85)"
        filter="url(#bell-rough)"
      />
      <g stroke="rgba(131, 121, 140, 0.35)" strokeWidth="0.25" fill="none" filter="url(#bell-rough)">
        <path d="M6 8 q2 -1.4 4 0 q2 1.4 4 0" />
        <path d="M46 5 q2 -1.4 4 0 q2 1.4 4 0" />
        <path d="M78 4 q2 -1.4 4 0" />
        <path d="M0 14 Q10 10 20 13 Q30 17 40 12 Q50 8 60 11 Q72 14 82 9 Q92 5 100 8" stroke={INK_DIM} strokeWidth="0.4" />
      </g>

      {/* the Veyra river, running from the coast down past the capital */}
      <path
        d="M30 15 Q26 26 22 32 Q17 41 24 50 Q30 57 27 68 Q25 76 30 86 Q33 93 30 100"
        fill="none"
        stroke="rgba(78, 163, 163, 0.28)"
        strokeWidth="1.1"
        filter="url(#bell-rough)"
      />

      {/* southern dread fog over the deep cathedral lands */}
      <ellipse cx="66" cy="86" rx="26" ry="13" fill="url(#bell-dread)" />
      <ellipse cx="86" cy="24" rx="16" ry="12" fill="url(#bell-dread)" opacity="0.7" />

      {/* pilgrim roads between known regions */}
      <g fill="none" strokeLinecap="round" filter="url(#bell-rough)">
        {routes.map((route) => {
          const open = !route.from.locked && !route.to.locked;
          const midX = (route.from.x + route.to.x) / 2 + (route.from.y < route.to.y ? 2.4 : -2.4);
          const midY = (route.from.y + route.to.y) / 2;
          return (
            <path
              d={`M${route.from.x} ${route.from.y} Q${midX} ${midY} ${route.to.x} ${route.to.y}`}
              stroke={open ? "rgba(215, 167, 86, 0.55)" : "rgba(131, 121, 140, 0.22)"}
              strokeWidth={open ? 0.5 : 0.35}
              strokeDasharray={open ? "1.6 1.1" : "0.7 1.3"}
              key={`${route.from.id}-${route.to.id}`}
            />
          );
        })}
      </g>

      {/* terrain glyphs per region */}
      {regions.map((region) => (
        <TerrainGlyph type={region.terrainType} x={region.x} y={region.y} locked={region.locked} key={region.id} />
      ))}

      {/* candlelight over the playable first road */}
      <ellipse cx="27" cy="41" rx="17" ry="12" fill="url(#bell-candle)" opacity="0.5" />

      {/* compass bell rose */}
      <g transform="translate(9, 84)" stroke={INK_DIM} strokeWidth="0.35" fill="none" filter="url(#bell-rough)">
        <circle r="4.4" />
        <path d="M0 -4.4 L1 -1 L4.4 0 L1 1 L0 4.4 L-1 1 L-4.4 0 L-1 -1 Z" fill="rgba(215, 167, 86, 0.2)" stroke={WAX} strokeWidth="0.28" />
        <path d="M-1.1 1.6 A1.4 1.4 0 0 1 1.1 1.6 L1.4 2.2 L-1.4 2.2 Z" stroke={WAX} strokeWidth="0.25" />
      </g>

      <rect x="0.8" y="0.8" width="98.4" height="98.4" fill="none" stroke="rgba(215, 167, 86, 0.28)" strokeWidth="0.35" />
      <rect x="2.2" y="2.2" width="95.6" height="95.6" fill="none" stroke="rgba(215, 167, 86, 0.14)" strokeWidth="0.25" />
    </svg>
  );
}

export function ZoneMapArt({ zoneId }: { zoneId: string }) {
  return (
    <svg className="living-map-art" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <MapArtDefs />
      <rect x="0" y="0" width="100" height="100" fill="url(#bell-parchment)" />
      {zoneId === "saint-veyra" ? <SaintVeyraArt /> : <HearthmereArt />}
      <rect x="0.8" y="0.8" width="98.4" height="98.4" fill="none" stroke="rgba(215, 167, 86, 0.28)" strokeWidth="0.35" />
    </svg>
  );
}

function SaintVeyraArt() {
  // The capital: ring walls, the cathedral close, radial streets, the Veyra
  // river cutting the eastern districts, gate to the Hearthmere road.
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M78 0 Q72 22 76 44 Q80 66 72 100" stroke="rgba(78, 163, 163, 0.3)" strokeWidth="2" filter="url(#bell-rough)" />
      <g stroke={INK_DIM} strokeWidth="0.4" filter="url(#bell-rough)">
        <circle cx="38" cy="46" r="34" />
        <circle cx="38" cy="46" r="24" strokeDasharray="2.4 1.4" />
        <circle cx="38" cy="46" r="13" />
      </g>
      <g stroke="rgba(243, 233, 219, 0.2)" strokeWidth="0.35" filter="url(#bell-rough)">
        <path d="M38 12 L38 33" />
        <path d="M38 59 L38 80" />
        <path d="M8 46 L25 46" />
        <path d="M51 46 L72 46" />
        <path d="M17 24 L29 37" />
        <path d="M59 68 L47 55" />
        <path d="M59 24 L47 37" />
        <path d="M17 68 L29 55" />
      </g>
      {/* cathedral close */}
      <g stroke={INK} strokeWidth="0.45" filter="url(#bell-rough)">
        <path d="M32 52 L32 42 L38 35 L44 42 L44 52 Z" fill="rgba(215, 167, 86, 0.08)" />
        <path d="M38 35 L38 28" stroke={WAX} />
        <path d="M35.8 30.8 L40.2 30.8" stroke={WAX} />
        <circle cx="38" cy="46" r="1.1" stroke={WAX} />
      </g>
      {/* district blocks */}
      <g stroke="rgba(243, 233, 219, 0.28)" strokeWidth="0.3" filter="url(#bell-rough)">
        <path d="M22 38 h5 v4 h-5 Z M24 55 h6 v4 h-6 Z M48 38 h5 v5 h-5 Z M47 55 h6 v4 h-6 Z M33 62 h4 v4 h-4 Z M34 25 h4 v4 h-4 Z M14 44 h4 v5 h-4 Z M55 44 h4 v5 h-4 Z" />
      </g>
      {/* east gate and the Old Pilgrim Road leaving toward Hearthmere */}
      <g filter="url(#bell-rough)">
        <path d="M70 44 L74 44 L74 49 L70 49" stroke={INK} strokeWidth="0.45" />
        <path d="M74 46.5 Q86 48 100 52" stroke="rgba(215, 167, 86, 0.55)" strokeWidth="0.55" strokeDasharray="1.8 1.2" />
      </g>
      <ellipse cx="38" cy="44" rx="22" ry="18" fill="url(#bell-candle)" opacity="0.4" />
    </g>
  );
}

function HearthmereArt() {
  // Wheat fields, low stone walls, the Old Pilgrim Road running east from the
  // capital gate through the crossing (42,48), the shrine (70,52), and down
  // to the cryptlet stair (78,70).
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* dawn fog band */}
      <rect x="0" y="0" width="100" height="26" fill="rgba(131, 121, 140, 0.12)" filter="url(#bell-rough)" />
      {/* field hatching */}
      <g stroke="rgba(215, 167, 86, 0.16)" strokeWidth="0.3" filter="url(#bell-rough)">
        <path d="M8 30 h14 M8 33 h14 M8 36 h14 M8 39 h14" />
        <path d="M20 62 h16 M20 65 h16 M20 68 h16 M20 71 h16" />
        <path d="M52 26 h14 M52 29 h14 M52 32 h14" />
        <path d="M56 70 h13 M56 73 h13 M56 76 h13" />
      </g>
      {/* low stone walls */}
      <g stroke={INK_DIM} strokeWidth="0.35" strokeDasharray="1.2 0.8" filter="url(#bell-rough)">
        <path d="M6 44 Q20 42 30 44" />
        <path d="M50 60 Q60 58 68 61" />
        <path d="M48 22 Q58 20 68 23" />
      </g>
      {/* wheat tufts */}
      <g stroke="rgba(215, 167, 86, 0.4)" strokeWidth="0.28" filter="url(#bell-rough)">
        <path d="M14 33 l0.5 -2 m0.7 2 l0.3 -1.5 m-2.2 1.5 l-0.3 -1.4" />
        <path d="M28 66 l0.5 -2 m0.7 2 l0.3 -1.5 m-2.2 1.5 l-0.3 -1.4" />
        <path d="M60 29 l0.5 -2 m0.7 2 l0.3 -1.5 m-2.2 1.5 l-0.3 -1.4" />
        <path d="M62 73 l0.5 -2 m0.7 2 l0.3 -1.5" />
      </g>
      {/* the Old Pilgrim Road */}
      <path
        d="M0 46 Q20 47 42 48 Q56 49.5 70 52 Q75 58 78 70"
        stroke="rgba(215, 167, 86, 0.6)"
        strokeWidth="0.6"
        strokeDasharray="2 1.2"
        filter="url(#bell-rough)"
      />
      {/* clawed signpost near the crossing */}
      <g stroke={INK} strokeWidth="0.35" filter="url(#bell-rough)">
        <path d="M46 43 L46 39 M44.5 39.8 L47.8 39 M44.8 41.2 L47.5 40.6" />
        <path d="M47.2 42 l1.4 1.6 m-0.9 -1.9 l1.4 1.6" stroke={BLOOD} strokeWidth="0.28" />
      </g>
      {/* shrine hill with candle rail */}
      <g filter="url(#bell-rough)">
        <path d="M62 56 Q70 48 78 56" stroke={INK_DIM} strokeWidth="0.4" />
        <circle cx="70" cy="50.5" r="3.4" fill="none" stroke="rgba(215, 167, 86, 0.5)" strokeWidth="0.3" strokeDasharray="0.5 0.9" />
        <path d="M68.6 52 L68.6 49.4 L70 47.8 L71.4 49.4 L71.4 52 Z" stroke={INK} strokeWidth="0.4" fill="rgba(215, 167, 86, 0.1)" />
      </g>
      {/* the cryptlet stair, descending */}
      <g stroke={INK} strokeWidth="0.38" filter="url(#bell-rough)">
        <path d="M75.4 68 L80.6 68 M76 69.6 L80 69.6 M76.6 71.2 L79.4 71.2 M77.2 72.8 L78.8 72.8" />
        <path d="M78 66.4 a1 1 0 0 1 0 -0.1" stroke={WAX} />
        <circle cx="78" cy="65.8" r="0.7" stroke={WAX} fill="none" />
      </g>
      {/* ash-gray wolf trail in the north fields */}
      <g fill="rgba(131, 121, 140, 0.5)" stroke="none">
        <circle cx="36" cy="24" r="0.4" /><circle cx="38.5" cy="23" r="0.4" /><circle cx="41" cy="23.8" r="0.4" /><circle cx="43.5" cy="22.6" r="0.4" />
      </g>
      <ellipse cx="70" cy="52" rx="12" ry="9" fill="url(#bell-candle)" opacity="0.45" />
    </g>
  );
}

const dungeonRoomArt: Record<string, { x: number; y: number; w: number; h: number }> = {
  "shrine-descent": { x: 13, y: 34, w: 11, h: 12 },
  "hall-threaded-names": { x: 35, y: 40, w: 13, h: 10 },
  "broken-bell-niche": { x: 50, y: 37, w: 9, h: 9 },
  "pilgrim-bone-walk": { x: 57, y: 53, w: 10, h: 13 },
  "candleless-alcove": { x: 49, y: 69, w: 9, h: 9 },
  "warden-chamber": { x: 79, y: 42, w: 14, h: 15 },
  "road-seal-exit": { x: 82, y: 73, w: 10, h: 9 }
};

export function DungeonMapArt({ activeRoomId, clearedEncounterIds }: { activeRoomId?: string; clearedEncounterIds?: string[] }) {
  return (
    <svg className="living-map-art" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <MapArtDefs />
      <rect x="0" y="0" width="100" height="100" fill="url(#bell-parchment)" />
      <rect x="0" y="0" width="100" height="100" fill="rgba(9, 8, 15, 0.45)" />

      {/* corridors */}
      <g stroke="rgba(243, 233, 219, 0.22)" strokeWidth="2.6" fill="none" strokeLinecap="round" filter="url(#bell-rough)">
        <path d="M13 34 C22 38, 28 40, 35 40" />
        <path d="M35 40 C42 39, 46 37, 50 37" />
        <path d="M50 37 C55 42, 57 48, 57 53" />
        <path d="M57 53 C54 60, 52 65, 49 69" />
        <path d="M57 53 C64 49, 72 45, 79 42" />
        <path d="M79 42 C80 53, 81 64, 82 73" />
      </g>

      {/* chambers */}
      {Object.entries(dungeonRoomArt).map(([roomId, room]) => {
        const isBoss = roomId === "warden-chamber";
        const isExit = roomId === "road-seal-exit";
        const active = roomId === activeRoomId;
        return (
          <g key={roomId} filter="url(#bell-rough)">
            <rect
              x={room.x - room.w / 2}
              y={room.y - room.h / 2}
              width={room.w}
              height={room.h}
              rx="2"
              fill={active ? "rgba(215, 167, 86, 0.14)" : "rgba(18, 12, 9, 0.85)"}
              stroke={isBoss ? BLOOD : active ? WAX : INK_DIM}
              strokeWidth={isBoss || active ? 0.55 : 0.4}
            />
            {isBoss ? (
              <path
                d={`M${room.x - 1.6} ${room.y + 1.6} L${room.x - 1.6} ${room.y - 0.6} A1.6 1.6 0 0 1 ${room.x + 1.6} ${room.y - 0.6} L${room.x + 1.6} ${room.y + 1.6} M${room.x} ${room.y + 1.6} L${room.x} ${room.y + 2.6}`}
                stroke={BLOOD}
                strokeWidth="0.4"
                fill="none"
              />
            ) : null}
            {isExit ? (
              <circle cx={room.x} cy={room.y} r="1.4" stroke={WAX} strokeWidth="0.4" fill="rgba(215, 167, 86, 0.15)" />
            ) : null}
          </g>
        );
      })}

      {/* candle points along the walk */}
      <g fill="rgba(233, 188, 106, 0.8)" stroke="none">
        <circle cx="24" cy="37.6" r="0.5" /><circle cx="43" cy="38.4" r="0.5" /><circle cx="54" cy="45" r="0.5" /><circle cx="68" cy="47.6" r="0.5" />
      </g>
      {activeRoomId && dungeonRoomArt[activeRoomId] ? (
        <ellipse
          cx={dungeonRoomArt[activeRoomId].x}
          cy={dungeonRoomArt[activeRoomId].y}
          rx="10"
          ry="8"
          fill="url(#bell-candle)"
          opacity="0.6"
        />
      ) : null}
      <rect x="0.8" y="0.8" width="98.4" height="98.4" fill="none" stroke="rgba(215, 167, 86, 0.28)" strokeWidth="0.35" />
    </svg>
  );
}

export function PlayerMarker({ poiId }: { poiId: string }) {
  const poi = pois.find((entry) => entry.id === poiId);
  if (!poi) {
    return null;
  }
  return (
    <svg className="living-map-art living-map-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <circle cx={poi.x} cy={poi.y} r="1.5" fill="#e9bc6a" className="player-marker-core" />
      <circle cx={poi.x} cy={poi.y} r="3" fill="none" stroke="rgba(233, 188, 106, 0.7)" strokeWidth="0.35" className="player-marker-pulse" />
    </svg>
  );
}
