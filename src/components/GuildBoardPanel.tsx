import { ClipboardCheck } from "lucide-react";
import type { GameState, GuildContractState } from "../game/types";

interface Props {
  state: GameState;
  onCommand: (command: string) => void;
}

export function GuildBoardPanel({ state, onCommand }: Props) {
  return (
    <section className="panel guild-board-panel">
      <div className="panel-title">
        <ClipboardCheck size={15} />
        <span>Guild Board</span>
      </div>
      <div className="guild-contract-list">
        {state.social.guildContracts.map((contract) => (
          <GuildContractCard contract={contract} key={contract.id} onCommand={onCommand} />
        ))}
      </div>
    </section>
  );
}

function GuildContractCard({ contract, onCommand }: { contract: GuildContractState; onCommand: (command: string) => void }) {
  const canReport = contract.status === "complete";
  const command = canReport ? `report contract ${contract.name}` : `accept contract ${contract.name}`;

  return (
    <article className="guild-contract-card">
      <div className="split-row tight">
        <h3>{contract.name}</h3>
        <span className={`status-pill ${contract.status === "complete" || contract.status === "reported" ? "complete" : contract.status === "accepted" ? "active" : ""}`}>
          {contract.status}
        </span>
      </div>
      <p>{contract.requirement}</p>
      <div className="contract-progress" aria-label={`${contract.name} progress ${contract.progress}`}>
        <span style={{ width: `${Math.max(4, Math.min(100, contract.progress))}%` }} />
      </div>
      <small>Reward: {contract.reward}</small>
      <button className="action-button full-width quiet" type="button" disabled={contract.status === "reported"} onClick={() => onCommand(command)}>
        {canReport ? "Report Contract" : contract.status === "accepted" ? "Pinned" : "Accept Contract"}
      </button>
    </article>
  );
}
