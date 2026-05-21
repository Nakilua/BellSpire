# BellSpire

BellSpire is a local-first, Discord-style gothic text MMO prototype. It is built for one player, but the app simulates the feeling of an MMO world around them: channels, party chat, guild contracts, NPC memory, dungeon pressure, map reading, source-governed rewards, and a local/AI Director.

The current playable route is intentionally narrow:

1. Saint Veyra Capital
2. Hearthmere Fields
3. Road Shrine of Little Dawn
4. Pilgrim Trial Cryptlet

The first playable class is Bulwark.

## Run Locally

Install dependencies:

```powershell
npm.cmd install
```

Start the web app:

```powershell
npm.cmd run dev
```

Open:

```text
http://127.0.0.1:5173/login
```

Optional live AI Director bridge:

```powershell
npm.cmd run ai
```

The API key belongs only in `.env.local`. Never paste it into chat, source files, screenshots, or save exports.

## What To Try First

- Create or continue a Bulwark at `/login`.
- Travel from Saint Veyra to Hearthmere Fields.
- Use `listen`, `who`, `lfg`, `guild contracts`, and `party hello`.
- Travel to the Road Shrine of Little Dawn.
- Talk to Shrinekeeper Olla, accept the quest, enter the Cryptlet.
- Use `guard frontline`, `shield oath`, `inspect`, `continue`, `loot`, and `recap`.
- When the Road-Seal Cache opens, use `need`, `greed`, or `pass` to resolve the Classic-style loot roll.

## Project Law

BellSpire follows source law:

- No ghost loot.
- No fake live multiplayer backend.
- No monetization.
- No invented permanent canon.
- Map art is visual support only; runtime data and source notes own canon truth.
- Loot is Classic-style in structure, but BellSpire-source-governed in truth.

Start with:

- [Start Here](docs/START_HERE.md)
- [MMO Rules Bible](docs/MMO_RULES_BIBLE.md)
- [Classic-Style Loot System v1](docs/CLASSIC_STYLE_LOOT_SYSTEM_V1.md)
- [125-Step Classic Loot Plan](docs/MASTER_PLAN_125_CLASSIC_LOOT_STEPS.md)
- [70-Step Master Plan](docs/MASTER_PLAN_70_STEPS.md)
- [Release Checklist](docs/RELEASE_CHECKLIST.md)

## Safety Checks

Run these before a serious PR:

```powershell
npm.cmd run build
npm.cmd run canon:audit
npm.cmd run loot:audit
npm.cmd run loot:simulate -- 1000 1935
npm.cmd run fixtures:audit
npm.cmd run assets:audit
npm.cmd audit --json
```

Also run a secret scan that excludes `.env.local`, `.git`, `node_modules`, `dist`, screenshots, and logs.
