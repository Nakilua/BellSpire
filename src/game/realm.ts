import { addFeed } from "./state";
import { getCurrentZone } from "./selectors";
import type { GameState, RealmConnectionStatus, RealmPlayerPresence } from "./types";

export interface RealmChatMessage {
  channelId: "global-chat" | "zone-chat";
  sessionId: string;
  name: string;
  className: string;
  zoneId: string;
  body: string;
}

export function applyRealmStatus(state: GameState, status: RealmConnectionStatus, realmName?: string, selfSessionId?: string): GameState {
  const previous = state.realm.status;
  const next: GameState = {
    ...state,
    realm: {
      status,
      realmName: status === "offline" ? undefined : realmName ?? state.realm.realmName,
      selfSessionId: status === "offline" ? undefined : selfSessionId ?? state.realm.selfSessionId,
      players: status === "connected" ? state.realm.players : []
    }
  };

  if (status === "connected" && previous !== "connected") {
    return addFeed(
      next,
      "system",
      `Connected to ${next.realm.realmName ?? "the live realm"}`,
      "This session now shares presence and world chat with real players. Live players are always labeled; the local simulation keeps running around you.",
      "Live realm"
    );
  }

  if (status === "offline" && previous === "connected") {
    return addFeed(next, "system", "Live realm disconnected", "Back to the local realm. Your save and the simulated world are unaffected.", "Live realm");
  }

  return next;
}

export function applyRealmRoster(state: GameState, players: RealmPlayerPresence[]): GameState {
  const others = players.filter((player) => player.sessionId !== state.realm.selfSessionId);
  const previousIds = new Set(state.realm.players.map((player) => player.sessionId));
  const nextIds = new Set(others.map((player) => player.sessionId));

  let next: GameState = {
    ...state,
    realm: {
      ...state.realm,
      players: others
    }
  };

  for (const player of others) {
    if (!previousIds.has(player.sessionId)) {
      next = addFeed(next, "social", `${player.name} is on the road`, `${player.name} the ${player.className} is online in the live realm.`, "Live player");
    }
  }

  for (const player of state.realm.players) {
    if (!nextIds.has(player.sessionId)) {
      next = addFeed(next, "social", `${player.name} left the road`, `${player.name} disconnected from the live realm.`, "Live player");
    }
  }

  return next;
}

export function applyRealmChat(state: GameState, message: RealmChatMessage): GameState {
  if (message.sessionId === state.realm.selfSessionId) {
    return state;
  }

  if (message.channelId === "zone-chat" && message.zoneId !== getCurrentZone(state).id) {
    return state;
  }

  return addFeed(
    state,
    "social",
    `${message.name} in ${message.channelId === "global-chat" ? "#global" : "#zone"} (live)`,
    message.body,
    "Live player"
  );
}

export function listRealmPlayersInZone(state: GameState, zoneId: string): RealmPlayerPresence[] {
  return state.realm.players.filter((player) => player.zoneId === zoneId);
}
