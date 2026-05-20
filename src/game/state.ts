import channels from "../data/channels.json";
import groupListings from "../data/groupListings.json";
import guildContracts from "../data/guildContracts.json";
import socialContacts from "../data/socialContacts.json";
import worldFlags from "../data/worldFlags.json";
import type { CharacterCreationInput, FeedEntry, FeedType, GameState, SocialState } from "./types";

export const STORAGE_KEY = "bellspire.save.v1";

let idCounter = 0;

export function createId(prefix = "entry") {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export function createFeedEntry(type: FeedType, title: string, body: string, meta?: string): FeedEntry {
  return {
    id: createId(type),
    type,
    title,
    body,
    meta
  };
}

export function addFeed(state: GameState, type: FeedType, title: string, body: string, meta?: string): GameState {
  return {
    ...state,
    feed: [...state.feed, createFeedEntry(type, title, body, meta)].slice(-80)
  };
}

const defaultCharacter: CharacterCreationInput = {
  name: "Naki",
  origin: "Saint Veyra Ward",
  vow: "Hold the Line"
};

function createInitialSocialState(characterName = defaultCharacter.name): SocialState {
  return {
    contacts: socialContacts as unknown as SocialState["contacts"],
    guildContracts: guildContracts as unknown as SocialState["guildContracts"],
    groupListings: (groupListings as unknown as SocialState["groupListings"]).map((listing) => ({
      ...listing,
      members: listing.members.map((member) => (member.toLowerCase().includes("naki / bulwark") ? `${characterName} / Bulwark` : member))
    })),
    socialReputation: {
      "Party Reliability": 0,
      "Guild Credit": 0,
      "Road Courtesy": 0
    },
    recentParty: ["Pilgrim Renn"],
    director: {
      mode: "local-sim",
      qualityMode: "auto",
      liveModel: "gpt-5.4-mini",
      cinematicModel: "gpt-5.4",
      lastProvider: "local",
      lastCostUsd: 0,
      estimatedSpendUsd: 0,
      monthlyBudgetUsd: 10,
      warnAtUsd: 7,
      strongWarnAtUsd: 9,
      stopAtUsd: 9.5,
      budgetStatus: "safe",
      liveTurnCount: 0,
      cinematicTurnCount: 0,
      localTurnCount: 0,
      storyPressure: 0,
      memories: []
    }
  };
}

export function createInitialState(characterInput?: CharacterCreationInput): GameState {
  const flags = Object.fromEntries(worldFlags.map((flag) => [flag.id, flag.value]));
  const firstChannel = channels[0];
  const character = characterInput ?? defaultCharacter;
  const name = character.name.trim() || defaultCharacter.name;

  return {
    saveVersion: 1,
    profileCreated: Boolean(characterInput),
    activeChannelId: firstChannel.id,
    locationPoiId: "saint-veyra-capital",
    character: {
      name,
      className: "Bulwark",
      origin: character.origin,
      vow: character.vow,
      level: 5,
      hp: 80,
      maxHp: 80,
      oath: 10,
      lane: "Frontline",
      guardStance: false
    },
    inventory: [
      {
        id: "road-iron-rations",
        name: "Road-Iron Rations",
        kind: "Supply",
        quantity: 2,
        slot: "Consumable",
        rarity: "Common",
        classTags: ["All"],
        sourceType: "Starter Kit",
        sourceId: "saint-veyra-starter-kit",
        zoneId: "saint-veyra",
        dungeonId: "",
        source: "Saint Veyra starter kit",
        sourceStatus: "Prototype reward",
        description: "A practical starter supply for the first road."
      }
    ],
    equipment: {
      mainHand: "Training blade",
      offHand: "Roadwarden practice shield"
    },
    quests: {
      "trial-under-little-dawn": {
        status: "inactive",
        stepIndex: 0
      }
    },
    reputation: {
      "Bellspire Concord": 0,
      Roadwardens: 0
    },
    sourcePity: {
      "Pilgrimage of the First Bell": 0
    },
    flags,
    feed: [
      createFeedEntry(
        "system",
        "Bellspire session opened",
        "Saint Veyra waits under stained glass. The first playable road leads to Hearthmere Fields and the Road Shrine of Little Dawn.",
        "#saint-veyra-capital"
      )
    ],
    social: createInitialSocialState(name),
    livingWorld: {
      tick: 0,
      ambientCursor: {}
    },
    narrative: {
      arcId: "pilgrimage-first-bell",
      stageId: "first-road-summons",
      tension: 0,
      sceneCount: 0,
      seenBeatIds: [],
      vignetteCursor: {},
      lastTrigger: undefined,
      lastBeatId: undefined,
      lastVignetteId: undefined
    },
    sessionRecap: {
      visited: ["Saint Veyra Capital"],
      quests: [],
      narrative: [],
      loot: [],
      wipes: [],
      reputation: [],
      sourcePity: [],
      flags: [],
      npcReactions: [],
      social: []
    }
  };
}

export function reviveForRetry(state: GameState): GameState {
  return {
    ...state,
    character: {
      ...state.character,
      hp: state.character.maxHp,
      oath: Math.max(10, state.character.oath),
      guardStance: false,
      condition: undefined,
      lane: "Frontline"
    }
  };
}

export function sanitizeImportedState(value: unknown): GameState | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const maybe = value as Partial<GameState>;
  if (maybe.saveVersion !== 1 || !maybe.character || !Array.isArray(maybe.feed)) {
    return null;
  }

  const base = createInitialState();

  return {
    ...base,
    ...maybe,
    saveVersion: 1,
    profileCreated: typeof maybe.profileCreated === "boolean" ? maybe.profileCreated : true,
    character: {
      ...base.character,
      ...maybe.character
    },
    social: {
      ...base.social,
      ...maybe.social,
      contacts: maybe.social?.contacts ?? base.social.contacts,
      guildContracts: maybe.social?.guildContracts ?? base.social.guildContracts,
      groupListings: maybe.social?.groupListings ?? base.social.groupListings,
      socialReputation: {
        ...base.social.socialReputation,
        ...maybe.social?.socialReputation
      },
      recentParty: maybe.social?.recentParty ?? base.social.recentParty,
      director: {
        ...base.social.director,
        ...maybe.social?.director,
        memories: maybe.social?.director?.memories ?? base.social.director.memories
      }
    },
    livingWorld: {
      ...base.livingWorld,
      ...maybe.livingWorld,
      ambientCursor: maybe.livingWorld?.ambientCursor ?? base.livingWorld.ambientCursor
    },
    narrative: {
      ...base.narrative,
      ...maybe.narrative,
      seenBeatIds: maybe.narrative?.seenBeatIds ?? base.narrative.seenBeatIds,
      vignetteCursor: maybe.narrative?.vignetteCursor ?? base.narrative.vignetteCursor
    },
    sessionRecap: {
      ...base.sessionRecap,
      ...maybe.sessionRecap,
      narrative: maybe.sessionRecap?.narrative ?? base.sessionRecap.narrative,
      social: maybe.sessionRecap?.social ?? base.sessionRecap.social
    }
  } as GameState;
}
