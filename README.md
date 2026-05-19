# BellSpire

BellSpire is a local-first, Discord-style gothic text MMO prototype. It is built as a solo playable world where the app simulates the MMO layer around the player: channels, party chatter, guild activity, dungeon narration, source-governed loot, and a hybrid AI Director / DND-DM feeling.

The first playable slice is deliberately focused:

1. Saint Veyra Capital
2. Hearthmere Fields
3. Road Shrine of Little Dawn
4. Pilgrim Trial Cryptlet

The first playable class is `Bulwark`.

## Run Locally

Install packages:

```powershell
npm.cmd install
```

Start the game:

```powershell
npm.cmd run dev
```

Open:

```text
http://127.0.0.1:5173/
```

Character creation is at:

```text
http://127.0.0.1:5173/login
```

Optional live AI Director bridge:

```powershell
npm.cmd run ai
```

The API key belongs only in `.env.local`. Do not commit it.

## What Is Playable

- Local character creation
- Discord-style channel layout
- Typed commands and clickable actions
- First route from Saint Veyra to the Road Shrine of Little Dawn
- Shrinekeeper Olla interaction
- Pilgrim Trial Cryptlet dungeon flow
- Bulwark combat with lanes, Guard Stance, Shield Oath, telegraphs, victory, defeat, and recap
- Local social simulation for party, guild, group finder, and world chat
- Save persistence through browser storage
- Save export/import
- Source-governed reward cache for the first dungeon

## Loot Rules

BellSpire loot is source-driven first and rarity-driven second.

That means the game does not simply invent shiny gear when something dies. A reward must be allowed by the compendium, workbooks, loot tables, or a clearly labeled staged/prototype rule.

Current playable loot is a fixed first-dungeon reward cache, not a full random drop engine yet. After defeating the Bellgrave Warden and reaching the Road-Seal Exit, `loot` grants materials, reputation, source pity, and a staged Bulwark shield reward.

For the exact current and planned drop behavior, see [Loot Drop System](./docs/LOOT_DROP_SYSTEM.md).

## Source Law

BellSpire follows this authority order:

1. Complete Canon Compendium v1.1 and Complete Data Workbook v1.1
2. Loot worktables, item tables, rarity config, drop rules, and source tables
3. Focused zone, dungeon, boss, economy, social, and progression bibles
4. Discord/map playstyle and Codex handoff prompts
5. Research notes and design references

Research can improve systems. It cannot rename canon, override the compendium, or create permanent gear.

Run the canon audit after changing runtime data or loot:

```powershell
npm.cmd run canon:audit
```

## Useful Docs

- [Start Here](./docs/START_HERE.md)
- [MMO Rules Bible](./docs/MMO_RULES_BIBLE.md)
- [Canon Rules](./docs/CANON_RULES.md)
- [Loot Drop System](./docs/LOOT_DROP_SYSTEM.md)
- [MVP Acceptance](./docs/MVP_ACCEPTANCE.md)
- [Goals](./docs/GOALS.md)
- [Roadmap](./docs/ROADMAP.md)
- [Skill Index](./docs/SKILL_INDEX.md)

## Safety Notes

- No ghost loot.
- No fake multiplayer claims.
- No monetization.
- No full MMO backend in the MVP.
- No API key in browser code, save exports, Git history, or chat logs.
- The AI Director may narrate and roleplay, but the app owns rules, state, rewards, and source law.
