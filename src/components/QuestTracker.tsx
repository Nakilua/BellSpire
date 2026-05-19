import { ScrollText } from "lucide-react";
import quests from "../data/quests.json";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
}

export function QuestTracker({ state }: Props) {
  const quest = quests[0];
  const progress = state.quests[quest.id];
  const status = progress?.status ?? "inactive";
  const stepIndex = progress?.stepIndex ?? 0;

  return (
    <section className="panel">
      <div className="panel-title">
        <ScrollText size={15} />
        <span>Quest Tracker</span>
      </div>
      <div className="quest-card">
        <div className="split-row tight">
          <h3 className="panel-heading small">{quest.name}</h3>
          <span className={`status-pill ${status}`}>{status}</span>
        </div>
        <div className="quest-list">
          {quest.steps.map((step, index) => (
            <div className={`quest-step ${index < stepIndex || status === "complete" ? "done" : ""} ${index === stepIndex && status === "active" ? "active" : ""}`} key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
