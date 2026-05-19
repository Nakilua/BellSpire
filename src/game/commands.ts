import channels from "../data/channels.json";
import dungeons from "../data/dungeons.json";
import npcs from "../data/npcs.json";
import pois from "../data/pois.json";
import quests from "../data/quests.json";
import zones from "../data/zones.json";
import { performCombatAction, startEncounter } from "./combat";
import { postWorldChat, pulseLivingWorld, showNearbyWorld } from "./livingWorld";
import { grantCryptletRewards } from "./loot";
import { addFeed } from "./state";
import { getActiveDungeon, getBulwarkAbilities, getCurrentPoi, getCurrentRoom, getCurrentZone, getQuestDefinition } from "./selectors";
import { handleSocialCommand } from "./social";
import type { GameState } from "./types";

export function runCommand(state: GameState, rawCommand: string): GameState {
  const raw = rawCommand.trim();
  if (!raw) {
    return state;
  }

  const socialCommand = handleSocialCommand(state, raw);
  if (socialCommand) {
    return socialCommand;
  }

  let next = addFeed(state, "command", `> ${raw}`, "Command received.", state.activeChannelId);
  const command = raw.toLowerCase();

  if (command.startsWith("channel ")) {
    return switchChannel(next, raw.slice("channel ".length).trim());
  }

  if (command === "look") {
    return look(next);
  }

  if (command === "map") {
    return showMap(next);
  }

  if (command === "listen" || command === "wait") {
    return pulseLivingWorld(next, "listen");
  }

  if (command === "who" || command === "nearby") {
    return showNearbyWorld(next);
  }

  if (command.startsWith("global ")) {
    return postWorldChat(next, "global-chat", raw.replace(/^global\s*/i, ""));
  }

  if (command.startsWith("zone ")) {
    return postWorldChat(next, "zone-chat", raw.replace(/^zone\s*/i, ""));
  }

  if (command.startsWith("travel ")) {
    return travel(next, raw.slice("travel ".length));
  }

  if (command.startsWith("talk")) {
    return talk(next, raw.replace(/^talk\s*/i, ""));
  }

  if (command === "accept quest") {
    return acceptQuest(next);
  }

  if (command === "inventory") {
    return showInventory(next);
  }

  if (command === "abilities") {
    return showAbilities(next);
  }

  if (command.startsWith("guard")) {
    return performCombatAction(next, "guard");
  }

  if (command.startsWith("shield oath")) {
    return performCombatAction(next, "shield-oath", raw.replace(/^shield oath\s*/i, ""));
  }

  if (command.startsWith("attack")) {
    return performCombatAction(next, "attack", raw.replace(/^attack\s*/i, ""));
  }

  if (command.startsWith("move")) {
    return performCombatAction(next, "move", raw.replace(/^move\s*/i, ""));
  }

  if (command.startsWith("use")) {
    return performCombatAction(next, "use-object", raw.replace(/^use\s*/i, ""));
  }

  if (command.startsWith("inspect")) {
    return inspect(next, raw.replace(/^inspect\s*/i, ""));
  }

  if (command.startsWith("gather")) {
    return gather(next, raw.replace(/^gather\s*/i, ""));
  }

  if (command === "enter dungeon") {
    return enterDungeon(next);
  }

  if (command === "continue" || command === "continue deeper") {
    return continueDungeon(next);
  }

  if (command === "retry encounter") {
    return retryEncounter(next);
  }

  if (command === "loot") {
    return loot(next);
  }

  if (command === "recap") {
    return recap(next);
  }

  if (command.startsWith("rest")) {
    return rest(next);
  }

  if (state.activeChannelId === "global-chat") {
    return postWorldChat(next, "global-chat", raw);
  }

  if (state.activeChannelId === "zone-chat") {
    return postWorldChat(next, "zone-chat", raw);
  }

  if (state.activeChannelId === "guild-recruitment") {
    return pulseLivingWorld(addFeed(next, "social", `${state.character.name} in #guild-recruitment`, raw, "local recruitment reply"), "social");
  }

  return addFeed(
    next,
    "warning",
    "Command not recognized",
    "Try `look`, `map`, `travel Hearthmere Fields`, `talk Shrinekeeper Olla`, `accept quest`, `enter dungeon`, `lfg`, `party hello`, `director what does the party notice?`, `guild contracts`, `invite Renn`, `shield oath`, `guard frontline`, `loot`, or use the action buttons.",
    "MVP parser"
  );
}

function switchChannel(state: GameState, channelText: string): GameState {
  const normalized = channelText.replace("#", "").toLowerCase();
  const channel = channels.find((entry) => entry.id === normalized || entry.label.toLowerCase().includes(normalized));
  if (!channel) {
    return addFeed(state, "warning", "Unknown channel", "That channel is not on the MVP rail yet.", "Channel rail");
  }

  let next: GameState = {
    ...state,
    activeChannelId: channel.id
  };

  if ("poiId" in channel && channel.poiId) {
    next = moveToPoi(next, channel.poiId);
  }

  return pulseLivingWorld(addFeed(next, "scene", channel.label, channel.description, "Channel selected"), "channel");
}

function look(state: GameState): GameState {
  if (state.encounter) {
    return addFeed(
      state,
      "combat",
      state.encounter.name,
      [
        `Round ${state.encounter.round}`,
        `Intent: ${state.encounter.currentIntentName} - ${state.encounter.currentTelegraph}`,
        `Enemies: ${state.encounter.enemies.map((enemy) => `${enemy.name} ${enemy.hp}/${enemy.maxHp}`).join(", ")}`,
        `Naki: ${state.character.hp}/${state.character.maxHp} HP, ${state.character.oath} Oath, ${state.character.lane}${state.character.guardStance ? ", Guard Stance" : ""}`
      ].join("\n"),
      "Encounter bubble"
    );
  }

  const room = getCurrentRoom(state);
  if (room) {
    return addFeed(state, "scene", room.name, `${room.scene}\nLesson: ${room.lesson}`, room.type);
  }

  const poi = getCurrentPoi(state);
  return addFeed(state, "scene", poi.name, `${poi.scene}\nAvailable exits: ${poi.exits.join(", ")}`, poi.type);
}

function showMap(state: GameState): GameState {
  const dungeon = getActiveDungeon(state);
  if (dungeon && state.dungeon) {
    const route = dungeon.rooms
      .map((room, index) => `${index === state.dungeon?.roomIndex ? ">" : "-"} ${room.name}`)
      .join("\n");
    return addFeed(state, "scene", "Dungeon map", route, dungeon.name);
  }

  const zone = getCurrentZone(state);
  const nodes = pois
    .filter((poi) => poi.zoneId === zone.id)
    .map((poi) => `${poi.id === state.locationPoiId ? ">" : "-"} ${poi.name}`)
    .join("\n");
  const locked = zones.filter((entry) => entry.locked).map((entry) => `Locked preview: ${entry.name} (${entry.levelRange})`).join("\n");
  return addFeed(state, "scene", `${zone.name} map`, `${nodes}\n\n${locked}`, zone.levelRange);
}

function travel(state: GameState, targetText: string): GameState {
  if (state.dungeon) {
    return addFeed(state, "warning", "Travel blocked", "You are inside the Cryptlet. Use `continue`, `look`, or finish the dungeon route.", "Dungeon");
  }

  const target = findPoiByAlias(targetText);
  if (!target) {
    return addFeed(state, "warning", "Unknown destination", "Named nodes only, sweet boy. Try `Hearthmere Fields` or `Road Shrine of Little Dawn`.", "Map rules");
  }

  const current = getCurrentPoi(state);
  if (!current.exits.includes(target.id)) {
    return addFeed(state, "warning", "Road not open from here", `${target.name} is not connected to your current node.`, current.name);
  }

  return moveToPoi(state, target.id);
}

function moveToPoi(state: GameState, poiId: string): GameState {
  const poi = pois.find((entry) => entry.id === poiId);
  if (!poi) {
    return state;
  }
  const zone = zones.find((entry) => entry.id === poi.zoneId);
  const channelId = zone?.channelId ?? state.activeChannelId;
  const visited = state.sessionRecap.visited.includes(poi.name) ? state.sessionRecap.visited : [...state.sessionRecap.visited, poi.name];

  return pulseLivingWorld(addFeed(
    {
      ...state,
      activeChannelId: channelId,
      locationPoiId: poi.id,
      sessionRecap: {
        ...state.sessionRecap,
        visited
      }
    },
    "scene",
    poi.name,
    poi.scene,
    zone?.name
  ), "travel");
}

function findPoiByAlias(targetText: string) {
  const normalized = targetText.toLowerCase();
  return pois.find((poi) => {
    const name = poi.name.toLowerCase();
    return name.includes(normalized) || normalized.includes(name) || normalized.includes(poi.id.split("-").join(" "));
  });
}

function talk(state: GameState, targetText: string): GameState {
  const poi = getCurrentPoi(state);
  const possible = npcs.filter((npc) => poi.npcIds.includes(npc.id));
  const normalized = targetText.toLowerCase();
  const npc = possible.find((entry) => entry.name.toLowerCase().includes(normalized)) ?? possible[0];

  if (!npc) {
    return addFeed(state, "warning", "No one to talk to", "No available NPC is standing here in the MVP slice.", poi.name);
  }

  let next = addFeed(state, "dialogue", npc.name, npc.dialogue, npc.role);
  next = {
    ...next,
    sessionRecap: {
      ...next.sessionRecap,
      npcReactions: next.sessionRecap.npcReactions.includes(npc.reaction)
        ? next.sessionRecap.npcReactions
        : [...next.sessionRecap.npcReactions, npc.reaction]
    }
  };

  if (npc.id === "shrinekeeper-olla") {
    next = {
      ...next,
      flags: {
        ...next.flags,
        ollaPermission: true
      },
      quests: {
        ...next.quests,
        "trial-under-little-dawn": {
          status: "active",
          stepIndex: Math.max(next.quests["trial-under-little-dawn"]?.stepIndex ?? 0, 0)
        }
      },
      sessionRecap: {
        ...next.sessionRecap,
        quests: next.sessionRecap.quests.includes("Trial Under Little Dawn started")
          ? next.sessionRecap.quests
          : [...next.sessionRecap.quests, "Trial Under Little Dawn started"],
        flags: next.sessionRecap.flags.includes("Olla's Permission")
          ? next.sessionRecap.flags
          : [...next.sessionRecap.flags, "Olla's Permission"]
      }
    };
    next = addFeed(next, "system", "Quest available", "Trial Under Little Dawn is ready. Use `accept quest` or press the action button.", "Shrinekeeper Olla");
  }

  return pulseLivingWorld(next, "talk");
}

function acceptQuest(state: GameState): GameState {
  if (state.locationPoiId !== "road-shrine-little-dawn" || !state.flags.ollaPermission) {
    return addFeed(state, "warning", "Quest not ready", "Talk to Shrinekeeper Olla at the Road Shrine first.", "Trial Under Little Dawn");
  }

  const quest = getQuestDefinition("trial-under-little-dawn")!;
  return addFeed(
    {
      ...state,
      quests: {
        ...state.quests,
        [quest.id]: {
          status: "active",
          stepIndex: 1
        }
      },
      sessionRecap: {
        ...state.sessionRecap,
        quests: state.sessionRecap.quests.includes(`${quest.name} accepted`)
          ? state.sessionRecap.quests
          : [...state.sessionRecap.quests, `${quest.name} accepted`]
      }
    },
    "system",
    `Quest accepted: ${quest.name}`,
    quest.steps[1],
    quest.source
  );
}

function enterDungeon(state: GameState): GameState {
  if (state.locationPoiId !== "road-shrine-little-dawn") {
    return addFeed(state, "warning", "No dungeon entrance here", "The Cryptlet entrance is beneath the Road Shrine of Little Dawn.", "Dungeon");
  }

  if (!state.flags.ollaPermission) {
    return addFeed(state, "warning", "The bell stays sealed", "Shrinekeeper Olla has not given permission yet. Go talk to her first, baka.", "Little Dawn Crypt Bell");
  }

  const dungeon = dungeons[0];
  return pulseLivingWorld(addFeed(
    {
      ...state,
      activeChannelId: "combat-log",
      locationPoiId: "pilgrim-trial-cryptlet",
      dungeon: {
        dungeonId: dungeon.id,
        roomIndex: 0,
        mode: "Training",
        clearedEncounterIds: [],
        completed: false
      },
      quests: {
        ...state.quests,
        "trial-under-little-dawn": {
          status: "active",
          stepIndex: 2
        }
      },
      flags: {
        ...state.flags,
        roadTrialOathRead: true
      },
      sessionRecap: {
        ...state.sessionRecap,
        visited: state.sessionRecap.visited.includes(dungeon.name) ? state.sessionRecap.visited : [...state.sessionRecap.visited, dungeon.name],
        flags: state.sessionRecap.flags.includes("Road Trial Oath Read")
          ? state.sessionRecap.flags
          : [...state.sessionRecap.flags, "Road Trial Oath Read"]
      }
    },
    "scene",
    "Pilgrim Trial Cryptlet",
    "The inward bell opens the roadstone door. Room 1: Shrine Descent. The Road Trial Oath is read and logged.",
    "Training mode"
  ), "dungeon");
}

function continueDungeon(state: GameState): GameState {
  if (!state.dungeon) {
    return addFeed(state, "warning", "No active dungeon", "There is no dungeon route active right now.", "Dungeon");
  }

  if (state.encounter) {
    return addFeed(state, "warning", "Encounter active", "Finish the current encounter before moving deeper.", state.encounter.name);
  }

  const dungeon = getActiveDungeon(state);
  const room = getCurrentRoom(state);
  if (!dungeon || !room) {
    return state;
  }

  if (room.encounterId && !state.dungeon.clearedEncounterIds.includes(room.encounterId)) {
    return startEncounter(state, room.encounterId);
  }

  if (state.dungeon.roomIndex >= dungeon.rooms.length - 1) {
    return addFeed(state, "system", "Road-Seal Exit", "Use `loot` to claim the source-driven reward cache.", "Dungeon complete");
  }

  const nextRoomIndex = state.dungeon.roomIndex + 1;
  const nextRoom = dungeon.rooms[nextRoomIndex];
  let next: GameState = {
    ...state,
    dungeon: {
      ...state.dungeon,
      roomIndex: nextRoomIndex
    }
  };

  if (nextRoom.id === "broken-bell-niche") {
    next = {
      ...next,
      quests: {
        ...next.quests,
        "trial-under-little-dawn": {
          status: "active",
          stepIndex: Math.max(next.quests["trial-under-little-dawn"]?.stepIndex ?? 0, 3)
        }
      }
    };
  }

  if (nextRoom.id === "pilgrim-bone-walk") {
    next = {
      ...next,
      quests: {
        ...next.quests,
        "trial-under-little-dawn": {
          status: "active",
          stepIndex: Math.max(next.quests["trial-under-little-dawn"]?.stepIndex ?? 0, 4)
        }
      }
    };
  }

  if (nextRoom.id === "warden-chamber") {
    next = {
      ...next,
      quests: {
        ...next.quests,
        "trial-under-little-dawn": {
          status: "active",
          stepIndex: Math.max(next.quests["trial-under-little-dawn"]?.stepIndex ?? 0, 5)
        }
      }
    };
  }

  next = addFeed(next, "scene", nextRoom.name, `${nextRoom.scene}\nLesson: ${nextRoom.lesson}`, nextRoom.type);

  if (nextRoom.encounterId) {
    return startEncounter(next, nextRoom.encounterId);
  }

  return pulseLivingWorld(next, "dungeon");
}

function retryEncounter(state: GameState): GameState {
  const room = getCurrentRoom(state);
  if (!room?.encounterId) {
    return addFeed(state, "warning", "No encounter to retry", "This room is not currently holding an encounter.", "Dungeon");
  }
  return startEncounter(state, room.encounterId);
}

function inspect(state: GameState, targetText: string): GameState {
  const room = getCurrentRoom(state);
  const target = targetText.toLowerCase();

  if (state.encounter && target.includes("road-seal")) {
    return performCombatAction(state, "use-object", targetText);
  }

  if (room?.id === "hall-threaded-names" && target.includes("thread")) {
    const count = Number(state.flags.threadedNameTagsRead ?? 0) + 1;
    return addFeed(
      {
        ...state,
        flags: {
          ...state.flags,
          threadedNameTagsRead: count
        }
      },
      "scene",
      "Threaded Name Tag",
      `"Merren, who carried bread past the third bell." Thread tags read: ${count}.`,
      "Hidden memory"
    );
  }

  if (room?.id === "broken-bell-niche" && (target.includes("wax") || target.includes("bell"))) {
    return addFeed(
      {
        ...state,
        flags: {
          ...state.flags,
          brokenBellStabilized: true
        },
        quests: {
          ...state.quests,
          "trial-under-little-dawn": {
            status: "active",
            stepIndex: Math.max(state.quests["trial-under-little-dawn"]?.stepIndex ?? 0, 4)
          }
        },
        sessionRecap: {
          ...state.sessionRecap,
          flags: state.sessionRecap.flags.includes("Broken Bell Stabilized")
            ? state.sessionRecap.flags
            : [...state.sessionRecap.flags, "Broken Bell Stabilized"]
        }
      },
      "system",
      "Broken Bell Niche stabilized",
      "The wax channel catches. Future bell casts in this room will hit softer, and the reward cache can include a Bell Sliver.",
      "Object interaction"
    );
  }

  if (!room && state.locationPoiId === "road-shrine-little-dawn") {
    return addFeed(state, "scene", "Little Dawn Crypt Bell", "The bell is palm-sized bronze. It does not ring outward. It rings into the stone.", "Dungeon entrance");
  }

  if (room?.object) {
    return addFeed(state, "scene", room.object, "You inspect it carefully. No new state change triggers from this object yet.", room.name);
  }

  return addFeed(state, "warning", "Nothing obvious", "That object is not interactable in the MVP slice.", "Inspect");
}

function gather(state: GameState, targetText: string): GameState {
  if (!state.dungeon) {
    return addFeed(state, "warning", "No gathering node", "The MVP gathering hooks live inside the Cryptlet rooms.", "Gather");
  }
  return addFeed(state, "system", "Gathering noted", `${targetText || "node"} logged for future profession support. No permanent item was created.`, "Prototype hook");
}

function loot(state: GameState): GameState {
  if (!state.dungeon) {
    return addFeed(state, "warning", "No loot source", "There is no active dungeon reward source here.", "Loot");
  }

  const room = getCurrentRoom(state);
  if (room?.id !== "road-seal-exit" && !state.flags.wardenDefeated) {
    return addFeed(state, "warning", "Reward not ready", "Defeat the Bellgrave Warden and reach the Road-Seal Exit first.", "Source-driven loot");
  }

  let next = grantCryptletRewards(state);
  next = {
    ...next,
    quests: {
      ...next.quests,
      "trial-under-little-dawn": {
        status: "complete",
        stepIndex: 6
      }
    },
    flags: {
      ...next.flags,
      wardenDefeated: true,
      cryptletComplete: true
    },
    sessionRecap: {
      ...next.sessionRecap,
      quests: next.sessionRecap.quests.includes("Trial Under Little Dawn complete")
        ? next.sessionRecap.quests
        : [...next.sessionRecap.quests, "Trial Under Little Dawn complete"]
    }
  };

  return pulseLivingWorld(next, "loot");
}

function showInventory(state: GameState): GameState {
  const body = state.inventory.map((item) => `${item.name} x${item.quantity} [${item.rarity ?? "Unrated"} ${item.kind}] - ${item.sourceStatus}`).join("\n");
  return addFeed(state, "system", "Inventory", body || "Inventory is empty.", "Source checked");
}

function showAbilities(state: GameState): GameState {
  const body = getBulwarkAbilities()
    .map((ability) => `${ability.name} (${ability.actionType}, ${ability.resource}) - ${ability.description}`)
    .join("\n");
  return addFeed(state, "system", "Bulwark abilities", body, "Shield Oath / Guard Stance");
}

function rest(state: GameState): GameState {
  const poi = getCurrentPoi(state);
  if (!poi.services.includes("field rest") && !poi.services.includes("rest shrine")) {
    return addFeed(state, "warning", "No safe rest here", "Find a road shrine or field rest point first.", "Rest");
  }

  return addFeed(
    {
      ...state,
      character: {
        ...state.character,
        hp: state.character.maxHp,
        oath: Math.max(state.character.oath, 10),
        condition: undefined
      }
    },
    "system",
    "Rest complete",
    "HP restored. Oath steadied. The road is still rude, but you are less crunchy.",
    poi.name
  );
}

function recap(state: GameState): GameState {
  const recapLines = [
    `Visited: ${state.sessionRecap.visited.join(" -> ") || "None"}`,
    `Quests: ${state.sessionRecap.quests.join("; ") || "None"}`,
    `Loot: ${state.sessionRecap.loot.join("; ") || "None"}`,
    `Wipes: ${state.sessionRecap.wipes.join("; ") || "None"}`,
    `Reputation: ${state.sessionRecap.reputation.join("; ") || "None"}`,
    `Source pity: ${state.sessionRecap.sourcePity.join("; ") || "None"}`,
    `Flags: ${state.sessionRecap.flags.join("; ") || "None"}`,
    `NPC reactions: ${state.sessionRecap.npcReactions.join("; ") || "None"}`,
    `Social: ${state.sessionRecap.social.join("; ") || "None"}`
  ];

  return addFeed(state, "recap", "Session recap", recapLines.join("\n"), "Exportable save state");
}
