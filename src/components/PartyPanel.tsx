import { Users } from "lucide-react";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
}

export function PartyPanel({ state }: Props) {
  const companionHp = state.encounter ? Math.min(30, Math.max(16, state.character.hp - 4)) : 30;
  const rememberedParty = state.social.recentParty
    .map((name) => state.social.contacts.find((contact) => contact.name === name))
    .filter(Boolean)
    .slice(0, 4);

  return (
    <section className="panel">
      <div className="panel-title">
        <Users size={15} />
        <span>Party</span>
      </div>
      <div className="stack-sm">
        <PartyRow name={state.character.name} role="Bulwark" hp={`${state.character.hp}/${state.character.maxHp}`} active />
        {rememberedParty.map((contact) => (
          <PartyRow
            hp={partyStatusLabel(state, contact!.id, contact?.name === "Pilgrim Renn" ? `${companionHp}/30` : contact?.availability === "busy" ? "Support" : "Ready")}
            key={contact!.id}
            muted={contact?.availability !== "online"}
            name={contact!.name}
            role={contact!.role}
            mood={partyMoodLine(state, contact!.id)}
          />
        ))}
      </div>
    </section>
  );
}

function partyStatusLabel(state: GameState, contactId: string, fallback: string) {
  const readiness = state.social.partyReadiness.find((entry) => entry.contactId === contactId);
  if (!readiness) {
    return fallback;
  }
  if (readiness.status === "ready") {
    return "Ready";
  }
  if (readiness.status === "worried") {
    return "Worried";
  }
  if (readiness.status === "post-wipe") {
    return "Recovering";
  }
  if (readiness.status === "post-clear") {
    return "Clear";
  }
  return fallback;
}

function partyMoodLine(state: GameState, contactId: string) {
  const memory = state.social.memoryEvents.find((event) => event.contactId === contactId);
  if (memory) {
    return memory.summary;
  }
  const contact = state.social.contacts.find((entry) => entry.id === contactId);
  return contact?.relationshipTag;
}

function PartyRow({ name, role, hp, mood, active, muted }: { name: string; role: string; hp: string; mood?: string; active?: boolean; muted?: boolean }) {
  return (
    <div className={`party-row ${active ? "active" : ""} ${muted ? "muted" : ""}`}>
      <div>
        <p>{name}</p>
        <small>{role}</small>
        {mood ? <em>{mood}</em> : null}
      </div>
      <span>{hp}</span>
    </div>
  );
}
