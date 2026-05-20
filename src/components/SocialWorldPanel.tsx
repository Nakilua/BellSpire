import { CheckCircle2, ClipboardList, Gauge, MessageCircle, Radio, Sparkles, UserPlus, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import { getNarrativeStatus } from "../game/narrativeDirector";
import type { GameState, SocialContactState } from "../game/types";

interface Props {
  state: GameState;
  onCommand: (command: string) => void;
}

export function SocialWorldPanel({ state, onCommand }: Props) {
  const onlineCount = state.social.contacts.filter((contact) => contact.availability === "online").length;
  const visibleContacts = [...state.social.contacts].sort(sortContacts).slice(0, 5);
  const director = state.social.director;
  const narrative = getNarrativeStatus(state);
  const budgetPercent = Math.min(100, Math.round((director.estimatedSpendUsd / director.monthlyBudgetUsd) * 100));
  const stopPercent = Math.min(100, Math.round((director.stopAtUsd / director.monthlyBudgetUsd) * 100));

  return (
    <section className="panel social-world-panel">
      <div className="panel-title">
        <MessageCircle size={15} />
        <span>Social World</span>
      </div>

      <div className="social-status-strip">
        <span>
          <Radio size={12} />
          {onlineCount} online
        </span>
        <span>{state.social.recentParty.length} remembered</span>
      </div>

      <div className="social-rep-grid">
        {Object.entries(state.social.socialReputation).map(([name, value]) => (
          <div className="social-rep" key={name}>
            <span>{name}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="director-card narrative-director-card">
        <div className="split-row tight">
          <h3>Narrative DM</h3>
          <span className="status-pill active">{narrative.tensionLabel}</span>
        </div>
        <p>{narrative.arcTitle}</p>
        <p>
          Chapter: {narrative.stageTitle} / Beats {narrative.seenBeatCount}
        </p>
        <div className="director-pressure" aria-label={`Narrative tension ${narrative.tension}`}>
          <span style={{ width: `${Math.max(8, narrative.tension * 10)}%` }} />
        </div>
        <p>{narrative.nextHint}</p>
        <div className="social-command-row">
          <button className="action-button quiet full-width" type="button" onClick={() => onCommand("story")}>
            Story Journal
          </button>
          <button className="action-button quiet full-width" type="button" onClick={() => onCommand("dm")}>
            DM Scene
          </button>
        </div>
      </div>

      <div className="director-card">
        <div className="split-row tight">
          <h3>AI Director</h3>
          <span className={`status-pill ${director.mode === "local-sim" ? "" : "active"}`}>{director.mode === "local-sim" ? "local" : "api ready"}</span>
        </div>
        <p>
          Intent: {director.lastIntent ?? "listening"} / Mood: {director.lastMood ?? "quiet"} / Memory: {director.memories.length}
        </p>
        <p>
          Models: {director.liveModel} for live / {director.cinematicModel} for cinematic
        </p>
        <p>
          Last: {director.lastProvider ?? "local"}
          {director.lastModel ? ` / ${director.lastModel}` : ""}
          {director.lastFallbackReason ? ` / fallback: ${director.lastFallbackReason}` : ""}
        </p>
        <div className="director-pressure" aria-label={`Story pressure ${director.storyPressure}`}>
          <span style={{ width: `${Math.max(8, director.storyPressure * 10)}%` }} />
        </div>
        <div className="budget-meter" aria-label={`AI budget ${budgetPercent}% used, stop at ${stopPercent}%`}>
          <span style={{ width: `${budgetPercent}%` }} />
          <i style={{ left: `${stopPercent}%` }} />
        </div>
        <div className="director-metric-row">
          <span>
            <Gauge size={12} />
            {formatUsd(director.estimatedSpendUsd)} / {formatUsd(director.monthlyBudgetUsd)}
          </span>
          <span className={`budget-state ${director.budgetStatus}`}>{director.budgetStatus}</span>
          <span>last {formatUsd(director.lastCostUsd)}</span>
        </div>
        <div className="director-metric-row compact">
          <span>live {director.liveTurnCount}</span>
          <span>cinematic {director.cinematicTurnCount}</span>
          <span>local {director.localTurnCount}</span>
        </div>
        <div className="quality-mode-grid" aria-label="AI quality mode">
          <button className={`mode-button ${director.qualityMode === "auto" ? "active" : ""}`} type="button" onClick={() => onCommand("ai mode auto")}>
            <Sparkles size={13} />
            Auto
          </button>
          <button className={`mode-button ${director.qualityMode === "mini" ? "active" : ""}`} type="button" onClick={() => onCommand("ai mode mini")}>
            Mini
          </button>
          <button className={`mode-button ${director.qualityMode === "cinematic" ? "active" : ""}`} type="button" onClick={() => onCommand("ai mode cinematic")}>
            5.4
          </button>
          <button className={`mode-button ${director.qualityMode === "local" ? "active" : ""}`} type="button" onClick={() => onCommand("ai mode local")}>
            Local
          </button>
        </div>
        <div className="social-command-row">
          <button className="action-button quiet full-width" type="button" onClick={() => onCommand("director what does the party notice here?")}>
            Ask Director
          </button>
          <button className="action-button quiet full-width" type="button" onClick={() => onCommand("social memory")}>
            Memory
          </button>
        </div>
      </div>

      <div className="social-command-row">
        <button className="action-button quiet full-width" type="button" onClick={() => onCommand("listen")}>
          <Radio size={14} />
          Listen
        </button>
        <button className="action-button quiet full-width" type="button" onClick={() => onCommand("who")}>
          <UsersRound size={14} />
          Nearby
        </button>
      </div>

      <div className="social-command-row">
        <button className="action-button quiet full-width" type="button" onClick={() => onCommand("party LFG for Pilgrim Trial Cryptlet. Bulwark ready for clean pulls.")}>
          <UsersRound size={14} />
          Post LFG
        </button>
        <button className="action-button quiet full-width" type="button" onClick={() => onCommand("channel guild-recruitment")}>
          <ClipboardList size={14} />
          Recruitment
        </button>
      </div>

      <SocialSectionTitle icon={<UsersRound size={13} />} label="Group Finder" />
      <div className="social-card-list">
        {state.social.groupListings.map((listing) => (
          <article className="social-card" key={listing.id}>
            <div className="split-row tight">
              <h3>{listing.name}</h3>
              <span className={`status-pill ${listing.status === "joined" ? "active" : ""}`}>{listing.status}</span>
            </div>
            <p>{listing.routeNote}</p>
            <small>Needs: {listing.rolesNeeded.join(", ")}</small>
            <button className="action-button full-width" type="button" onClick={() => onCommand(`join ${listing.name}`)}>
              <UserPlus size={14} />
              {listing.status === "joined" ? "Refresh Party" : "Join"}
            </button>
          </article>
        ))}
      </div>

      <SocialSectionTitle icon={<ClipboardList size={13} />} label="Guild Contracts" />
      <div className="social-card-list">
        {state.social.guildContracts.slice(0, 3).map((contract) => (
          <article className="social-card" key={contract.id}>
            <div className="split-row tight">
              <h3>{contract.name}</h3>
              <span className={`status-pill ${contract.status === "accepted" ? "active" : ""}`}>{contract.status}</span>
            </div>
            <p>{contract.requirement}</p>
            <small>{contract.reward}</small>
            <button
              className="action-button full-width quiet"
              type="button"
              disabled={contract.status === "accepted"}
              onClick={() => onCommand(`accept contract ${contract.name}`)}
            >
              <CheckCircle2 size={14} />
              {contract.status === "accepted" ? "Pinned" : "Accept"}
            </button>
          </article>
        ))}
      </div>

      <SocialSectionTitle icon={<MessageCircle size={13} />} label="Contacts" />
      <div className="contact-list">
        {visibleContacts.map((contact) => (
          <ContactRow contact={contact} key={contact.id} onCommand={onCommand} />
        ))}
      </div>
    </section>
  );
}

function ContactRow({ contact, onCommand }: { contact: SocialContactState; onCommand: (command: string) => void }) {
  return (
    <button className="contact-row" type="button" onClick={() => onCommand(`invite ${contact.name}`)}>
      <div>
        <div className="split-row tight">
          <p>{contact.name}</p>
          <span className={`contact-dot ${contact.availability}`} />
        </div>
        <small>{contact.role}</small>
        <div className="trust-track" aria-label={`${contact.name} trust ${contact.trust}`}>
          <span style={{ width: `${Math.max(8, Math.min(100, contact.trust))}%` }} />
        </div>
      </div>
      <span className="contact-tag">{contact.relationshipTag}</span>
    </button>
  );
}

function SocialSectionTitle({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="social-section-title">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function sortContacts(left: SocialContactState, right: SocialContactState) {
  const rank = { online: 0, busy: 1, away: 2 };
  return rank[left.availability] - rank[right.availability] || right.trust - left.trust;
}

function formatUsd(value: number) {
  return `$${value.toFixed(value >= 1 ? 2 : 4)}`;
}
