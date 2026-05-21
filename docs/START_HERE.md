# Bellspire Start Here

Bellspire is a local-first, Discord-style gothic text MMO prototype for Naki, Rox, and Mina.

The first playable slice is intentionally small:

1. Saint Veyra Capital
2. Hearthmere Fields
3. Road Shrine of Little Dawn
4. Pilgrim Trial Cryptlet

The first playable class is Bulwark. The first dungeon teaches lanes, telegraphs, threat, object interaction, wipe recaps, and source-driven rewards.

## Run Locally

Install dependencies:

```powershell
npm.cmd install
```

Start the app:

```powershell
npm.cmd run dev
```

Start the optional live AI Director bridge in a second terminal:

```powershell
npm.cmd run ai
```

Rebuild the canon registry and loot audit after source files change:

```powershell
npm.cmd run canon:audit
npm.cmd run loot:audit
npm.cmd run loot:simulate -- 1000 1935
npm.cmd run fixtures:audit
npm.cmd run assets:audit
```

Open the local URL printed by Rsbuild.

The character entry screen is available at:

```text
http://127.0.0.1:5173/login
```

## Current MVP

The MVP includes:

- Discord-style channel rail
- Narrative and command feed
- Right-side map, character, party, quest, inventory, reputation, and world-state panels
- Typed commands and clickable actions
- Local save/load through `localStorage`
- Export/import JSON saves
- Bulwark starter abilities
- Pilgrim Trial Cryptlet room flow
- Bellgrave Warden encounter
- Source-pity and staged reward display
- Classic-style Group Loot with Need/Greed/Pass for rollable First Road rewards
- Local character creation through `/login`
- Local AI Director fallback for party/guild chat
- Optional OpenAI-powered AI Director bridge using `.env.local`
- AI quality modes and local spend tracking for the monthly budget cap
- Curated canon context packs sent to the AI Director, instead of dumping the full PDF/workbook into runtime
- Canon registry generated from the available Bellspire workbooks, PDF reading index, source-pack entries, loot worktables, and research references
- Runtime source-governance map covering the existing playable JSON data
- Handmade SVG atlas layers for world, zone, and dungeon maps
- Local living-world pulse for `#global`, `#zone`, party chatter, guild recruitment, and DM beats

## Rule Bibles

Start here for project law:

- [Root README](../README.md): fastest plain-English repo entrypoint.
- [MMO Rules Bible](./MMO_RULES_BIBLE.md): how the solo-local MMO, AI Director, social world, maps, combat, loot, saves, and expansion rules work.
- [Classic-Style Loot System v1](./CLASSIC_STYLE_LOOT_SYSTEM_V1.md): boss/cache/source tables, bindings, thresholds, rolls, and source-pity law.
- [125-Step Classic Loot Plan](./MASTER_PLAN_125_CLASSIC_LOOT_STEPS.md): implementation checklist for the current loot pass.
- [Bible Content Gap Audit](./BIBLE_CONTENT_GAP_AUDIT.md): what the compendium/workbooks contain that is not playable yet.
- [Canon Rules](./CANON_RULES.md): source authority, no ghost loot, audit law, and protected canon names.
- [70-Step Master Plan](./MASTER_PLAN_70_STEPS.md): the current build roadmap for the living-world first-road pass.
- [Release Checklist](./RELEASE_CHECKLIST.md): what to verify before merging serious changes.
- [Save Migration Plan](./SAVE_MIGRATION_PLAN.md): when to move beyond `saveVersion: 1`.
- [Browser Smoke Fixtures](./BROWSER_SMOKE_FIXTURES.md): repeatable fixture route checks.
- [MVP Acceptance](./MVP_ACCEPTANCE.md): the checklist for whether the current playable slice works.
- [Goals](./GOALS.md): the long-term vision, near-term goals, hard boundaries, and success feeling.
- [Roadmap](./ROADMAP.md): the phased growth path after the first playable road.
- [Skill Index](./SKILL_INDEX.md): local process skills for source governance, loot, AI Director work, and tutorial playtesting.
- [Project Instructions Prompt](./PROJECT_INSTRUCTIONS_PROMPT.md): paste-ready instructions for future BellSpire sessions.

## AI Director Setup

Bellspire keeps the API key out of the browser. The key belongs only in:

```text
.env.local
```

Expected local settings:

```env
OPENAI_API_KEY=your-key-here
BELLSPIRE_AI_MODE=auto
BELLSPIRE_AI_LIVE_MODEL=gpt-5.4-mini
BELLSPIRE_AI_CINEMATIC_MODEL=gpt-5.4
BELLSPIRE_AI_PORT=8787
```

`auto` means normal party/guild chat uses mini, while cinematic lore or major scene requests try full `gpt-5.4`. If the bridge is offline, the key is missing, or the full model is blocked by quota, the app falls back to a cheaper/safe route instead of breaking play.

The right-side Social World panel shows current quality mode, estimated spend, last request cost, live/cinematic/local turn counts, and budget state. You can switch modes with the buttons there or with commands:

```text
ai mode auto
ai mode mini
ai mode cinematic
ai mode local
```

Local mode uses the built-in Director only. The app also stops calling the AI bridge once the tracked spend reaches the configured stop point.

## Canon Context Packs

The live AI Director receives a small canon packet selected from `src/data/canonContextPacks.json` for the current location, party channel, dungeon room, and message. This keeps replies grounded in Saint Veyra, Hearthmere Fields, Road Shrine of Little Dawn, Pilgrim Trial Cryptlet, Bulwark rules, social cast, and canon safety rules without loading the entire archive during play.

## Canon Registry And Loot Audit

`npm.cmd run canon:audit` scans the local source workbooks and source pack in `C:\Users\steph\Downloads`, normalizes workbook rows into `src/data/canonRegistry.json`, and writes [CANON_REGISTRY_AUDIT.md](./source_audit/CANON_REGISTRY_AUDIT.md). The current registry includes source rows for zones, POIs, instances, bosses, public events, materials, loot sources, tank loot items, rarity config, drop rules, class hooks, source-pack entries, and research references.

Permanent gear still follows source law. Runtime rewards must be canonical, staged, or prototype-labeled.

The loot engine now owns item grants. The AI Director may narrate the reward moment, but it cannot create items. The default First Road loot style is Group Loot with an Uncommon threshold: Need beats Greed, Greed beats Pass, and future-zone loot remains preview-locked.

The existing runtime JSON is also source-governed through `src/data/sourceGovernance.json`. The audit fails if a new runtime data file is added without a source tier, source status, and source references.

Source priority is explicit now:

1. Compendium and complete data workbook define canon.
2. Loot worktables define item rarity, source rows, drop safety, and staged reward status.
3. Focused bibles define zone, dungeon, event, social, economy, progression, and preview content.
4. Research papers and notes shape systems, pacing, UX, social simulation, and MMO feel, but they do not create canon facts by themselves.

## Living World Commands

Useful social/DM commands:

```text
listen
who
global <message>
zone <message>
channel guild-recruitment
party <message>
guild <message>
director <message>
```

Ambient global, zone, party, and guild recruitment chatter is local by default. The OpenAI bridge is reserved for direct player interaction and cinematic/director moments so the monthly budget does not melt in the background.

## Source Truth

The source files live outside the repo in the current handoff bundle. See [SOURCE_MANIFEST.md](./SOURCE_MANIFEST.md).

The app does not read the full PDF or workbook at runtime. Runtime data is curated into small JSON files under `src/data`.
