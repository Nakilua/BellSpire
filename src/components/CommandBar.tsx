import { FormEvent, useState } from "react";
import { SendHorizontal } from "lucide-react";
import type { ActionButton, CurrentObjectiveState } from "../game/types";

interface Props {
  actions: ActionButton[];
  objective?: CurrentObjectiveState;
  onCommand: (command: string) => void;
}

export function CommandBar({ actions, objective, onCommand }: Props) {
  const [value, setValue] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const command = value.trim();
    if (!command) {
      return;
    }
    onCommand(command);
    setValue("");
  }

  return (
    <footer className="command-footer">
      {objective ? (
        <div className="current-objective-strip">
          <div>
            <span>Current objective</span>
            <strong>{objective.label}</strong>
            <small>{objective.mapPing}</small>
          </div>
          <button type="button" onClick={() => onCommand(objective.command)}>
            {objective.command}
          </button>
        </div>
      ) : null}
      <div className="hotbar-row" aria-label="Action hotbar">
        {actions.slice(0, 6).map((action, index) => (
          <button
            className={`hotbar-button ${action.tone ?? ""} ${action.category ? `category-${action.category}` : ""}`}
            type="button"
            onClick={() => onCommand(action.command)}
            key={`${action.command}-${index}`}
          >
            <small>{index + 1}</small>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
      <form className="command-form" onSubmit={submit}>
        <input
          className="command-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={objective?.command ? `Try: ${objective.command}` : actions[0]?.command ? `Try: ${actions[0].command}` : "Type a command"}
          aria-label="Bellspire command"
        />
        <button className="send-button" type="submit" title="Send command">
          <SendHorizontal size={18} />
          <span>Send</span>
        </button>
      </form>
    </footer>
  );
}
