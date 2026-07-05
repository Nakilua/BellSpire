import type { FC, SVGProps } from "react";

// The BellSpire Bestiary: bespoke portraits, one per creature, hand-crafted as
// layered vector illustrations (docs/GRAND_VISION.md §1). Technique rules:
// solid gradient-filled silhouettes (never outline-only), one light story —
// warm candleglow from below, cold bone rim from above — and a signature read
// that survives at 40px. lucide is for UI; these own the creatures.

type PortraitProps = SVGProps<SVGSVGElement>;

const CLOAK_DARK = "#171017";
const CLOAK_MID = "#2a1d26";
const BONE_LIGHT = "#d8cbb6";
const BONE_MID = "#a89882";
const BONE_DARK = "#6e6152";
const EMBER = "#e9bc6a";
const BLOOD = "#b63a54";
const RIM = "rgba(159, 176, 200, 0.55)";

function Rig({ id, ember = EMBER }: { id: string; ember?: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-cloak`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={CLOAK_MID} />
        <stop offset="70%" stopColor={CLOAK_DARK} />
        <stop offset="100%" stopColor="#0d090d" />
      </linearGradient>
      <linearGradient id={`${id}-bone`} x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor={BONE_LIGHT} />
        <stop offset="55%" stopColor={BONE_MID} />
        <stop offset="100%" stopColor={BONE_DARK} />
      </linearGradient>
      <linearGradient id={`${id}-bronze`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e0b878" />
        <stop offset="45%" stopColor="#9a744a" />
        <stop offset="100%" stopColor="#4c3524" />
      </linearGradient>
      <radialGradient id={`${id}-glow`} cx="50%" cy="88%" r="70%">
        <stop offset="0%" stopColor={ember} stopOpacity="0.5" />
        <stop offset="55%" stopColor={ember} stopOpacity="0.12" />
        <stop offset="100%" stopColor={ember} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${id}-eye`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fff3d6" />
        <stop offset="35%" stopColor={ember} />
        <stop offset="100%" stopColor={ember} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${id}-vig`} cx="50%" cy="46%" r="60%">
        <stop offset="72%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
      </radialGradient>
    </defs>
  );
}

function Frame({ id }: { id: string }) {
  return (
    <>
      <rect width="48" height="48" fill={`url(#${id}-glow)`} />
      <rect width="48" height="48" fill={`url(#${id}-vig)`} />
    </>
  );
}

/* -- Vowless Pilgrim Shade: a hollow hood, two ember eyes, a severed vow-cord -- */
export const VowlessPilgrimShade: FC<PortraitProps> = (props) => (
  <svg viewBox="0 0 48 48" {...props}>
    <Rig id="shade" />
    <rect width="48" height="48" fill={`url(#shade-glow)`} />
    {/* cloak mass, tattered hem */}
    <path
      d="M24 5 C15 7 10 14 9.5 22 C9 30 11 36 9 43 L13 40.5 L16 44 L20 41 L24 45 L28 41 L32 44 L35 40.5 L39 43 C37 36 39 30 38.5 22 C38 14 33 7 24 5 Z"
      fill="url(#shade-cloak)"
    />
    {/* hood cavity */}
    <path d="M24 9 C18.2 10.6 15.2 15.4 15.4 21 C15.6 26 19 29.6 24 29.6 C29 29.6 32.4 26 32.6 21 C32.8 15.4 29.8 10.6 24 9 Z" fill="#070408" />
    {/* cold rim on the hood's crown */}
    <path d="M16.5 12.5 C18.5 8.9 21 7.2 24 6.6 C27 7.2 29.5 8.9 31.5 12.5 C28.8 9.8 26.4 8.7 24 8.5 C21.6 8.7 19.2 9.8 16.5 12.5 Z" fill={RIM} />
    {/* ember eyes */}
    <circle cx="20.4" cy="20.4" r="3.2" fill="url(#shade-eye)" />
    <circle cx="27.6" cy="20.4" r="3.2" fill="url(#shade-eye)" />
    <circle cx="20.4" cy="20.4" r="0.9" fill="#fff3d6" />
    <circle cx="27.6" cy="20.4" r="0.9" fill="#fff3d6" />
    {/* the severed vow-cord */}
    <path d="M24 30 C23.6 33 24.4 35.6 23.4 38.6" stroke={EMBER} strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.75" />
    <path d="M23.4 38.6 l-1 1.6 m1 -1.6 l1.2 1.3" stroke={EMBER} strokeWidth="0.6" fill="none" strokeLinecap="round" opacity="0.55" />
    <Frame id="shade" />
  </svg>
);

/* -- Ash-bitten Bones: a cracked skull with a bitten crown, drifting ash -- */
export const AshBittenBones: FC<PortraitProps> = (props) => (
  <svg viewBox="0 0 48 48" {...props}>
    <Rig id="ashb" />
    <rect width="48" height="48" fill={`url(#ashb-glow)`} />
    {/* shoulder shards */}
    <path d="M10 44 L15 34 L20 44 Z M28 44 L33 33 L38 44 Z" fill="url(#ashb-bone)" opacity="0.55" />
    {/* cranium with the bite notch on the right crown */}
    <path
      d="M24 7 C16.5 7 11.5 13 11.5 20.5 C11.5 25.5 14 29.5 17.5 31.5 L17.5 36 L30.5 36 L30.5 31.5 C33.8 29.7 36.2 26.2 36.5 22 L33.4 20.4 L35.8 17.2 C34.3 11.2 30 7 24 7 Z"
      fill="url(#ashb-bone)"
    />
    {/* cold rim */}
    <path d="M13.5 15 C15.5 10.4 19.3 8 24 7.9 C20 8.6 16.6 10.8 13.5 15 Z" fill={RIM} />
    {/* sockets and nasal */}
    <path d="M16.8 19.2 a3.4 3 0 1 0 6.8 0 a3.4 3 0 1 0 -6.8 0 Z" fill="#0a0608" />
    <path d="M25.6 19.2 a3.2 2.9 0 1 0 6.4 0 a3.2 2.9 0 1 0 -6.4 0 Z" fill="#0a0608" />
    <circle cx="20.4" cy="19.6" r="1" fill="url(#ashb-eye)" />
    <path d="M24 23 L22.6 26.4 L25.4 26.4 Z" fill="#0a0608" />
    {/* crack across the brow */}
    <path d="M27 9.5 L26 13 L28.2 15.4 L26.8 18" stroke="#4a4038" strokeWidth="0.8" fill="none" strokeLinecap="round" />
    {/* jaw, offset broken */}
    <path d="M18 32 L18.6 37.8 L29 37.4 L29.8 31.6 C26 33.4 21.8 33.6 18 32 Z" fill="url(#ashb-bone)" transform="rotate(-3 24 35)" />
    <path d="M19.6 33.4 v2.6 M22.4 33.8 v2.8 M25.2 33.8 v2.6 M28 33.2 v2.6" stroke="#0a0608" strokeWidth="0.7" />
    {/* drifting ash */}
    <g fill="rgba(183, 174, 189, 0.65)">
      <circle cx="37" cy="12" r="0.6" /><circle cx="40" cy="18" r="0.45" /><circle cx="9" cy="24" r="0.5" /><circle cx="12" cy="10" r="0.4" /><circle cx="39.5" cy="30" r="0.4" />
    </g>
    <Frame id="ashb" />
  </svg>
);

/* -- Bell-Ringer Shade: a bronze bell for a head, rope veil, glowing clapper -- */
export const BellRingerShade: FC<PortraitProps> = (props) => (
  <svg viewBox="0 0 48 48" {...props}>
    <Rig id="ringer" />
    <rect width="48" height="48" fill={`url(#ringer-glow)`} />
    {/* shrouded shoulders */}
    <path d="M8 45 C10 36 16 32.5 24 32.5 C32 32.5 38 36 40 45 Z" fill="url(#ringer-cloak)" />
    {/* rope veil strands */}
    <g stroke="#5d4a33" strokeWidth="1" strokeLinecap="round" fill="none">
      <path d="M16 30 C15.4 35 15.8 39 15 43" />
      <path d="M20 31.5 C19.6 36 20 40 19.4 44.5" />
      <path d="M28 31.5 C28.4 36 28 40 28.6 44.5" />
      <path d="M32 30 C32.6 35 32.2 39 33 43" />
    </g>
    {/* the bell head */}
    <path d="M24 6 C23 6 22.4 6.7 22.4 7.6 C17.5 9 14.6 13.4 14.6 19.2 L14 26 C13.9 27.4 13 28.3 13 29.4 L35 29.4 C35 28.3 34.1 27.4 34 26 L33.4 19.2 C33.4 13.4 30.5 9 25.6 7.6 C25.6 6.7 25 6 24 6 Z" fill="url(#ringer-bronze)" />
    {/* bell mouth shadow + glowing clapper */}
    <path d="M13 29.4 L35 29.4 L34 32 L14 32 Z" fill="#120b08" />
    <circle cx="24" cy="30.2" r="2" fill="url(#ringer-eye)" />
    {/* cold rim on the crown, wax drip */}
    <path d="M16.8 12.8 C18.8 9.6 21 8.2 23.4 7.8 C20.6 9 18.4 10.6 16.8 12.8 Z" fill={RIM} />
    <path d="M18.2 20 C18 22.4 18.4 24.4 18 26.8 L17 26.8 C17.3 24.4 17 22.4 17.2 20 Z" fill={EMBER} opacity="0.5" />
    {/* hairline crack */}
    <path d="M29 11 L28.2 15 L30 17.6" stroke="#31210f" strokeWidth="0.7" fill="none" strokeLinecap="round" />
    <Frame id="ringer" />
  </svg>
);

/* -- Bone-Hook Crawler: a hunched arc of bone, hook limbs reaching -- */
export const BoneHookCrawler: FC<PortraitProps> = (props) => (
  <svg viewBox="0 0 48 48" {...props}>
    <Rig id="crawl" />
    <rect width="48" height="48" fill={`url(#crawl-glow)`} />
    {/* the hump */}
    <path d="M6 40 C8 26 16 18 27 18.5 C36 19 42 26 43 36 L43 40 Z" fill="url(#crawl-cloak)" />
    {/* spine ridge */}
    <g fill="url(#crawl-bone)">
      <path d="M14 27 L16 21.4 L18.4 26 Z" />
      <path d="M20 24 L22.2 18.4 L24.6 23.4 Z" />
      <path d="M27 23 L29.2 17.8 L31.4 22.8 Z" />
      <path d="M34 24.6 L36 20 L38 25 Z" />
    </g>
    {/* low skull head, front-left */}
    <path d="M8.5 33 C8.5 29.6 11 27.2 14.4 27.2 C17.6 27.2 20 29.4 20 32.4 C20 34.4 19 36 17.4 36.8 L17.4 39 L11 39 L11 36.8 C9.5 36 8.5 34.7 8.5 33 Z" fill="url(#crawl-bone)" />
    <ellipse cx="12.6" cy="32.2" rx="1.7" ry="1.5" fill="#0a0608" />
    <ellipse cx="17" cy="32" rx="1.5" ry="1.4" fill="#0a0608" />
    <circle cx="12.9" cy="32.3" r="0.7" fill="url(#crawl-eye)" />
    {/* hook limbs */}
    <g fill="url(#crawl-bone)">
      <path d="M21 39 C21 33.6 25 31 29.4 32 L29 34.4 C25.8 33.8 23.4 35.6 23.4 39 Z" />
      <path d="M29.4 32 C31.8 32.6 33 34.2 32.6 36.4 L30.4 35.8 C30.6 34.6 30.2 33.8 29 33.4 Z" />
      <path d="M31 41 C31 36.8 34.2 34.6 37.8 35.4 L37.4 37.6 C34.8 37.2 33 38.6 33 41 Z" />
      <path d="M37.8 35.4 C39.8 36 40.8 37.4 40.4 39.2 L38.4 38.6 C38.6 37.6 38.2 37 37.2 36.6 Z" />
    </g>
    {/* cold rim along the hump */}
    <path d="M12 26 C17 20.4 22.6 18.4 28 18.8 C22 19.6 17 22 12 26 Z" fill={RIM} />
    <Frame id="crawl" />
  </svg>
);

/* -- Bone Rattle Add: a small frantic cluster of skull and rib shards -- */
export const BoneRattleAdd: FC<PortraitProps> = (props) => (
  <svg viewBox="0 0 48 48" {...props}>
    <Rig id="rattle" />
    <rect width="48" height="48" fill={`url(#rattle-glow)`} />
    {/* rattle ghosting: offset echoes suggest vibration */}
    <g opacity="0.28" transform="translate(-2.2 1)">
      <circle cx="24" cy="21" r="7.5" fill={BONE_DARK} />
    </g>
    <g opacity="0.28" transform="translate(2.2 -1)">
      <circle cx="24" cy="21" r="7.5" fill={BONE_DARK} />
    </g>
    {/* crossed rib shards behind */}
    <g fill="url(#rattle-bone)">
      <path d="M12 36 L31 14 L33.4 16 L14.4 38 Z" opacity="0.85" />
      <path d="M36 36 L17 14 L14.6 16 L33.6 38 Z" opacity="0.85" />
    </g>
    {/* small skull */}
    <path d="M24 12.5 C18.8 12.5 15.4 16.4 15.4 21.4 C15.4 24.6 17 27.2 19.4 28.6 L19.4 31.6 L28.6 31.6 L28.6 28.6 C31 27.2 32.6 24.6 32.6 21.4 C32.6 16.4 29.2 12.5 24 12.5 Z" fill="url(#rattle-bone)" />
    <ellipse cx="20.8" cy="21" rx="2.3" ry="2.1" fill="#0a0608" />
    <ellipse cx="27.2" cy="21" rx="2.3" ry="2.1" fill="#0a0608" />
    <circle cx="21.1" cy="21.2" r="0.8" fill="url(#rattle-eye)" />
    <circle cx="27.5" cy="21.2" r="0.8" fill="url(#rattle-eye)" />
    <path d="M24 24 L22.9 26.6 L25.1 26.6 Z" fill="#0a0608" />
    <path d="M20.6 29 v2 M23.2 29.4 v2 M25.8 29.4 v2 M28.4 29 v2" stroke="#0a0608" strokeWidth="0.6" />
    {/* cold rim */}
    <path d="M17 16 C19 13.6 21.4 12.6 24 12.6 C21 13.2 18.8 14.4 17 16 Z" fill={RIM} />
    <Frame id="rattle" />
  </svg>
);

/* -- The Bellgrave Warden: bell-crowned skull, blood-lit sockets, wax drips -- */
export const BellgraveWarden: FC<PortraitProps> = (props) => (
  <svg viewBox="0 0 48 48" {...props}>
    <Rig id="warden" ember={BLOOD} />
    <rect width="48" height="48" fill={`url(#warden-glow)`} />
    {/* massive pauldroned shoulders */}
    <path d="M4 46 C6 37 12 33.4 18 33 L30 33 C36 33.4 42 37 44 46 Z" fill="url(#warden-cloak)" />
    <path d="M4.5 41 C7 36.4 10.4 34.4 14 33.8 L15 37.4 C11 38 8 39.4 6 42.6 Z" fill="url(#warden-bone)" opacity="0.6" />
    <path d="M43.5 41 C41 36.4 37.6 34.4 34 33.8 L33 37.4 C37 38 40 39.4 42 42.6 Z" fill="url(#warden-bone)" opacity="0.6" />
    {/* the cracked bell crown */}
    <path d="M24 3.5 C23.2 3.5 22.6 4.1 22.6 4.9 C18.6 6 16.2 9.4 16.2 13.8 L15.8 16.4 L32.2 16.4 L31.8 13.8 C31.8 9.4 29.4 6 25.4 4.9 C25.4 4.1 24.8 3.5 24 3.5 Z" fill="url(#warden-bronze)" />
    <path d="M27.6 6.8 L26.8 10.4 L28.8 12.8 L27.6 16.4" stroke="#2a1a0c" strokeWidth="0.8" fill="none" strokeLinecap="round" />
    {/* wax drips from the crown */}
    <path d="M18.4 16.4 C18.3 18.4 18.6 19.6 18.4 21.4 C17.7 21.2 17.4 20.2 17.5 16.4 Z M30 16.4 C30.1 18 30.3 19 30.1 20.4 C29.4 20.2 29.2 19.2 29.2 16.4 Z" fill={EMBER} opacity="0.6" />
    {/* the skull */}
    <path d="M24 15 C17.4 15 13.2 20 13.2 26.4 C13.2 30.6 15.2 34 18.2 35.8 L18.2 39.6 L29.8 39.6 L29.8 35.8 C32.8 34 34.8 30.6 34.8 26.4 C34.8 20 30.6 15 24 15 Z" fill="url(#warden-bone)" />
    {/* blood-lit sockets */}
    <path d="M16.4 25 a3.6 3.2 0 1 0 7.2 0 a3.6 3.2 0 1 0 -7.2 0 Z" fill="#0a0608" />
    <path d="M24.4 25 a3.6 3.2 0 1 0 7.2 0 a3.6 3.2 0 1 0 -7.2 0 Z" fill="#0a0608" />
    <circle cx="20" cy="25.2" r="1.5" fill="url(#warden-eye)" />
    <circle cx="28" cy="25.2" r="1.5" fill="url(#warden-eye)" />
    <path d="M24 28.6 L22.4 32 L25.6 32 Z" fill="#0a0608" />
    {/* teeth */}
    <path d="M19.4 36 v3 M21.8 36.4 v3 M24.2 36.4 v3 M26.6 36.4 v3 M29 36 v3" stroke="#0a0608" strokeWidth="0.8" />
    {/* cold rim on the skull's brow */}
    <path d="M14.8 20.4 C17 16.8 20.2 15.2 24 15.1 C20.6 15.9 17.6 17.6 14.8 20.4 Z" fill={RIM} />
    <Frame id="warden" />
  </svg>
);

/* -- The Bulwark crest: the shield that rings inward -- */
export const BulwarkCrest: FC<PortraitProps> = (props) => (
  <svg viewBox="0 0 48 48" {...props}>
    <Rig id="bulwark" />
    <rect width="48" height="48" fill={`url(#bulwark-glow)`} />
    {/* shield body */}
    <path d="M24 4 C29 7 34.5 8 39 8 C39 20 37 32 24 44 C11 32 9 20 9 8 C13.5 8 19 7 24 4 Z" fill="url(#bulwark-cloak)" />
    <path d="M24 4 C29 7 34.5 8 39 8 C39 20 37 32 24 44 C11 32 9 20 9 8 C13.5 8 19 7 24 4 Z" fill="none" stroke={EMBER} strokeWidth="1.1" />
    <path d="M24 7.2 C28 9.4 32.4 10.4 36 10.6 C35.8 20.4 34 30.4 24 40.4 C14 30.4 12.2 20.4 12 10.6 C15.6 10.4 20 9.4 24 7.2 Z" fill="none" stroke="rgba(215, 167, 86, 0.3)" strokeWidth="0.5" />
    {/* the engraved bell */}
    <path d="M24 14 C23.4 14 23 14.4 23 15 C20 15.9 18.3 18.4 18.3 21.6 L18 25 C17.9 26 17.2 26.7 17.2 27.5 L30.8 27.5 C30.8 26.7 30.1 26 30 25 L29.7 21.6 C29.7 18.4 28 15.9 25 15 C25 14.4 24.6 14 24 14 Z" fill="url(#bulwark-bronze)" />
    <circle cx="24" cy="28.8" r="1.2" fill="url(#bulwark-eye)" />
    {/* the inward ring: sound arcs bending into the bell */}
    <g stroke={EMBER} strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.8">
      <path d="M14.2 21 C15.6 21.6 16.4 22.4 16.8 23.6" />
      <path d="M33.8 21 C32.4 21.6 31.6 22.4 31.2 23.6" />
      <path d="M16.4 17 C17.4 17.4 18 18 18.4 18.8" opacity="0.55" />
      <path d="M31.6 17 C30.6 17.4 30 18 29.6 18.8" opacity="0.55" />
    </g>
    {/* cold rim on the shield's left shoulder */}
    <path d="M11 9.4 C14.6 9.2 18.6 8.4 22 6.6 C18.4 9 14.8 10 11 10.4 Z" fill={RIM} />
    <Frame id="bulwark" />
  </svg>
);

export const BESTIARY: Record<string, FC<PortraitProps>> = {
  "vowless-pilgrim-shade": VowlessPilgrimShade,
  "ash-bitten-bones": AshBittenBones,
  "bell-ringer-shade": BellRingerShade,
  "bone-hook-crawler": BoneHookCrawler,
  "bone-rattle-add": BoneRattleAdd,
  "bellgrave-warden": BellgraveWarden
};

export function portraitFor(enemyId: string): FC<PortraitProps> {
  return BESTIARY[enemyId] ?? VowlessPilgrimShade;
}
