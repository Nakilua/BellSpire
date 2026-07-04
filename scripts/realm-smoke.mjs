// Realm smoke test: boots the realm server on a scratch port, connects two
// fake players, and asserts the "two browsers, one road" contract — mutual
// presence, zone-scoped chat, global chat, and clean disconnect.
import { spawn } from "node:child_process";
import { once } from "node:events";
import WebSocket from "ws";

const PORT = 8790;

function connectPlayer(hello) {
  return new Promise((resolvePromise, rejectPromise) => {
    const socket = new WebSocket(`ws://127.0.0.1:${PORT}`);
    const player = { socket, sessionId: "", roster: [], chats: [] };

    socket.on("message", (data) => {
      const message = JSON.parse(String(data));
      if (message.t === "welcome") {
        player.sessionId = message.sessionId;
        player.roster = message.roster;
        resolvePromise(player);
      } else if (message.t === "roster") {
        player.roster = message.players;
      } else if (message.t === "chat") {
        player.chats.push(message);
      }
    });

    socket.on("open", () => socket.send(JSON.stringify({ t: "hello", ...hello })));
    socket.on("error", rejectPromise);
  });
}

function waitFor(check, label, timeoutMs = 5000) {
  return new Promise((resolvePromise, rejectPromise) => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (check()) {
        clearInterval(timer);
        resolvePromise(undefined);
      } else if (Date.now() - startedAt > timeoutMs) {
        clearInterval(timer);
        rejectPromise(new Error(`FAIL timeout waiting for: ${label}`));
      }
    }, 25);
  });
}

console.log("[realm-smoke] starting realm server...");
const server = spawn(process.execPath, ["server/bellspire-realm-server.mjs"], {
  env: { ...process.env, BELLSPIRE_REALM_PORT: String(PORT), BELLSPIRE_REALM_NAME: "Smoke Realm" },
  stdio: ["ignore", "pipe", "inherit"]
});

try {
  await once(server.stdout, "data");

  const naki = await connectPlayer({ name: "Naki", className: "Bulwark", zoneId: "hearthmere" });
  const renn = await connectPlayer({ name: "Renn", className: "Bulwark", zoneId: "hearthmere" });
  console.log("  ok two players connected");

  await waitFor(() => naki.roster.some((p) => p.name === "Renn") && renn.roster.some((p) => p.name === "Naki"), "mutual presence");
  console.log("  ok mutual presence in roster");

  renn.socket.send(JSON.stringify({ t: "chat", channelId: "zone-chat", body: "The road feels real tonight." }));
  await waitFor(() => naki.chats.some((c) => c.name === "Renn" && c.channelId === "zone-chat"), "zone chat delivery");
  console.log("  ok zone chat delivered to same-zone player");

  naki.socket.send(JSON.stringify({ t: "move", zoneId: "saint-veyra" }));
  await waitFor(() => renn.roster.some((p) => p.name === "Naki" && p.zoneId === "saint-veyra"), "move broadcast");
  console.log("  ok zone move broadcast");

  const zoneChatsBefore = naki.chats.filter((c) => c.channelId === "zone-chat").length;
  renn.socket.send(JSON.stringify({ t: "chat", channelId: "zone-chat", body: "Hearthmere only." }));
  renn.socket.send(JSON.stringify({ t: "chat", channelId: "global-chat", body: "Bells over every road." }));
  await waitFor(() => naki.chats.some((c) => c.channelId === "global-chat"), "global chat delivery");
  if (naki.chats.filter((c) => c.channelId === "zone-chat").length !== zoneChatsBefore) {
    throw new Error("FAIL zone chat leaked across zones");
  }
  console.log("  ok zone chat stays zone-scoped, global chat reaches everyone");

  renn.socket.close();
  await waitFor(() => !naki.roster.some((p) => p.name === "Renn"), "disconnect roster update");
  console.log("  ok disconnect removes player from roster");

  naki.socket.close();
  console.log("[realm-smoke] realm smoke test passed.");
} finally {
  server.kill();
}
