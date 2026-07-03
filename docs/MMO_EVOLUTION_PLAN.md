# BellSpire MMO Evolution Plan

GOALS.md says "No account system or backend until explicitly planned later." This document is that explicit plan: how BellSpire grows from a local-first, single-player MMO simulation into a real multiplayer game — without throwing away what makes it work, and without violating the other hard boundaries (no ghost loot, no fake live claims, source governance stays law).

## Where the code stands today

- **Everything is client-authoritative.** All ~4,500 lines of game logic (`src/game/`) run in the browser: combat resolution, loot rolls (`lootEngine.ts`), social trust, world flags, the Director. The save is a single localStorage key (`bellspire.save.v1`).
- **The only server is an AI proxy.** `server/bellspire-ai-server.mjs` holds the API key and forwards Director prompts. It has no game state, no sessions, no persistence.
- **Content is data, not code.** ~30 JSON files under `src/data/` (zones, quests, loot tables, NPCs, binding rules, source governance) plus the audit scripts. This is the most MMO-ready part of the project — a server can consume these files as-is.
- **The social layer is simulated.** Channels, `who`, LFG, party chat, and guild boards are populated by `social.ts` / `livingWorld.ts` from JSON fixtures and local rotation logic.

The honest framing: BellSpire today is an excellent *single-player client plus content database*. Becoming an MMO means growing a server that owns truth, and demoting the client to a renderer of that truth.

## The one architectural decision that matters

**The server must become authoritative before anything else multiplayer is built.** Two players cannot share a world where each browser decides its own loot rolls, XP, and world flags — that is ghost loot with extra steps. Every phase below is really a step in moving authority from `src/game/` into a server process.

The good news: the game state is already shaped as plain serializable objects mutated through reducer-style functions (`addFeed(state, ...)` returns a new state). That style ports to a server tick loop almost directly. The main impurities to fix are `Date.now()`-based IDs and module-level counters in `state.ts`, and direct JSON imports scattered through game code.

## Phases

Each phase leaves the game playable end-to-end, keeps the solo/local mode working, and never claims live multiplayer before it is real.

### Phase A — Isomorphic game core (no visible change)

Goal: the same rules run in a browser *or* in Node.

1. Extract `src/game/` + `src/data/` into a `core/` package with no DOM, no React, no localStorage references. The React app imports it; a headless Node harness can also import it.
2. Make the simulation deterministic: seeded RNG passed into combat and loot, IDs from a counter in state (not `Date.now()`), time as a tick number the caller advances.
3. Formalize the command boundary. `commands.ts` already parses text into intents — split that into `parseCommand(text) -> Intent` and `applyIntent(state, intent, rng) -> state`. The Intent type becomes the future network protocol.
4. Add a replay test: a scripted First Road run (login → Cryptlet → loot roll) as a list of intents, asserted against a snapshot. This is the regression net for everything after.

Exit criteria: `node scripts/replay-first-road.mjs` plays the tutorial headlessly and matches the browser result.

### Phase B — Authoritative server, single realm, real accounts

Goal: two browsers, one world, chat and presence are real.

1. Grow the AI bridge into a real game server (or a sibling process): WebSocket connections, one world instance running the Phase A core on a tick loop, SQLite persistence to start.
2. Accounts and characters server-side. Migrate localStorage saves via the existing export format — a one-time import endpoint honors legacy solo progress.
3. First real multiplayer surface: **chat and presence**. BellSpire is Discord-shaped, so this is the natural beachhead — real players appear in `who`, zone/global channels carry real messages, parties can contain real people. Combat can remain per-player initially.
4. Keep simulated players in the mix, clearly labeled server-side. This is BellSpire's unique advantage: most MMOs die from empty-world syndrome; BellSpire already knows how to make a world feel populated. Real players displace sim players as population grows — the sim becomes backfill, not fakery, and the client always knows which is which (no fake live claims).
5. Move the Director server-side entirely. Budget guarding (`budget.ts`) becomes per-account server policy; the API key never had business near the client anyway.

Exit criteria: two browsers on different machines see each other in `who`, talk in zone chat, and reconnect to the same characters.

### Phase C — Shared world state and instanced dungeons

Goal: playing *together*, not just talking together.

1. Server-owned world flags and zone state: shrine events, road danger, guild contract boards become shared. `worldFlags.json` seeds them; the DB owns them after.
2. Party play in dungeons: the Pilgrim Trial Cryptlet becomes an instanced run — a fresh core-state instance per party, ticked server-side. The existing lane/telegraph/wipe design maps cleanly onto instancing.
3. **Loot rolls move server-side, non-negotiably.** Need/greed/pass is a distributed transaction between party members; `lootEngine.ts` plus `bindingRules.json` and the loot audit scripts already define legality — the server just becomes the only one allowed to execute them.
4. Latency posture: this is a text MMO. Commands are intents, ticks can be 250–1000ms, and no one needs client-side prediction. That single fact removes 80% of typical MMO netcode pain — lean into it.

Exit criteria: a two-human party clears the Cryptlet, the Road-Seal Cache roll resolves server-side, and both inventories agree with the loot audit rules.

### Phase D — Scale and operations (only when needed)

Deferred until real population demands it: Postgres over SQLite, Redis pub/sub for cross-zone chat, one-process-per-zone sharding, rate limiting, moderation tooling, GDPR-grade account deletion. None of this should be built speculatively — a single Node process with SQLite comfortably serves hundreds of concurrent text-MMO players.

## What carries over untouched

- All `src/data/` content JSON, source governance, canon registry, and audit scripts (`loot:audit`, `canon:audit`, `fixtures:audit`) — these become *server-side* validation gates.
- The entire React UI layer; it changes from calling `applyIntent` locally to sending intents over a socket and rendering state diffs.
- Solo/local mode itself: the Phase A core keeps running fully in-browser, so offline BellSpire remains a supported way to play, not a casualty.

## What must be rewritten or retired

- Client-side authority over rewards, XP, flags, and rolls (Phase B/C).
- `Date.now()`/module-counter IDs and any nondeterminism in the core (Phase A).
- The "simulated players are the whole population" assumption — they become a labeled backfill system with a server-side population manager.

## Suggested first milestone

Don't start with Phase A abstractly — start with a target that forces it: **"two browsers, one road."** Two logged-in players standing in Hearthmere Fields see each other in `who` and in zone chat. Reaching that milestone mechanically drags Phase A and half of Phase B into existence, and it is the first moment BellSpire is truthfully, not simulatedly, multiplayer.
