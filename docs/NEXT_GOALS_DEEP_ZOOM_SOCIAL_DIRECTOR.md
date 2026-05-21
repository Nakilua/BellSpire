# BellSpire Deep Zoom + Social Director Goals

This branch extends the merged MMO UI foundation into a more inspectable atlas and a more alive local social world.

## Current Goals

- Add source-safe deep zoom entries for city services, route close-ups, dungeon floors, and boss rooms.
- Keep map art as visual support only; runtime data and source notes remain canon authority.
- Make the Social World panel show the current local MMO rhythm instead of only static contacts and buttons.
- Add `world pulse` as a plain command for hearing ambient chat, route pressure, and DM texture on demand.
- Keep all new social/world lines local-first and honest: simulated MMO atmosphere, not a fake multiplayer backend.

## First Pass Added

- `src/data/atlasDeepZooms.json` records inspectable zoom targets with focus points, player verbs, and source notes.
- The Atlas View now shows deep zoom ledger cards beside zone and dungeon maps.
- The Social World panel now shows the active world rhythm, likely voices, tick count, and a `World Pulse` button.
- `world pulse`, `social pulse`, and `pulse` now route through the existing listen/narrative pulse path.

## Next Targets

- Generate or paint additional close-up plates for inns, class halls, crafting districts, and individual dungeon rooms.
- Add a rhythm scheduler so global/zone/guild/party chatter can advance gently over time during play.
- Add richer DM scene contracts: sensory detail, social reaction, tactical clue, and source-law note.
- Add tutorial checks proving the world still feels alive from `/login` through Cryptlet entry.

## Boundaries

- No invented permanent shop, vendor, inn, loot, or NPC names without source support.
- No real multiplayer claims.
- No loot-drop rules in this branch unless explicitly started as its own system pass.
