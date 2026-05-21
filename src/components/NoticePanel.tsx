import { MailOpen } from "lucide-react";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
}

export function NoticePanel({ state }: Props) {
  return (
    <section className="panel notice-panel">
      <div className="panel-title">
        <MailOpen size={15} />
        <span>Notices</span>
      </div>
      <div className="notice-list">
        {state.social.notices.slice(0, 6).map((notice) => (
          <article className="notice-row" key={notice.id}>
            <strong>{notice.title}</strong>
            <p>{notice.body}</p>
            <small>{notice.source} / tick {notice.createdAtTick}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
