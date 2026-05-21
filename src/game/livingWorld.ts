import livingWorld from "../data/livingWorld.json";
import { addFeed } from "./state";
import { getCurrentZone } from "./selectors";
import type { GameState } from "./types";

type PulseReason = "channel" | "travel" | "talk" | "dungeon" | "loot" | "listen" | "social";

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
  const key = `${reason}:${state.activeChannelId}:${zone.id}`;
  const cursor = state.livingWorld.ambientCursor[key] ?? 0;
  const line = candidates[cursor % Math.max(1, candidates.length)];
  const nextCursor = candidates.length ? cursor + 1 : cursor;

  let next: GameState = {
    ...state,
    livingWorld: {
      tick: state.livingWorld.tick + 1,
      ambientCursor: {
        ...state.livingWorld.ambientCursor,
        [key]: nextCursor
      },
      lastPulseReason: reason
    }
  };

  if (line) {
    next = addFeed(next, "social", line.speaker, line.body, line.meta);
  }

  const beat = selectDmBeat(reason);
  if (beat && ["travel", "dungeon", "loot", "listen"].includes(reason)) {
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
  const contacts = state.social.contacts
    .filter((contact) => contact.availability === "online" || state.social.recentParty.includes(contact.name))
    .map((contact) => `${contact.name} - ${contact.role} (${contact.relationshipTag}, ${contact.availability})`);
  const body = [
    `Location: ${zone.name}`,
    `World tick: ${state.livingWorld.tick}`,
    `Current rhythm: ${rhythm.label}`,
    rhythm.cadence,
    "",
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

  if (reason === "listen") {
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
