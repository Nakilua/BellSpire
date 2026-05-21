import { Backpack } from "lucide-react";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
}

export function InventoryPanel({ state }: Props) {
  return (
    <section className="panel">
      <div className="panel-title">
        <Backpack size={15} />
        <span>Inventory</span>
      </div>
      <div className="stack-sm">
        {state.pendingLootRoll ? (
          <div className={`inventory-row rarity-${state.pendingLootRoll.rarity.toLowerCase()}`}>
            <div>
              <p>Roll pending: {state.pendingLootRoll.itemName}</p>
              <small>
                {state.pendingLootRoll.rarity} / {state.pendingLootRoll.binding} / {state.pendingLootRoll.sourceName}
              </small>
              <small>{state.pendingLootRoll.reason}</small>
            </div>
            <span>{state.pendingLootRoll.canNeed ? "Need?" : "Greed?"}</span>
          </div>
        ) : null}
        {state.inventory.map((item) => (
          <div
            className={`inventory-row rarity-${(item.rarity ?? "unrated").toLowerCase()}`}
            key={item.id}
            title={`${item.source} / ${item.sourceStatus}`}
          >
            <div>
              <p>{item.name}</p>
              <small>
                {item.rarity ?? "Unrated"} {item.kind}
                {item.itemLevel ? ` / Item ${item.itemLevel}` : ""} / {item.binding ?? "Tradable"}
              </small>
              <small>{item.sourceStatus}</small>
            </div>
            <span>x{item.quantity}</span>
          </div>
        ))}
        {state.sessionRecap.lootRolls.length ? (
          <div className="loot-history">
            <strong>Loot rolls</strong>
            {state.sessionRecap.lootRolls.slice(-4).map((line) => (
              <small key={line}>{line}</small>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
