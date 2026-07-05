import { Bell } from "lucide-react";
import type { FC, SVGProps } from "react";
import { BulwarkCrest, portraitFor } from "./BestiaryArt";
import type { EncounterState, GameState, Lane } from "../../game/types";

// The Bellgrave Diorama: an isometric stone stage that renders the live
// encounter state — the DM's miniatures table. Pure view: it reads the same
// EncounterState the text feed narrates and never owns any rules. Drawn in
// Waxlight (docs/UI_UX_GOALS.md): crisp lucide tokens, gold = live, blood =
// threat, organic texture nowhere near the icons.

const LANES: Lane[] = ["Frontline", "Midline", "Backline"];

// stage geometry: enemies deep in the crypt, Frontline nearest them,
// Backline nearest the viewer. Each slab is a sheared stone platform.
const SLABS: Record<string, { y: number; h: number; x0: number; x1: number; shear: number }> = {
  enemy: { y: 26, h: 12, x0: 42, x1: 122, shear: 5 },
  Frontline: { y: 44, h: 11, x0: 38, x1: 124, shear: 4 },
  Midline: { y: 58, h: 11, x0: 34, x1: 127, shear: 3 },
  Backline: { y: 72, h: 11, x0: 30, x1: 130, shear: 2 }
};

function slabPath(slab: { y: number; h: number; x0: number; x1: number; shear: number }) {
  return `M${slab.x0 + slab.shear} ${slab.y} L${slab.x1 + slab.shear} ${slab.y} L${slab.x1} ${slab.y + slab.h} L${slab.x0} ${slab.y + slab.h} Z`;
}

// which part of the stage the current telegraph threatens
function telegraphTargets(encounter: EncounterState, playerLane: Lane): { lanes: Lane[]; object: boolean } {
  switch (encounter.currentIntentId) {
    case "grave-bell-swing":
    case "hook-drag":
    case "bone-snare":
      return { lanes: ["Frontline"], object: false };
    case "final-toll":
      return { lanes: [...LANES], object: false };
    case "vowless-mark":
    case "unanswered-name":
      return { lanes: [playerLane], object: false };
    case "road-seal-pulse":
    case "ritual-windup":
    case "wax-channel-pressure":
      return { lanes: [], object: true };
    default:
      return { lanes: [playerLane], object: false };
  }
}

function HealthArc({ cx, cy, r, current, max, tone }: { cx: number; cy: number; r: number; current: number; max: number; tone: string }) {
  const circumference = 2 * Math.PI * r;
  const fraction = Math.max(0, Math.min(1, current / max));
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke={tone}
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeDasharray={`${circumference * fraction} ${circumference}`}
      transform={`rotate(-90 ${cx} ${cy})`}
    />
  );
}

function Token({
  cx,
  cy,
  r,
  portrait: Portrait,
  clipId,
  ring,
  label,
  sub,
  glow = false
}: {
  cx: number;
  cy: number;
  r: number;
  portrait: FC<SVGProps<SVGSVGElement>>;
  clipId: string;
  ring: string;
  label: string;
  sub?: string;
  glow?: boolean;
}) {
  const portraitSize = r * 2.02;
  return (
    <g>
      {glow ? <circle cx={cx} cy={cy} r={r + 2.4} fill="none" stroke="rgba(233, 188, 106, 0.45)" strokeWidth="0.5" className="diorama-guard-ring" /> : null}
      <ellipse cx={cx} cy={cy + r + 1.2} rx={r * 0.9} ry={r * 0.32} fill="rgba(0, 0, 0, 0.55)" />
      <clipPath id={clipId}>
        <circle cx={cx} cy={cy} r={r - 0.25} />
      </clipPath>
      <circle cx={cx} cy={cy} r={r} fill="#120c09" stroke={ring} strokeWidth="0.5" />
      <g clipPath={`url(#${clipId})`}>
        <Portrait x={cx - portraitSize / 2} y={cy - portraitSize / 2} width={portraitSize} height={portraitSize} aria-hidden="true" />
      </g>
      <text x={cx} y={cy + r + 4.4} textAnchor="middle" fill="rgba(240, 228, 208, 0.85)" fontSize="2.1" fontFamily="Cinzel, Georgia, serif" letterSpacing="0.15">
        {label}
      </text>
      {sub ? (
        <text x={cx} y={cy + r + 7.4} textAnchor="middle" fill="rgba(215, 167, 86, 0.8)" fontSize="1.9" fontFamily="EB Garamond, Georgia, serif">
          {sub}
        </text>
      ) : null}
    </g>
  );
}

export function EncounterDiorama({ state }: { state: GameState }) {
  const encounter = state.encounter;
  if (!encounter) {
    return null;
  }

  const playerLane = state.character.lane;
  const targets = telegraphTargets(encounter, playerLane);
  const aliveEnemies = encounter.enemies.filter((enemy) => enemy.hp > 0);
  const enemySlab = SLABS.enemy;
  const enemySpacing = (enemySlab.x1 - enemySlab.x0) / (aliveEnemies.length + 1);
  const playerSlab = SLABS[playerLane];
  const showBellObject = targets.object || encounter.roadSealPrimed;
  const wardenPresent = aliveEnemies.some((enemy) => enemy.enemyId === "bellgrave-warden");

  return (
    <div className="encounter-diorama" aria-label="Encounter diorama">
      <svg viewBox="0 0 160 92" preserveAspectRatio="xMidYMid meet" role="img">
        <defs>
          <radialGradient id="diorama-vault" cx="50%" cy="18%" r="90%">
            <stop offset="0%" stopColor="#241811" />
            <stop offset="60%" stopColor="#170f0b" />
            <stop offset="100%" stopColor="#0c0708" />
          </radialGradient>
          <radialGradient id="diorama-candle" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(233, 188, 106, 0.5)" />
            <stop offset="100%" stopColor="rgba(233, 188, 106, 0)" />
          </radialGradient>
        </defs>

        <rect width="160" height="92" fill="url(#diorama-vault)" />
        {wardenPresent ? <rect width="160" height="92" fill="rgba(60, 10, 22, 0.22)" /> : null}

        {/* back wall: arch niches and candles */}
        <g stroke="rgba(240, 228, 208, 0.14)" strokeWidth="0.4" fill="none">
          <path d="M20 24 L20 4 M140 24 L140 4" />
          {[38, 66, 94, 122].map((ax) => (
            <path d={`M${ax - 5} 22 L${ax - 5} 12 A5 5.5 0 0 1 ${ax + 5} 12 L${ax + 5} 22`} key={ax} />
          ))}
        </g>
        {[38, 66, 94, 122].map((ax) => (
          <g key={`c-${ax}`}>
            <circle cx={ax} cy={17} r="4.5" fill="url(#diorama-candle)" opacity="0.5" />
            <circle cx={ax} cy={17.6} r="0.55" fill={wardenPresent ? "rgba(196, 84, 108, 0.9)" : "rgba(233, 188, 106, 0.9)"} className="diorama-flicker" />
          </g>
        ))}

        {/* lane slabs, viewer-side */}
        {LANES.map((lane) => {
          const slab = SLABS[lane];
          const threatened = targets.lanes.includes(lane);
          return (
            <g key={lane}>
              <path
                d={slabPath(slab)}
                fill={threatened ? "rgba(126, 31, 57, 0.3)" : lane === playerLane ? "rgba(215, 167, 86, 0.07)" : "rgba(240, 228, 208, 0.035)"}
                stroke={threatened ? "rgba(182, 58, 84, 0.75)" : lane === playerLane ? "rgba(215, 167, 86, 0.45)" : "rgba(240, 228, 208, 0.12)"}
                strokeWidth={threatened || lane === playerLane ? 0.5 : 0.35}
                className={threatened ? "diorama-telegraph" : undefined}
              />
              <g stroke="rgba(240, 228, 208, 0.06)" strokeWidth="0.3">
                {[0.25, 0.5, 0.75].map((f) => {
                  const jx0 = slab.x0 + (slab.x1 - slab.x0) * f;
                  return <path d={`M${jx0 + slab.shear} ${slab.y} L${jx0} ${slab.y + slab.h}`} key={f} />;
                })}
              </g>
              <text
                x={slab.x0 - 2}
                y={slab.y + slab.h / 2 + 1}
                textAnchor="end"
                fill={lane === playerLane ? "rgba(233, 188, 106, 0.9)" : "rgba(240, 228, 208, 0.4)"}
                fontSize="2.6"
                fontFamily="Cinzel, Georgia, serif"
                letterSpacing="0.3"
              >
                {lane.toUpperCase()}
              </text>
            </g>
          );
        })}

        {/* enemy slab */}
        <path d={slabPath(enemySlab)} fill="rgba(126, 31, 57, 0.08)" stroke="rgba(182, 58, 84, 0.35)" strokeWidth="0.4" />

        {/* enemy tokens with health arcs */}
        {aliveEnemies.map((enemy, index) => {
          const cx = enemySlab.x0 + enemySpacing * (index + 1);
          const cy = enemySlab.y + enemySlab.h / 2;
          return (
            <g key={enemy.instanceId}>
              <Token
                cx={cx}
                cy={cy}
                r={5.2}
                portrait={portraitFor(enemy.enemyId)}
                clipId={`tok-${enemy.instanceId}`}
                ring={enemy.threatSealed ? "rgba(215, 167, 86, 0.7)" : "rgba(182, 58, 84, 0.8)"}
                label={enemy.name.length > 13 ? `${enemy.name.slice(0, 12)}…` : enemy.name}
                sub={`${enemy.hp}/${enemy.maxHp}`}
              />
              <HealthArc cx={cx} cy={cy} r={6.3} current={enemy.hp} max={enemy.maxHp} tone="rgba(182, 58, 84, 0.85)" />
            </g>
          );
        })}

        {/* the player token */}
        <g>
          <Token
            cx={(playerSlab.x0 + playerSlab.x1) / 2}
            cy={playerSlab.y + playerSlab.h / 2 - 0.6}
            r={5.6}
            portrait={BulwarkCrest}
            clipId="tok-player"
            ring="rgba(233, 188, 106, 0.95)"
            label={state.character.name.toUpperCase()}
            sub={`${state.character.hp}/${state.character.maxHp} HP`}
            glow={state.character.guardStance}
          />
          <HealthArc
            cx={(playerSlab.x0 + playerSlab.x1) / 2}
            cy={playerSlab.y + playerSlab.h / 2 - 0.6}
            r={6.7}
            current={state.character.hp}
            max={state.character.maxHp}
            tone="rgba(233, 188, 106, 0.9)"
          />
        </g>

        {/* the Road-Seal Bell, when the room object matters */}
        {showBellObject ? (
          <g className={targets.object ? "diorama-telegraph" : undefined}>
            <path d="M146 44 h8 l1 12 h-10 Z" fill="#120c09" stroke="rgba(215, 167, 86, 0.4)" strokeWidth="0.4" />
            <circle cx="150" cy="40" r="5.4" fill="url(#diorama-candle)" opacity={encounter.roadSealPrimed ? 0.8 : 0.35} />
            <Bell x={147.2} y={37.2} width={5.6} height={5.6} color={encounter.roadSealPrimed ? "#e9bc6a" : "rgba(215, 167, 86, 0.6)"} strokeWidth={1.9} aria-hidden="true" />
            <text x="150" y="60" textAnchor="middle" fill="rgba(215, 167, 86, 0.75)" fontSize="2.2" fontFamily="EB Garamond, Georgia, serif" fontStyle="italic">
              {encounter.roadSealPrimed ? "primed" : "road-seal"}
            </text>
          </g>
        ) : null}

        {/* round marker */}
        <text x="6" y="8" fill="rgba(215, 167, 86, 0.7)" fontSize="2.8" fontFamily="Cinzel, Georgia, serif" letterSpacing="0.4">
          ROUND {encounter.round}
        </text>
      </svg>
    </div>
  );
}
