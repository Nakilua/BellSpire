import lootRules from "../data/firstRoadLootRules.json";
import items from "../data/items.json";
import { addFeed } from "./state";
import type { GameState, InventoryItem } from "./types";

function toInventoryItem(itemId: string, quantity: number): InventoryItem {
  const item = items.find((entry) => entry.id === itemId);
  if (!item) {
    throw new Error(`Unknown loot item: ${itemId}`);
  }

  return {
    id: item.id,
    name: item.name,
    kind: item.kind,
    quantity,
    slot: item.slot,
    armorType: item.armorType,
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

function addInventoryItems(state: GameState, additions: InventoryItem[]): GameState {
  const nextInventory = [...state.inventory];

  for (const addition of additions) {
    const existing = nextInventory.find((item) => item.id === addition.id);
    if (existing) {
      existing.quantity += addition.quantity;
    } else {
      nextInventory.push({ ...addition });
    }
  }

  return {
    ...state,
    inventory: nextInventory
  };
}

export function grantCryptletRewards(state: GameState): GameState {
  if (state.flags.cryptletComplete) {
    return addFeed(state, "loot", "Reward already claimed", "The Road-Seal cache is empty. No double dipping, darling.", "Pilgrim Trial Cryptlet");
  }

  const rewards = [
    toInventoryItem("pilgrim-wax", 2),
    toInventoryItem("bone-fragment", 2),
    toInventoryItem("bell-sliver", state.flags.brokenBellStabilized ? 1 : 0),
    toInventoryItem("road-seal-buckler", 1)
  ].filter((item) => item.quantity > 0);

  let next = addInventoryItems(state, rewards);
  next = {
    ...next,
    reputation: {
      ...next.reputation,
      "Bellspire Concord": (next.reputation["Bellspire Concord"] ?? 0) + 25,
      Roadwardens: (next.reputation.Roadwardens ?? 0) + 10
    },
    sourcePity: {
      ...next.sourcePity,
      "Pilgrimage of the First Bell": (next.sourcePity["Pilgrimage of the First Bell"] ?? 0) + 1
    },
    flags: {
      ...next.flags,
      cryptletComplete: true
    },
    dungeon: next.dungeon
      ? {
          ...next.dungeon,
          completed: true
        }
      : undefined,
    sessionRecap: {
      ...next.sessionRecap,
      loot: [
        ...next.sessionRecap.loot,
        "Pilgrim Wax x2",
        "Bone Fragment x2",
        ...(state.flags.brokenBellStabilized ? ["Bell Sliver x1"] : []),
        "Road-Seal Buckler x1 - Staged source reward"
      ],
      reputation: [...next.sessionRecap.reputation, "Bellspire Concord +25", "Roadwardens +10"],
      sourcePity: [...next.sessionRecap.sourcePity, "Pilgrimage of the First Bell +1"],
      flags: [...next.sessionRecap.flags, "Cryptlet Complete"]
    }
  };

  return addFeed(
    next,
    "loot",
    "BOSS DEFEATED: The Bellgrave Warden",
    [
      "Source: Pilgrimage of the First Bell.",
      `Loot rules: ${(lootRules as { sourceName: string; ruleType: string; sourceStatus: string }[]).map((rule) => `${rule.sourceName} (${rule.ruleType}, ${rule.sourceStatus})`).join("; ")}.`,
      "Guaranteed: Pilgrim Wax x2, Bone Fragment x2, Bellspire Concord +25, Roadwardens +10.",
      state.flags.brokenBellStabilized ? "Object bonus: Bell Sliver x1 from the stabilized bell niche." : "Object bonus missed: stabilize the bell niche on a future run for a Bell Sliver chance.",
      "Gear: Road-Seal Buckler x1. Status: Staged source reward - final Master_Loot_DB item ID pending.",
      "Source Progress: Pilgrimage of the First Bell pity +1."
    ].join("\n"),
    "No ghost loot"
  );
}
