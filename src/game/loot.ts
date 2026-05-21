import { addFeed, createId } from "./state";
import { describeLootPolicy, resolveCryptletFirstClearLoot, resolvePendingRoll } from "./lootEngine";
import type { GameState, InventoryItem, LootRollChoice } from "./types";

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

  if (state.pendingLootRoll) {
    return addFeed(
      state,
      "loot",
      `Loot roll pending: ${state.pendingLootRoll.itemName}`,
      formatPendingRoll(state),
      "Need / Greed / Pass"
    );
  }

  if (state.flags.cryptletCacheOpened) {
    return addFeed(state, "warning", "Loot roll missing", "The cache has already opened. No extra item can be created without a pending source-governed roll.", "No ghost loot");
  }

  const resolved = resolveCryptletFirstClearLoot(state);
  let next = addInventoryItems(state, resolved.autoRewards);
  const pending = resolved.pendingRolls[0];

  next = {
    ...next,
    flags: {
      ...next.flags,
      cryptletCacheOpened: true
    },
    reputation: {
      ...next.reputation,
      "Bellspire Concord": (next.reputation["Bellspire Concord"] ?? 0) + 25,
      Roadwardens: (next.reputation.Roadwardens ?? 0) + 10
    },
    sourcePity: {
      ...next.sourcePity,
      "Pilgrimage of the First Bell": (next.sourcePity["Pilgrimage of the First Bell"] ?? 0) + 1
    },
    pendingLootRoll: pending
      ? {
          ...pending,
          id: createId("loot-roll")
        }
      : undefined,
    sessionRecap: {
      ...next.sessionRecap,
      loot: [
        ...next.sessionRecap.loot,
        ...resolved.autoRewards.map((item) => `${item.name} x${item.quantity} - ${item.sourceStatus}`)
      ],
      reputation: [...next.sessionRecap.reputation, "Bellspire Concord +25", "Roadwardens +10"],
      sourcePity: [...next.sessionRecap.sourcePity, "Pilgrimage of the First Bell +1"],
      flags: next.sessionRecap.flags.includes("Cryptlet Cache Opened")
        ? next.sessionRecap.flags
        : [...next.sessionRecap.flags, "Cryptlet Cache Opened"]
    }
  };

  const body = [
    "Source: Pilgrimage of the First Bell.",
    describeLootPolicy(),
    ...resolved.explanations,
    ...resolved.blocked.map((line) => `Blocked: ${line}`),
    resolved.autoRewards.length
      ? `Auto rewards: ${resolved.autoRewards.map((item) => `${item.name} x${item.quantity}`).join(", ")}.`
      : "Auto rewards: none.",
    pending
      ? `Roll now: ${pending.itemName} (${pending.rarity}, ${pending.binding}). Type \`need\`, \`greed\`, or \`pass\`.`
      : "No rollable item remained."
  ].join("\n");

  return addFeed(next, "loot", "Road-Seal Cache opened", body, "Classic-style source loot");
}

export function resolveCryptletLootRoll(state: GameState, choice: LootRollChoice): GameState {
  if (!state.pendingLootRoll) {
    return addFeed(state, "warning", "No active loot roll", "There is no Need/Greed/Pass roll waiting right now.", "Loot");
  }

  if (choice === "need" && !state.pendingLootRoll.canNeed) {
    return addFeed(state, "warning", "Need unavailable", "Your class cannot Need this item. Choose `greed` or `pass`.", "Loot rules");
  }

  const pending = state.pendingLootRoll;
  const resolution = resolvePendingRoll(state, choice);
  let next = resolution.grantedReward ? addInventoryItems(state, [resolution.grantedReward]) : state;
  const awardedLine = resolution.grantedReward
    ? `${resolution.grantedReward.name} x${resolution.grantedReward.quantity} - ${resolution.grantedReward.sourceStatus}`
    : `${pending.itemName} was not awarded to ${state.character.name}.`;

  next = {
    ...next,
    pendingLootRoll: undefined,
    flags: {
      ...next.flags,
      cryptletComplete: true,
      wardenDefeated: true
    },
    dungeon: next.dungeon
      ? {
          ...next.dungeon,
          completed: true
        }
      : undefined,
    sessionRecap: {
      ...next.sessionRecap,
      loot: [...next.sessionRecap.loot, awardedLine],
      lootRolls: [...next.sessionRecap.lootRolls, ...resolution.lines],
      flags: next.sessionRecap.flags.includes("Cryptlet Complete")
        ? next.sessionRecap.flags
        : [...next.sessionRecap.flags, "Cryptlet Complete"]
    }
  };

  return addFeed(
    next,
    "loot",
    `Loot roll resolved: ${pending.itemName}`,
    [
      ...resolution.lines,
      `Source: ${pending.sourceName}.`,
      `Status: ${pending.sourceNote}`,
      "The AI Director may describe this moment, but the loot engine granted the item."
    ].join("\n"),
    "Need / Greed / Pass"
  );
}

function formatPendingRoll(state: GameState) {
  const pending = state.pendingLootRoll;
  if (!pending) {
    return "No pending loot roll.";
  }

  return [
    `${pending.itemName} x${pending.quantity}`,
    `${pending.rarity} / ${pending.binding}`,
    `Source: ${pending.sourceName}`,
    pending.reason,
    "Type `need`, `greed`, or `pass`."
  ].join("\n");
}
