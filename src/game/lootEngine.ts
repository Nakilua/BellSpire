import bindingRules from "../data/bindingRules.json";
import items from "../data/items.json";
import lootSources from "../data/lootSources.json";
import lootTables from "../data/lootTables.json";
import rarityConfig from "../data/rarityConfig.json";
import type { GameState, InventoryItem, LootRollChoice, LootRollParticipant, PendingLootRoll } from "./types";

type ItemRecord = (typeof items)[number];
type LootTable = (typeof lootTables)[number];
type LootSource = (typeof lootSources)[number];
type LootTableEntry = LootTable["entries"][number];

export interface LootEngineResult {
  autoRewards: InventoryItem[];
  pendingRolls: Omit<PendingLootRoll, "id">[];
  blocked: string[];
  explanations: string[];
}

export interface LootRollResolution {
  grantedReward?: InventoryItem;
  winnerName?: string;
  lines: string[];
}

const cryptletFirstClearTables = [
  "cryptlet-road-seal-cache-first-clear",
  "cryptlet-broken-bell-niche-bonus",
  "cryptlet-bellgrave-warden-first-clear"
];

export function resolveCryptletFirstClearLoot(state: GameState): LootEngineResult {
  const result: LootEngineResult = {
    autoRewards: [],
    pendingRolls: [],
    blocked: [],
    explanations: []
  };

  for (const tableId of cryptletFirstClearTables) {
    const table = requireTable(tableId);
    const source = requireSource(table.sourceId);
    ensurePlayable(table, source);

    for (const entry of table.entries) {
      if (!isEntryAvailable(state, entry)) {
        result.blocked.push(`${entry.id}: condition not met (${entryConditionFlag(entry) ?? entry.entryType}).`);
        continue;
      }

      if (!entry.itemId) {
        result.explanations.push(`${entry.id}: state-only reward; no item row created.`);
        continue;
      }

      const item = requireItem(entry.itemId);
      const inventoryItem = toInventoryItem(item, entry.quantity);
      const note = `${source.name}: ${entry.sourceNote}`;

      if (entry.distribution === "roll" && isAtOrAboveThreshold(inventoryItem.rarity, table.threshold)) {
        result.pendingRolls.push(buildRollPrompt(state, table, source, entry, inventoryItem));
        result.explanations.push(`${note} Roll required because ${inventoryItem.rarity} meets ${table.threshold} threshold.`);
      } else {
        result.autoRewards.push(inventoryItem);
        result.explanations.push(`${note} Auto-awarded by ${table.lootMode}.`);
      }
    }
  }

  return result;
}

export function resolvePendingRoll(state: GameState, choice: LootRollChoice): LootRollResolution {
  const pending = state.pendingLootRoll;
  if (!pending) {
    return {
      lines: ["No active loot roll is waiting."]
    };
  }

  const item = requireItem(pending.itemId);
  const playerRoll = choice === "pass" ? 0 : choice === "need" ? 87 : 61;
  const player: LootRollParticipant = {
    name: state.character.name,
    role: state.character.className,
    choice,
    roll: playerRoll,
    reason: choice === "need" ? "Eligible Bulwark upgrade." : choice === "greed" ? "Useful source-governed reward." : "Passed."
  };
  const participants = [player, ...pending.participants];
  const winner = chooseWinner(participants);
  const lines = [
    `${state.character.name} chose ${choice.toUpperCase()} on ${pending.itemName}.`,
    ...participants.map((participant) =>
      `${participant.name}: ${participant.choice.toUpperCase()}${participant.choice === "pass" ? "" : ` ${participant.roll}`} - ${participant.reason}`
    )
  ];

  if (!winner) {
    return {
      lines: [...lines, "Everyone passed. No item was awarded."]
    };
  }

  const grantedReward = winner.name === state.character.name ? toInventoryItem(item, pending.quantity) : undefined;
  return {
    grantedReward,
    winnerName: winner.name,
    lines: [...lines, `${winner.name} wins ${pending.itemName}.`]
  };
}

export function describeLootPolicy() {
  return "Loot mode: Group Loot. Threshold: Uncommon. Need beats Greed; Greed beats Pass. No personal loot.";
}

export function toInventoryItem(item: ItemRecord, quantity: number): InventoryItem {
  return {
    id: item.id,
    name: item.name,
    kind: item.kind,
    quantity,
    slot: item.slot,
    armorType: "armorType" in item ? item.armorType : undefined,
    binding: "binding" in item ? item.binding : undefined,
    itemLevel: "itemLevel" in item ? item.itemLevel : undefined,
    rarity: item.rarity,
    classTags: item.classTags,
    sourceType: item.sourceType,
    sourceId: item.sourceId,
    zoneId: item.zoneId,
    dungeonId: item.dungeonId,
    source: item.source,
    sourceStatus: item.sourceStatus,
    description: item.description
  };
}

function buildRollPrompt(
  state: GameState,
  table: LootTable,
  source: LootSource,
  entry: LootTableEntry,
  item: InventoryItem
): Omit<PendingLootRoll, "id"> {
  const canNeed = canCharacterNeed(state, item);
  return {
    itemId: item.id,
    itemName: item.name,
    quantity: item.quantity,
    rarity: item.rarity ?? "Common",
    binding: item.binding ?? "Tradable",
    sourceId: source.id,
    sourceName: source.name,
    tableId: table.id,
    threshold: table.threshold,
    canNeed,
    reason: canNeed ? "Bulwark can use this tank reward." : "Your class cannot Need this reward.",
    sourceNote: entry.sourceNote,
    participants: buildNpcRolls()
  };
}

function buildNpcRolls(): LootRollParticipant[] {
  return [
    {
      name: "Pilgrim Renn",
      role: "Road guide",
      choice: "pass",
      roll: 0,
      reason: "Not a Bulwark shield user."
    },
    {
      name: "Edrin Bellhand",
      role: "Healer",
      choice: "pass",
      roll: 0,
      reason: "Calls it a tank piece."
    },
    {
      name: "Tallowwick",
      role: "Object duty",
      choice: "pass",
      roll: 0,
      reason: "Says the shield has your name written in road dust."
    }
  ];
}

function chooseWinner(participants: LootRollParticipant[]) {
  const priority: Record<LootRollChoice, number> = {
    need: 3,
    greed: 2,
    pass: 1
  };
  const eligible = participants.filter((participant) => participant.choice !== "pass");
  if (!eligible.length) {
    return undefined;
  }
  return eligible
    .slice()
    .sort((left, right) => priority[right.choice] - priority[left.choice] || right.roll - left.roll || left.name.localeCompare(right.name))[0];
}

function isEntryAvailable(state: GameState, entry: LootTableEntry) {
  if (entry.entryType === "no-drop") {
    return false;
  }
  const conditionFlag = entryConditionFlag(entry);
  if (!conditionFlag) {
    return true;
  }
  return Boolean(state.flags[conditionFlag]);
}

function entryConditionFlag(entry: LootTableEntry) {
  return "conditionFlag" in entry ? entry.conditionFlag : undefined;
}

function canCharacterNeed(state: GameState, item: InventoryItem) {
  const tags = item.classTags ?? [];
  return tags.includes("All") || tags.includes(state.character.className) || tags.includes("Tank");
}

function isAtOrAboveThreshold(rarity: string | undefined, threshold: string) {
  return rarityRank(rarity) >= rarityRank(threshold);
}

function rarityRank(rarity: string | undefined) {
  return rarityConfig.find((entry) => entry.rarity.toLowerCase() === String(rarity).toLowerCase())?.rank ?? 0;
}

function requireTable(tableId: string) {
  const table = lootTables.find((entry) => entry.id === tableId);
  if (!table) {
    throw new Error(`Unknown loot table: ${tableId}`);
  }
  return table;
}

function requireSource(sourceId: string) {
  const source = lootSources.find((entry) => entry.id === sourceId);
  if (!source) {
    throw new Error(`Unknown loot source: ${sourceId}`);
  }
  return source;
}

function requireItem(itemId: string) {
  const item = items.find((entry) => entry.id === itemId);
  if (!item) {
    throw new Error(`Unknown loot item: ${itemId}`);
  }
  return item;
}

function ensurePlayable(table: LootTable, source: LootSource) {
  if (table.playableStatus !== "playable" || source.playableStatus !== "playable") {
    throw new Error(`Preview loot source cannot resolve in First Road: ${table.id}`);
  }
  if (!bindingRules.length) {
    throw new Error("Binding rules are missing.");
  }
}
