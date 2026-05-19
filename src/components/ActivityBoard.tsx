import { ClipboardList, Lock } from "lucide-react";
import zones from "../data/zones.json";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
  onCommand: (command: string) => void;
}

export function ActivityBoard({ state, onCommand }: Props) {
  const dungeonReady = Boolean(state.flags.ollaPermission);

  return (
    <section className="panel">
      <div className="panel-title">
        <ClipboardList size={15} />
        <span>Activity Board</span>
      </div>
      <button className="activity-card" type="button" onClick={() => onCommand(dungeonReady ? "enter dungeon" : "travel Road Shrine of Little Dawn")}>
        <div>
          <h3>Pilgrim Trial Cryptlet</h3>
          <p>{dungeonReady ? "Training mode open" : "Talk to Shrinekeeper Olla to unlock"}</p>
        </div>
        <span>{dungeonReady ? "Ready" : "Locked"}</span>
      </button>

      <div className="locked-activity-list">
        {zones
          .filter((zone) => zone.locked)
          .slice(0, 4)
          .map((zone) => (
            <div className="locked-activity" key={zone.id}>
              <Lock size={13} />
              <div>
                <p>{zone.name}</p>
                <small>{zone.summary}</small>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
