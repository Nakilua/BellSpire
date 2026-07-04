import livingWorld from "../data/livingWorld.json";
import { addFeed } from "./state";
import { getCurrentZone } from "./selectors";
import type { GameState } from "./types";

type PulseReason = "channel" | "travel" | "talk" | "dungeon" | "loot" | "listen" | "social" | "rest";

interface AmbientLine {
  channelId: string;
  zoneId?: string;
  speaker: string;
  body: string;
  meta: string;
}

interface DmBeat {
  reason: PulseReason;
  speaker: string;
  body: string;
  meta: string;
}

export interface LivingWorldRhythm {
  id: string;
  channelId: string;
  zoneId?: string;
  dungeonId?: string;
  label: string;
  cadence: string;
  priority?: number;
  cooldownTicks?: number;
  triggers?: PulseReason[];
  channelRules?: string[];
  likelySpeakers: string[];
  nextPrompt: string;
  sourceNote: string;
}

const ambient = livingWorld.ambient as AmbientLine[];
const dmBeats = livingWorld.dmBeats as DmBeat[];
const rhythms = livingWorld.rhythms as LivingWorldRhythm[];

export function pulseLivingWorld(state: GameState, reason: PulseReason): GameState {
  const zone = getCurrentZone(state);
  const candidates = selectAmbientLines(state, zone.id, reason);
  const rhythm = selectRhythmForPulse(state, reason);
  const key = `${reason}:${rhythm.id}:${state.activeChannelId}:${zone.id}`;
  const cursor = state.livingWorld.ambientCursor[key] ?? 0;
  const line = candidates[cursor % Math.max(1, candidates.length)];
  const nextCursor = candidates.length ? cursor + 1 : cursor;
  const nextTick = state.livingWorld.tick + 1;

  let next: GameState = {
    ...state,
    livingWorld: {
      tick: nextTick,
      ambientCursor: {
        ...state.livingWorld.ambientCursor,
        [key]: nextCursor
      },
      schedulerCursor: {
        ...state.livingWorld.schedulerCursor,
        [rhythm.id]: (state.livingWorld.schedulerCursor[rhythm.id] ?? 0) + 1
      },
      rhythmCooldowns: {
        ...state.livingWorld.rhythmCooldowns,
        [rhythm.id]: nextTick + (rhythm.cooldownTicks ?? 2)
      },
      lastProactiveTick: ["travel", "talk", "dungeon", "loot", "listen", "social", "rest"].includes(reason) ? nextTick : state.livingWorld.lastProactiveTick,
      lastPulseReason: reason
    }
  };

  if (line) {
    next = addFeed(next, "social", line.speaker, line.body, line.meta);
  }

  const beat = selectDmBeat(reason);
  if (beat && ["travel", "dungeon", "loot", "listen", "rest"].includes(reason)) {
    next = addFeed(next, "scene", beat.speaker, beat.body, beat.meta);
  }

  return next;
}

export function postWorldChat(state: GameState, channelId: "global-chat" | "zone-chat", message: string): GameState {
  if (!message.trim()) {
    return addFeed(state, "warning", "Empty world message", "Type something after `global` or `zone`.", "World chat");
  }

  const next = addFeed(
    {
      ...state,
      activeChannelId: channelId
    },
    "social",
    `${state.character.name} in ${channelId === "global-chat" ? "#global" : "#zone"}`,
    message,
    "local world chat"
  );

  return pulseLivingWorld(next, "social");
}

export function showNearbyWorld(state: GameState): GameState {
  const zone = getCurrentZone(state);
  const rhythm = getLivingWorldRhythm(state);
  const livePlayers = state.realm.players.map(
    (player) => `${player.name} - ${player.className} (live player${player.zoneId === zone.id ? ", this zone" : ""})`
  );
  const contacts = state.social.contacts
    .filter((contact) => contact.availability === "online" || state.social.recentParty.includes(contact.name))
    .map((contact) => `${contact.name} - ${contact.role} (${contact.relationshipTag}, ${contact.availability})`);
  const body = [
    `Location: ${zone.name}`,
    `World tick: ${state.livingWorld.tick}`,
    `Realm: ${state.realm.status === "connected" ? `${state.realm.realmName ?? "live realm"} (${livePlayers.length} other live player${livePlayers.length === 1 ? "" : "s"})` : "local simulation only"}`,
    `Current rhythm: ${rhythm.label}`,
    rhythm.cadence,
    "",
    ...(livePlayers.length ? ["Live players:", livePlayers.join("\n"), ""] : []),
    "Visible contacts:",
    contacts.join("\n") || "No visible contacts.",
    "",
    "Try `listen`, `global <message>`, `zone <message>`, `lfg`, `guild contracts`, or `invite <name>`."
  ].join("\n");

  return addFeed(state, "social", "Nearby social world", body, "#zone");
}

export function getLivingWorldRhythm(state: GameState): LivingWorldRhythm {
  const zone = getCurrentZone(state);
  const activeDungeonId = state.dungeon?.dungeonId;

  return (
    rhythms.find((rhythm) => activeDungeonId && rhythm.dungeonId === activeDungeonId) ??
    rhythms.find((rhythm) => rhythm.channelId === state.activeChannelId && (!rhythm.zoneId || rhythm.zoneId === zone.id)) ??
    rhythms.find((rhythm) => rhythm.channelId === "zone-chat" && rhythm.zoneId === zone.id) ??
    rhythms.find((rhythm) => rhythm.channelId === "global-chat") ??
    rhythms[0]
  );
}

function selectRhythmForPulse(state: GameState, reason: PulseReason): LivingWorldRhythm {
  const zone = getCurrentZone(state);
  const activeDungeonId = state.dungeon?.dungeonId;
  const readyTick = state.livingWorld.tick;
  const candidates = rhythms
    .filter((rhythm) => {
      if (rhythm.dungeonId && rhythm.dungeonId !== activeDungeonId) {
        return false;
      }
      if (rhythm.zoneId && rhythm.zoneId !== zone.id) {
        return false;
      }
      if (rhythm.triggers?.length && !rhythm.triggers.includes(reason)) {
        return false;
      }
      const cooldownUntil = state.livingWorld.rhythmCooldowns[rhythm.id] ?? 0;
      return cooldownUntil <= readyTick || rhythm.channelId === state.activeChannelId;
    })
    .sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0));

  return candidates[0] ?? getLivingWorldRhythm(state);
}

function selectAmbientLines(state: GameState, zoneId: string, reason: PulseReason) {
  if (state.activeChannelId === "global-chat") {
    return ambient.filter((line) => line.channelId === "global-chat");
  }

  if (state.dungeon && (state.activeChannelId === "combat-log" || reason === "dungeon")) {
    return ambient.filter((line) => line.channelId === "party-chat");
  }

  if (state.activeChannelId === "zone-chat" || reason === "travel" || reason === "talk") {
    return ambient.filter((line) => line.channelId === "zone-chat" && (!line.zoneId || line.zoneId === zoneId));
  }

  if (state.activeChannelId === "guild-board" || state.activeChannelId === "guild-recruitment") {
    return ambient.filter((line) => line.channelId === "guild-board" || line.channelId === "guild-recruitment");
  }

  if (state.activeChannelId === "party-chat" || reason === "dungeon") {
    return ambient.filter((line) => line.channelId === "party-chat");
  }

  if (reason === "listen" || reason === "rest") {
    if (state.dungeon) {
      return ambient.filter((line) => line.channelId === "party-chat");
    }

    return ambient.filter((line) => line.channelId === "global-chat" || line.channelId === "zone-chat" && (!line.zoneId || line.zoneId === zoneId));
  }

  return ambient.filter((line) => line.channelId === "global-chat").slice(0, 2);
}

function selectDmBeat(reason: PulseReason) {
  return dmBeats.find((beat) => beat.reason === reason);
}
