import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { WebSocketServer } from "ws";

// BellSpire live realm server: the first authoritative multiplayer surface.
// Scope is deliberately narrow — presence and world chat ("two browsers, one
// road"). Combat, loot, and quests stay client-local until the core moves
// server-side; this server never invents rewards or world state.

const port = Number(process.env.BELLSPIRE_REALM_PORT || 8788);
const realmName = process.env.BELLSPIRE_REALM_NAME || "First Road Realm";

const MAX_NAME_LENGTH = 24;
const MAX_MESSAGE_LENGTH = 280;
const RATE_LIMIT_WINDOW_MS = 5000;
const RATE_LIMIT_MAX_MESSAGES = 5;

/** @type {Map<import("ws").WebSocket, {sessionId: string, name: string, className: string, zoneId: string, chatTimestamps: number[]}>} */
const players = new Map();

const httpServer = createServer((request, response) => {
  response.setHeader("content-type", "application/json");
  if (request.url === "/api/realm/status") {
    response.writeHead(200);
    response.end(JSON.stringify({ ok: true, realmName, online: players.size }));
    return;
  }
  response.writeHead(404);
  response.end(JSON.stringify({ ok: false, error: "not_found" }));
});

const wss = new WebSocketServer({ server: httpServer });

function cleanText(value, maxLength) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, maxLength);
}

function roster() {
  return [...players.values()].map((player) => ({
    sessionId: player.sessionId,
    name: player.name,
    className: player.className,
    zoneId: player.zoneId
  }));
}

function send(socket, payload) {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

function broadcast(payload, filter = () => true) {
  const text = JSON.stringify(payload);
  for (const [socket, player] of players) {
    if (socket.readyState === socket.OPEN && filter(player)) {
      socket.send(text);
    }
  }
}

function broadcastRoster() {
  broadcast({ t: "roster", players: roster() });
}

function isRateLimited(player) {
  const now = Date.now();
  player.chatTimestamps = player.chatTimestamps.filter((stamp) => now - stamp < RATE_LIMIT_WINDOW_MS);
  if (player.chatTimestamps.length >= RATE_LIMIT_MAX_MESSAGES) {
    return true;
  }
  player.chatTimestamps.push(now);
  return false;
}

wss.on("connection", (socket) => {
  socket.on("message", (data) => {
    let message;
    try {
      message = JSON.parse(String(data));
    } catch {
      return;
    }

    if (message.t === "hello" && !players.has(socket)) {
      const name = cleanText(message.name, MAX_NAME_LENGTH) || "Nameless Pilgrim";
      const player = {
        sessionId: randomUUID(),
        name,
        className: cleanText(message.className, MAX_NAME_LENGTH) || "Bulwark",
        zoneId: cleanText(message.zoneId, 64) || "saint-veyra",
        chatTimestamps: []
      };
      players.set(socket, player);
      send(socket, { t: "welcome", realmName, sessionId: player.sessionId, roster: roster() });
      broadcastRoster();
      console.log(`[realm] ${player.name} connected (${players.size} online)`);
      return;
    }

    const player = players.get(socket);
    if (!player) {
      send(socket, { t: "error", error: "hello_required" });
      return;
    }

    if (message.t === "move") {
      player.zoneId = cleanText(message.zoneId, 64) || player.zoneId;
      broadcastRoster();
      return;
    }

    if (message.t === "chat") {
      const body = cleanText(message.body, MAX_MESSAGE_LENGTH);
      const channelId = message.channelId === "zone-chat" ? "zone-chat" : "global-chat";
      if (!body) {
        return;
      }
      if (isRateLimited(player)) {
        send(socket, { t: "error", error: "rate_limited" });
        return;
      }
      broadcast(
        {
          t: "chat",
          channelId,
          sessionId: player.sessionId,
          name: player.name,
          className: player.className,
          zoneId: player.zoneId,
          body
        },
        (recipient) => channelId === "global-chat" || recipient.zoneId === player.zoneId
      );
    }
  });

  socket.on("close", () => {
    const player = players.get(socket);
    if (player) {
      players.delete(socket);
      broadcastRoster();
      console.log(`[realm] ${player.name} disconnected (${players.size} online)`);
    }
  });

  socket.on("error", () => {
    socket.close();
  });
});

httpServer.listen(port, () => {
  console.log(`BellSpire realm server "${realmName}" listening on ws://127.0.0.1:${port}`);
});
