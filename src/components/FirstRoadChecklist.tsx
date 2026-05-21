import { CheckCircle2, Circle, Footprints } from "lucide-react";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
  onCommand: (command: string) => void;
}

const steps = [
  {
    id: "create-character",
    label: "Create your Bulwark",
    command: "look",
    done: (state: GameState) => state.profileCreated
  },
  {
    id: "hear-world",
    label: "Hear the world breathe",
    command: "listen",
    done: (state: GameState) => state.livingWorld.tick > 0
  },
  {
    id: "find-party",
    label: "Find or form a training party",
    command: "lfg",
    done: (state: GameState) => state.social.groupListings.some((listing) => listing.status === "joined")
  },
  {
    id: "reach-shrine",
    label: "Reach Little Dawn",
    command: "travel Road Shrine of Little Dawn",
    done: (state: GameState) => state.sessionRecap.visited.includes("Road Shrine of Little Dawn")
  },
  {
    id: "speak-olla",
    label: "Talk to Shrinekeeper Olla",
    command: "talk Shrinekeeper Olla",
    done: (state: GameState) => Boolean(state.flags.ollaPermission)
  },
  {
    id: "enter-cryptlet",
    label: "Enter the Cryptlet",
    command: "enter dungeon",
    done: (state: GameState) => Boolean(state.dungeon)
  },
  {
    id: "claim-cache",
    label: "Claim and report the clear",
    command: "recap",
    done: (state: GameState) => Boolean(state.flags.cryptletComplete)
  }
];

export function FirstRoadChecklist({ state, onCommand }: Props) {
  return (
    <section className="panel first-road-checklist">
      <div className="panel-title">
        <Footprints size={15} />
        <span>First Road</span>
      </div>
      <div className="checklist-list">
        {steps.map((step) => {
          const done = step.done(state);
          const Icon = done ? CheckCircle2 : Circle;
          return (
            <button className={`checklist-row ${done ? "done" : ""}`} type="button" onClick={() => onCommand(step.command)} key={step.id}>
              <Icon size={15} />
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
