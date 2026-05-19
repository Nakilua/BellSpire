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
        {state.inventory.map((item) => (
          <div className={`inventory-row rarity-${(item.rarity ?? "unrated").toLowerCase()}`} key={item.id}>
            <div>
              <p>{item.name}</p>
              <small>
                {item.rarity ?? "Unrated"} {item.kind} / {item.sourceStatus}
              </small>
            </div>
            <span>x{item.quantity}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
