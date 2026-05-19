import { ShieldAlert, Swords } from "lucide-react";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
  onCommand: (command: string) => void;
}

export function EncounterBubble({ state, onCommand }: Props) {
  if (!state.encounter) {
    return (
      <section className="encounter-idle">
        <div className="encounter-idle-inner">
          <div className="inline-status">
            <ShieldAlert size={18} />
            <span>No active encounter. The road is merely ominous.</span>
          </div>
          <button className="action-button quiet" type="button" onClick={() => onCommand("map")}>
            Map
          </button>
        </div>
      </section>
    );
  }

  const encounter = state.encounter;
  const lanes = ["Frontline", "Midline", "Backline"] as const;

  return (
    <section className="encounter-active">
      <div className="encounter-inner">
        <div className="encounter-topline">
          <div>
            <div className="encounter-label">
              <Swords size={14} />
              <span>Encounter Bubble</span>
            </div>
            <h2>{encounter.name}</h2>
          </div>
          <div className="encounter-stats">
            Round {encounter.round} / {state.character.hp} HP / {state.character.oath} Oath
          </div>
        </div>

        <div className="intent-card">
          <p>Enemy Intent</p>
          <strong>{encounter.currentIntentName}</strong>
          <span>{encounter.currentTelegraph}</span>
        </div>

        <div className="lane-grid">
          {lanes.map((lane) => {
            const playerHere = state.character.lane === lane;
            const enemiesHere = lane === "Frontline" ? encounter.enemies.filter((enemy) => enemy.hp > 0) : [];
            return (
              <div className={`lane-box ${playerHere ? "player" : ""}`} key={lane}>
                <div className="lane-header">
                  <span>{lane}</span>
                  {playerHere ? <small>Naki</small> : null}
                </div>
                <div className="lane-contents">
                  {enemiesHere.length ? (
                    enemiesHere.map((enemy) => (
                      <div className="enemy-chip" key={enemy.instanceId}>
                        {enemy.name}: {enemy.hp}/{enemy.maxHp}
                      </div>
                    ))
                  ) : (
                    <div className="enemy-chip quiet">Clear</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
