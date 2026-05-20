import abilities from "../data/abilities.json";
import channels from "../data/channels.json";
import dungeons from "../data/dungeons.json";
import pois from "../data/pois.json";
import quests from "../data/quests.json";
import zones from "../data/zones.json";
import type { ActionButton, GameState } from "./types";

export function getCurrentPoi(state: GameState) {
  return pois.find((poi) => poi.id === state.locationPoiId) ?? pois[0];
}

export function getCurrentZone(state: GameState) {
  const poi = getCurrentPoi(state);
  return zones.find((zone) => zone.id === poi.zoneId) ?? zones[0];
}

export function getCurrentChannel(state: GameState) {
  return channels.find((channel) => channel.id === state.activeChannelId) ?? channels[0];
}

export function getActiveDungeon(state: GameState) {
  if (!state.dungeon) {
    return undefined;
  }
  return dungeons.find((dungeon) => dungeon.id === state.dungeon?.dungeonId);
}

export function getCurrentRoom(state: GameState) {
  const dungeon = getActiveDungeon(state);
  if (!dungeon || !state.dungeon) {
    return undefined;
  }
  return dungeon.rooms[state.dungeon.roomIndex];
}

export function getQuestDefinition(id: string) {
  return quests.find((quest) => quest.id === id);
}

export function getBulwarkAbilities() {
  return abilities.filter((ability) => ability.className === "Bulwark");
}

export function getAvailableActions(state: GameState): ActionButton[] {
  if (state.encounter) {
    const firstEnemy = state.encounter.enemies.find((enemy) => enemy.hp > 0);
    const actions: ActionButton[] = [
      { label: "Shield Oath", command: `shield oath ${firstEnemy?.name ?? ""}`.trim(), tone: "primary" },
      { label: "Guard Frontline", command: "guard frontline" },
      { label: "Attack", command: `attack ${firstEnemy?.name ?? ""}`.trim() },
      { label: "Move Midline", command: "move midline", tone: "quiet" },
      { label: "Story", command: "story", tone: "quiet" }
    ];

    if (state.encounter.currentIntentId === "road-seal-pulse") {
      actions.unshift({ label: "Use Road-Seal Bell", command: "use road-seal bell", tone: "primary" });
    }

    return actions;
  }

  const room = getCurrentRoom(state);
  if (room && state.dungeon) {
    const actions: ActionButton[] = [
      { label: "Look", command: "look" },
      { label: "Map", command: "map", tone: "quiet" },
      { label: "DM Scene", command: "dm", tone: "quiet" },
      { label: "Recap", command: "recap", tone: "quiet" }
    ];

    if (room.object) {
      actions.push({ label: `Inspect ${room.object}`, command: `inspect ${room.object}` });
    }

    if (room.id === "road-seal-exit") {
      actions.unshift({ label: "Loot", command: "loot", tone: "primary" });
    } else {
      actions.unshift({ label: "Continue", command: "continue", tone: "primary" });
    }

    return actions;
  }

  switch (state.locationPoiId) {
    case "saint-veyra-capital":
      return [
        { label: "Travel Hearthmere", command: "travel Hearthmere Fields", tone: "primary" },
        { label: "Listen", command: "listen" },
        { label: "Story", command: "story" },
        { label: "Abilities", command: "abilities" },
        { label: "Inventory", command: "inventory", tone: "quiet" }
      ];
    case "hearthmere-crossing":
      return [
        { label: "Travel Road Shrine", command: "travel Road Shrine of Little Dawn", tone: "primary" },
        { label: "Talk Pilgrim Renn", command: "talk Pilgrim Renn" },
        { label: "Listen", command: "listen" },
        { label: "DM Scene", command: "dm", tone: "quiet" },
        { label: "Map", command: "map", tone: "quiet" }
      ];
    case "road-shrine-little-dawn":
      return [
        { label: "Talk Olla", command: "talk Shrinekeeper Olla", tone: "primary" },
        { label: "Accept Quest", command: "accept quest" },
        { label: "Enter Dungeon", command: "enter dungeon", tone: "primary" },
        { label: "Listen", command: "listen" },
        { label: "Story", command: "story", tone: "quiet" },
        { label: "Inspect Bell", command: "inspect crypt bell", tone: "quiet" }
      ];
    default:
      return [{ label: "Look", command: "look", tone: "primary" }];
  }
}
