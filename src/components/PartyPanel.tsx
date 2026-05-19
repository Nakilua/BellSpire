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
            hp={contact?.name === "Pilgrim Renn" ? `${companionHp}/30` : contact?.availability === "busy" ? "Support" : "Ready"}
            key={contact!.id}
            muted={contact?.availability !== "online"}
            name={contact!.name}
            role={contact!.role}
          />
        ))}
      </div>
    </section>
  );
}

function PartyRow({ name, role, hp, active, muted }: { name: string; role: string; hp: string; active?: boolean; muted?: boolean }) {
  return (
    <div className={`party-row ${active ? "active" : ""} ${muted ? "muted" : ""}`}>
      <div>
        <p>{name}</p>
        <small>{role}</small>
      </div>
      <span>{hp}</span>
    </div>
  );
}
