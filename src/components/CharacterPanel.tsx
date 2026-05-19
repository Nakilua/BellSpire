import { HeartPulse, Shield } from "lucide-react";
import type { ReactNode } from "react";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
}

export function CharacterPanel({ state }: Props) {
  const hpPercent = Math.max(0, Math.round((state.character.hp / state.character.maxHp) * 100));
  const oathPercent = Math.min(100, state.character.oath);

  return (
    <section className="panel">
      <div className="panel-title">
        <Shield size={15} />
        <span>Character</span>
      </div>
      <div className="split-row">
        <div>
          <h3 className="panel-heading">{state.character.name}</h3>
          <p className="panel-muted">
            {state.character.className} / Level {state.character.level}
          </p>
        </div>
        <div className="lane-badge">{state.character.lane}</div>
      </div>

      <div className="meter-stack">
        <Meter icon={<HeartPulse size={14} />} label="HP" value={`${state.character.hp}/${state.character.maxHp}`} percent={hpPercent} tone="hp" />
        <Meter icon={<Shield size={14} />} label="Oath" value={`${state.character.oath}/100`} percent={oathPercent} tone="oath" />
      </div>

      <div className="stat-grid">
        <div className="stat-box">
          <span>Guard</span>
          <strong>{state.character.guardStance ? "Active" : "Ready"}</strong>
        </div>
        <div className="stat-box">
          <span>Condition</span>
          <strong>{state.character.condition ?? "Clear"}</strong>
        </div>
      </div>

      <div className="character-lore">
        <div>
          <span>Origin</span>
          <strong>{state.character.origin}</strong>
        </div>
        <div>
          <span>Vow</span>
          <strong>{state.character.vow}</strong>
        </div>
      </div>
    </section>
  );
}

function Meter({ icon, label, value, percent, tone }: { icon: ReactNode; label: string; value: string; percent: number; tone: "hp" | "oath" }) {
  return (
    <div>
      <div className="meter-label">
        <span>
          {icon}
          {label}
        </span>
        <span>{value}</span>
      </div>
      <div className="meter-track">
        <div className={`meter-fill ${tone}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
