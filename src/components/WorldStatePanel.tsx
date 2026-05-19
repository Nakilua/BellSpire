import { Flag } from "lucide-react";
import worldFlags from "../data/worldFlags.json";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
}

export function WorldStatePanel({ state }: Props) {
  return (
    <section className="panel">
      <div className="panel-title">
        <Flag size={15} />
        <span>World State</span>
      </div>
      <div className="stack-sm">
        {worldFlags.map((flag) => {
          const active = Boolean(state.flags[flag.id]);
          return (
            <div className={`flag-row ${active ? "active" : ""}`} key={flag.id}>
              <span>{flag.label}</span>
              <small>{active ? "set" : "open"}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}
