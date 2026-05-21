import { ClipboardList, Lock } from "lucide-react";
import zones from "../data/zones.json";
import { getActivityRecommendations, getBestActivityRecommendation } from "../game/activity";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
  onCommand: (command: string) => void;
}

export function ActivityBoard({ state, onCommand }: Props) {
  const dungeonReady = Boolean(state.flags.ollaPermission);
  const best = getBestActivityRecommendation(state);
  const recommendations = getActivityRecommendations(state);

  return (
    <section className="panel">
      <div className="panel-title">
        <ClipboardList size={15} />
        <span>Activity Board</span>
      </div>
      <button className="activity-card primary-recommendation" type="button" onClick={() => onCommand(best.command)}>
        <div>
          <small>{best.label} / {best.lane}</small>
          <h3>{best.title}</h3>
          <p>{best.summary}</p>
          <p>Map ping: {best.mapPing}</p>
        </div>
        <span>Go</span>
      </button>

      <div className="recommendation-list">
        {recommendations.slice(0, 3).map((recommendation) => (
          <button className="recommendation-row" type="button" onClick={() => onCommand(recommendation.command)} key={recommendation.id}>
            <div>
              <span>{recommendation.label}</span>
              <strong>{recommendation.title}</strong>
              <small>{recommendation.mapPing}</small>
            </div>
            <i>{recommendation.lane}</i>
          </button>
        ))}
      </div>

      <button className="activity-card" type="button" onClick={() => onCommand(dungeonReady ? "enter dungeon" : "travel Road Shrine of Little Dawn")}>
        <div>
          <h3>Pilgrim Trial Cryptlet</h3>
          <p>{dungeonReady ? "Training mode open" : "Talk to Shrinekeeper Olla to unlock"}</p>
        </div>
        <span>{dungeonReady ? "Ready" : "Locked"}</span>
      </button>
      <p className="panel-note">Recommendations are local and source-safe; they point you at the next useful action without spending API budget.</p>

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
