import { BookUser, HeartHandshake } from "lucide-react";
import type { GameState, SocialContactState } from "../game/types";

interface Props {
  state: GameState;
  onCommand: (command: string) => void;
}

export function SocialLedgerPanel({ state, onCommand }: Props) {
  const contacts = [...state.social.contacts].sort((left, right) => right.trust - left.trust);

  return (
    <section className="panel social-ledger-panel">
      <div className="panel-title">
        <BookUser size={15} />
        <span>Social Ledger</span>
      </div>
      <div className="social-ledger-grid">
        {contacts.slice(0, 6).map((contact) => (
          <ContactLedgerCard contact={contact} key={contact.id} memory={latestMemory(state, contact.id)} onCommand={onCommand} />
        ))}
      </div>

      <div className="memory-ledger">
        <div className="social-section-title">
          <HeartHandshake size={13} />
          <span>Recent Memory</span>
        </div>
        {state.social.memoryEvents.slice(0, 6).map((memory) => (
          <article className="memory-row" key={memory.id}>
            <strong>{memory.contactName}</strong>
            <p>{memory.summary}</p>
            <small>{memory.kind} / {memory.source} / tick {memory.tick}</small>
          </article>
        ))}
        {!state.social.memoryEvents.length ? <p className="panel-note">No memory events yet. Invite, ready-check, thank, wipe, clear, or report to start the ledger.</p> : null}
      </div>
    </section>
  );
}

function ContactLedgerCard({ contact, memory, onCommand }: { contact: SocialContactState; memory?: string; onCommand: (command: string) => void }) {
  return (
    <article className="contact-ledger-card">
      <div className="split-row tight">
        <h3>{contact.name}</h3>
        <span className={`contact-dot ${contact.availability}`} />
      </div>
      <p>{contact.role}</p>
      <small>{relationshipText(contact.trust)} / {contact.availability}</small>
      <div className="trust-track" aria-label={`${contact.name} trust ${contact.trust}`}>
        <span style={{ width: `${Math.max(8, Math.min(100, contact.trust))}%` }} />
      </div>
      <p>{memory ?? contact.notes[0] ?? "No memory yet."}</p>
      <small>Likely reaction: {likelyReaction(contact)}</small>
      <button className="action-button quiet full-width" type="button" onClick={() => onCommand(`invite ${contact.name}`)}>
        Invite / Ping
      </button>
    </article>
  );
}

function latestMemory(state: GameState, contactId: string) {
  return state.social.memoryEvents.find((memory) => memory.contactId === contactId)?.summary;
}

function relationshipText(trust: number) {
  if (trust >= 65) {
    return "trusted ally";
  }
  if (trust >= 40) {
    return "reliable contact";
  }
  if (trust >= 22) {
    return "known ally";
  }
  if (trust >= 10) {
    return "recent ally";
  }
  return "new contact";
}

function likelyReaction(contact: SocialContactState) {
  if (contact.kind === "guild") {
    return "will ask for clean source notes";
  }
  if (contact.availability === "away") {
    return "may answer later";
  }
  if (contact.trust >= 22) {
    return "likely to help if the route is clear";
  }
  return "will need a clean ask";
}
