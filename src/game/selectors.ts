import abilities from "../data/abilities.json";
import channels from "../data/channels.json";
import dungeons from "../data/dungeons.json";
import focusOptions from "../data/locationFocusOptions.json";
import pois from "../data/pois.json";
import quests from "../data/quests.json";
import zones from "../data/zones.json";
import type { ActionButton, GameState } from "./types";

interface FocusOptionDefinition {
  id: string;
  locationPoiId?: string;
  dungeonRoomId?: string;
  label: string;
  aliases: string[];
  suggestedCommands: string[];
}

const firstRoadFocusOptions = focusOptions as FocusOptionDefinition[];

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
  if (state.pendingLootRoll) {
    return [
      ...(state.pendingLootRoll.canNeed ? [{ label: "Need", command: "need", tone: "primary" as const, category: "loot" as const }] : []),
      { label: "Greed", command: "greed", category: "loot" },
      { label: "Pass", command: "pass", tone: "quiet", category: "loot" },
      { label: "Inventory", command: "inventory", tone: "quiet", category: "system" },
      { label: "Recap", command: "recap", tone: "quiet", category: "system" }
    ];
  }

  if (state.encounter) {
    const firstEnemy = state.encounter.enemies.find((enemy) => enemy.hp > 0);
    const actions: ActionButton[] = [
      { label: "Seal Current Threat", command: `shield oath ${firstEnemy?.name ?? ""}`.trim(), tone: "primary", category: "combat" },
      { label: "Guard Frontline", command: "guard frontline", category: "combat" },
      { label: `Strike ${firstEnemy?.name ?? "Target"}`, command: `attack ${firstEnemy?.name ?? ""}`.trim(), category: "combat" },
      { label: "Shift Midline", command: "move midline", tone: "quiet", category: "combat" },
      { label: "Read The Moment", command: "story", tone: "quiet", category: "system" }
    ];

    if (state.encounter.currentIntentId === "road-seal-pulse") {
      actions.unshift({ label: "Use Road-Seal Bell", command: "use road-seal bell", tone: "primary", category: "combat" });
    }

    return actions;
  }

  if (state.gameplay.activeTravel) {
    return [
      { label: "Follow Road", command: "follow road", tone: "primary", category: "travel" },
      { label: "Move Cautiously", command: "move cautiously", category: "travel" },
      { label: "Listen While Walking", command: "listen while walking", category: "travel" },
      { label: "Check Party", command: "check party", category: "social" },
      { label: "Map", command: "map", tone: "quiet", category: "map" }
    ];
  }

  const room = getCurrentRoom(state);
  if (room && state.dungeon) {
    const focus = firstRoadFocusOptions.find((option) => option.dungeonRoomId === room.id);
    const actions: ActionButton[] = [
      { label: "Read Room", command: "look", category: "focus" },
      { label: "Dungeon Map", command: "map", tone: "quiet", category: "map" },
      { label: "Ask DM", command: "dm", tone: "quiet", category: "system" },
      { label: "Recap", command: "recap", tone: "quiet", category: "system" }
    ];

    if (focus) {
      actions.push({ label: focus.label, command: `explore ${focus.aliases[0] ?? focus.label}`, category: "focus" });
    }

    if (room.object) {
      actions.push({ label: `Inspect ${room.object}`, command: `inspect ${room.object}`, category: "focus" });
    }

    if (room.id === "road-seal-exit") {
      actions.unshift({ label: "Claim Road-Seal Cache", command: "loot", tone: "primary", category: "loot" });
    } else {
      actions.unshift({ label: "Step Deeper", command: "continue", tone: "primary", category: "travel" });
    }

    return actions;
  }

  switch (state.locationPoiId) {
    case "saint-veyra-capital":
      return [
        { label: "Take the Old Pilgrim Road", command: "travel Hearthmere Fields", tone: "primary", category: "travel" },
        { label: "Approach Guild Board", command: "explore guild board", category: "focus" },
        { label: "Ask Halren About Training", command: "ask Halren about training", category: "conversation" },
        { label: "Listen To The City", command: "listen", category: "social" },
        { label: "Inventory", command: "inventory", tone: "quiet", category: "system" }
      ];
    case "hearthmere-crossing":
      return [
        { label: "Follow The Shrine Road", command: "travel Road Shrine of Little Dawn", tone: "primary", category: "travel" },
        { label: "Study Low Walls", command: "explore low walls", category: "focus" },
        { label: "Ask Renn About Shrine", command: "ask Renn about shrine", category: "conversation" },
        { label: "Check Party", command: "check party", category: "social" },
        { label: "Map", command: "map", tone: "quiet", category: "map" }
      ];
    case "road-shrine-little-dawn":
      return [
        { label: "Ask Olla About The Bell", command: "ask Olla about bell", tone: "primary", category: "conversation" },
        { label: "Study Candle Rail", command: "explore candle rail", category: "focus" },
        { label: "Accept Trial", command: "accept quest", category: "system" },
        { label: "Enter Cryptlet", command: "enter dungeon", tone: "primary", category: "travel" },
        { label: "Inspect Shrine Bell", command: "inspect crypt bell", tone: "quiet", category: "focus" }
      ];
    default:
      return [{ label: "Look", command: "look", tone: "primary", category: "focus" }];
  }
}
