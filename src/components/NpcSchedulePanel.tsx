import { Clock3 } from "lucide-react";
import npcSchedules from "../data/npcSchedules.json";
import { getCurrentZone } from "../game/selectors";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
}

interface NpcSchedule {
  contactId: string;
  defaultAvailability: "online" | "away" | "busy";
  routine: string;
  presentWhen: string[];
  reactionHooks: string[];
  sourceNote: string;
}

const schedules = npcSchedules as NpcSchedule[];

export function NpcSchedulePanel({ state }: Props) {
  const zone = getCurrentZone(state);
  const contextKeys = new Set([zone.id, state.locationPoiId, state.activeChannelId, state.dungeon?.dungeonId].filter(Boolean));

  return (
    <section className="panel npc-schedule-panel">
      <div className="panel-title">
        <Clock3 size={15} />
        <span>Local Schedules</span>
      </div>
      <div className="schedule-list">
        {schedules.map((schedule) => {
          const contact = state.social.contacts.find((entry) => entry.id === schedule.contactId);
          const present = schedule.presentWhen.some((key) => contextKeys.has(key));
          const availability = present ? contact?.availability ?? schedule.defaultAvailability : "away";
          return (
            <article className={`schedule-row ${present ? "present" : ""}`} key={schedule.contactId}>
              <div className="split-row tight">
                <strong>{contact?.name ?? schedule.contactId}</strong>
                <span className={`status-pill ${present ? "active" : ""}`}>{availability}</span>
              </div>
              <p>{schedule.routine}</p>
              <small>Hooks: {schedule.reactionHooks.join(" / ")}</small>
              <small>{schedule.sourceNote}</small>
            </article>
          );
        })}
      </div>
    </section>
  );
}
