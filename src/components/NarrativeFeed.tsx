import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import type { ActionButton, FeedEntry } from "../game/types";

interface Props {
  entries: FeedEntry[];
  actions: ActionButton[];
  onCommand: (command: string) => void;
}

const typeClass: Record<string, string> = {
  system: "feed-system",
  scene: "feed-scene",
  command: "feed-command",
  dialogue: "feed-dialogue",
  social: "feed-social",
  combat: "feed-combat",
  loot: "feed-loot",
  recap: "feed-recap",
  warning: "feed-warning"
};

export function NarrativeFeed({ entries, actions, onCommand }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [entries.length]);

  return (
    <section className="narrative-feed">
      <div className="feed-stack">
        {entries.map((entry) => (
          <article className={`feed-entry ${typeClass[entry.type] ?? typeClass.system}`} key={entry.id}>
            <div className="feed-header">
              <span className="feed-type">{entry.type}</span>
              <h2>{entry.title}</h2>
              {entry.meta ? <span className="feed-meta">{entry.meta}</span> : null}
            </div>
            <p className="feed-body">{entry.body}</p>
          </article>
        ))}

        <div className="available-actions">
          <div className="available-title">
            <Sparkles size={14} />
            <span>Available Actions</span>
          </div>
          <div className="action-row">
            {actions.map((action) => (
              <button
                className={`action-button ${action.tone ?? ""} ${action.category ? `category-${action.category}` : ""}`}
                key={`${action.command}-${action.label}`}
                type="button"
                onClick={() => onCommand(action.command)}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
        <div ref={bottomRef} />
      </div>
    </section>
  );
}
