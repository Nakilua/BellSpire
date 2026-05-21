# BellSpire Gameplay Loop v2 Goals

Gameplay Loop v2 makes the First Road feel lived-in instead of command-parser bare.

This pass does not expand the playable world beyond Saint Veyra, Hearthmere Fields, Road Shrine of Little Dawn, and Pilgrim Trial Cryptlet. It improves how the player moves, asks, notices, fights, recovers, and remembers.

## Target Feel

- Travel feels like taking a road, not teleporting between nodes.
- Exploration reveals focus choices, local texture, clues, services, and next actions.
- Conversation feels like asking people about things, not collecting one static line.
- Party members warn, praise, worry, and remember.
- Combat clearly shows intent, target, response, consequence, and lesson.
- The DM layer frames scenes and consequences without secretly changing state.
- The map becomes part of play through route progress, markers, pings, and room lessons.

## First Road Acceptance

- Saint Veyra has obvious focuses: guild board, training yard, plaza, east road gate.
- Hearthmere has obvious focuses: low walls, field path, road sign, fog, Renn.
- Little Dawn has obvious focuses: candle rail, shrine bell, crypt stair, Olla, roadwarden post.
- Staged travel requires at least one road beat before arrival.
- NPCs expose topics through `talk` and `ask <npc> about <topic>`.
- `explore`, `search`, `observe`, `what do I notice?`, and `what should I do?` all help the player.
- Combat object rooms give exact useful hints after failure and before relevant danger.
- The Road-Seal Cache still uses the loot engine; no AI or exploration action grants ghost loot.

## Boundaries

- No second playable zone in this pass.
- No new permanent canon locations, shops, vendors, NPCs, or loot unless source-backed.
- No real multiplayer claims.
- No Android packaging work in this pass.
- No save migration unless compatibility defaults fail.

## Design Rule

BellSpire should answer the player's intent, not punish exact wording. The old commands stay valid, but the world should also understand natural phrases like `follow road`, `ask Olla about the bell`, `what do I notice?`, and `check party`.
