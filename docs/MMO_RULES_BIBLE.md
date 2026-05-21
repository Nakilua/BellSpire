# Bellspire MMO Rules Bible

This document defines how Bellspire behaves as a local-first, Discord-style gothic text MMO. It is the operating law for gameplay, social simulation, AI direction, loot, maps, source governance, and scope.

Bellspire is not trying to fake a shipped commercial MMO. It is trying to make one player feel like they are standing inside a living MMO universe, with the app and AI Director simulating the surrounding world in a source-governed way.

## Core Identity

Bellspire is:

- A local-first text MMO prototype.
- A gothic fantasy world with Discord-style channels.
- A playable story game with dungeon, party, guild, map, loot, and social systems.
- A solo experience where the computer/AI simulates NPCs and player-like contacts.
- A DND-DM hybrid where narration, social replies, world texture, and scene framing help the world feel alive.

Bellspire is not:

- A real multiplayer backend.
- A live service.
- A monetized product.
- A fake account system.
- A giant MMO scope leap before the first route works.
- A place where AI can invent permanent canon without source proof.

## First Playable Law

The first playable slice stays narrow until it feels good:

1. Saint Veyra Capital.
2. Hearthmere Fields.
3. Road Shrine of Little Dawn.
4. Pilgrim Trial Cryptlet.

The first playable class is Bulwark.

Other regions, dungeons, classes, raids, economies, and endgame systems may appear as locked previews, source references, or simulated world chatter. They must not pretend to be fully playable until the app actually supports them.

## Source Authority Law

All work follows the source authority ladder:

1. Complete Canon Compendium v1.1 and Complete Data Workbook v1.1 define canon facts.
2. Loot worktables define item rarity, drop safety, permanent gear, source pity, and reward legality.
3. Focused bibles define zones, dungeons, events, bosses, social systems, economy, progression, and preview content.
4. Discord/map playstyle and Codex handoff prompts define the app shape and MVP guardrails.
5. Research papers and production notes inform MMO feel, pacing, UX, social design, economy, and system quality.

Research can improve how a system works. Research cannot rename canon, create permanent loot, rewrite factions, or override source rows.

Every runtime JSON file must be covered by `src/data/sourceGovernance.json`. `npm.cmd run canon:audit` must report full runtime governance before new source-driven content is trusted.

## No Ghost Loot

Permanent gear must be source-governed.

Allowed reward states:

- Canonical source row.
- Source checked.
- Staged source reward.
- Prototype reward.

Useful rewards may exist without permanent gear:

- Materials.
- Reputation.
- Source pity.
- Guild credit.
- Quest progress.
- Social trust.
- Session recap memory.

No random permanent item silently enters the world. If the reward is unfinished, the app says so plainly.

BellSpire uses Classic-style loot structure, not personal loot. Default group loot is Group Loot with an Uncommon threshold. Need beats Greed, Greed beats Pass, and simulated party members may react to rolls. This creates MMO social texture while keeping the loot engine, not the AI Director, in charge of item grants.

Binding labels are BellSpire-specific:

- Tradable.
- Oathbound on Pickup.
- Oathbound on Equip.
- Quest-bound.
- Staged-bound.

Future-zone sources may be indexed as locked previews, but they cannot drop in the First Road route.

## Living World Law

Bellspire should feel proactive, not empty.

The world may simulate:

- Global chat.
- Zone chat.
- Party chat.
- Guild board posts.
- Guild recruitment.
- Group finder listings.
- NPC routines.
- Player-like contacts.
- Road reports.
- Locked-preview rumors.
- DM beats during travel, waiting, listening, dungeon entry, and loot.

Local ambient simulation should not spend API tokens by itself. API calls are reserved for player-directed social interaction, party/guild responses, lore questions, and cinematic/director moments.

## Social Simulation Law

Simulated players are allowed and expected. They must be honest in design:

- They are local world agents, not real humans.
- They may act like MMO players in chat.
- They may have roles, preferences, trust, availability, memory, and party behavior.
- They may invite, react, decline, tease, worry, ask questions, and remember what happened.
- They must stay inside source-governed world state.

Social systems should track:

- Party joins.
- Invites.
- Trust.
- Guild contracts.
- Recruitment chatter.
- NPC reactions.
- Social memory.
- Wipe reactions.
- Session recap.

## AI Director Law

The AI Director is a storyteller and social voice layer. It does not own the whole game state.

The AI Director may:

- Speak as NPCs.
- Speak as simulated players.
- Add atmosphere.
- Answer world questions from the current canon packet.
- Narrate cinematic beats.
- Help the world feel alive.
- Use emotional nuance and human-feeling replies.

The AI Director may not:

- Invent permanent loot.
- Rename canon.
- claim real multiplayer exists.
- Spend API budget in the background without player action.
- Override source files.
- Change major quest or reward state without the app systems doing it.

Normal social/world chat uses the live model. Major lore, emotional scenes, boss beats, and cathedral-door moments can route to the cinematic model when budget allows.

If the API fails, quota blocks a model, the bridge is offline, or the budget stop is reached, the local Director must keep the game playable.

## DND-DM Hybrid Law

Bellspire may behave like a DM when the player needs world response:

- It can frame what the character notices.
- It can make NPCs answer naturally.
- It can describe consequences.
- It can explain a wipe.
- It can show pressure building before a fight.
- It can make travel and waiting feel alive.

But gameplay state should remain legible. A player should be able to understand:

- Where they are.
- What changed.
- Why a quest advanced.
- Why combat damage happened.
- Why a reward is allowed.
- What command or action is available next.

The world may be mysterious. The interface should not be confusing.

## Map And Topography Law

Maps are part of play, not decoration.

Maps should show:

- Current location.
- Connected routes.
- Locked preview regions.
- Services.
- Danger zones.
- Guild hooks.
- Dungeon rooms.
- Hand-authored topography.

The current map can be schematic. It must still respect source-governed geography and region identity.

Future maps should preserve the feeling of paper, ink, roads, shrines, fields, coasts, towers, forests, cathedrals, and underground spaces. Do not use generic decorative blobs when the map is supposed to communicate world structure.

## Combat Law

Combat is turn-based, readable, and lesson-driven.

The MVP combat loop must show:

- Lanes: Frontline, Midline, Backline.
- Enemy intent.
- Telegraphs.
- Bulwark defensive choices.
- Guard Stance.
- Shield Oath.
- Object counterplay.
- Adds.
- Victory.
- Defeat.
- Wipe recap.

Combat should teach the player why something happened. Failure should feel like useful information, not random punishment.

## Progression Law

Progression should be paced, not inflated.

Allowed MVP progression:

- Character creation.
- Bulwark starter ability use.
- Quest steps.
- Reputation.
- Source pity.
- Inventory.
- Session recap.
- Social trust.
- Guild credit.
- Locked preview hints.

Not allowed in the first pass:

- Full leveling curve.
- Full class support.
- Full economy.
- Real auction house.
- Raids.
- Account systems.
- Live guild backend.
- Fake payment/monetization loops.

## Save And Recap Law

Bellspire is local-first.

Saves use `localStorage` with `saveVersion: 1`.

The player must be able to:

- Refresh and keep progress.
- Export a save JSON.
- Import a save JSON.
- See a session recap.

Session recap should track:

- Location.
- Quests.
- Loot.
- Wipes.
- Reputation.
- Source pity.
- Flags.
- NPC reactions.
- Social actions.

## Feature Definition Of Done

A new feature is not done until:

- It has source governance.
- It respects the MMO rules bible.
- It does not break the MVP route.
- It does not create ghost loot.
- It works locally.
- It has a clear player-facing command or button.
- It is readable on desktop and acceptable on mobile width.
- It persists correctly if it affects player progress.
- It appears in recap if it matters.
- `npm.cmd run canon:audit` passes.
- `npm.cmd run build` passes.

## Expansion Rule

The world may grow, but only in rings:

1. Make the first road feel alive.
2. Make the first dungeon feel playable.
3. Make social simulation feel believable.
4. Make loot and source law strict.
5. Expand one adjacent region at a time.
6. Add more classes only when their gameplay and source rows are ready.

The cathedral door opens first. The haunted kingdom can wait its turn.
