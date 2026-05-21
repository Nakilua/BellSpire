# Bellspire Canon Rules

These rules protect the project from scope drift and AI slop.

For broader gameplay, social, AI Director, map, save, and expansion rules, see [MMO_RULES_BIBLE.md](./MMO_RULES_BIBLE.md).

## Sacred Rules

- No ghost loot.
- No renamed canon zones, bosses, factions, classes, or mechanics.
- No unsourced "cool idea" may override the compendium, workbooks, loot worktables, or source-pack bibles.
- No monetization.
- No commercial MMO production fantasy in the MVP.
- No backend, account system, multiplayer networking, raids, full economy, or all-class support in the first pass.
- Build the first slice before expanding the world.

## Source Authority Ladder

When sources disagree or a feature is unclear, use this order:

1. Primary canon archive: Complete Canon Compendium v1.1 and Complete Data Workbook v1.1.
2. Loot and reward worktables: Master loot data, tank loot workbook, DB patch rows, loot source tables, rarity config, and drop rules.
3. Focused content bibles: zone, dungeon, boss, public event, social, economy, endgame, progression, and conformance artifacts.
4. Discord/map playstyle and Codex handoff prompts: app shape, channel behavior, map-first play, and MVP guardrails.
5. Research and production notes: MMO design, UX, economy, progression, social behavior, reward cadence, and production-quality guidance.

Research papers can shape systems and polish. They cannot rename canon, invent permanent rewards, or override loot rows.

## Source-Driven Loot

Permanent gear must eventually point to a real source row.

If a reward does not have its final Master_Loot_DB item ID yet, it must be labeled as:

- `Prototype reward`
- `Staged source reward`

The player can still receive useful materials, reputation, source pity, quest progress, and session recap progress without a permanent gear drop.

The loot engine is the only runtime authority that may grant items. AI dialogue, map art, party chatter, and DM narration may describe a reward moment, but they may not create a permanent item row or bypass source law.

Classic-style mechanics such as Group Loot, Need/Greed/Pass, thresholds, boss tables, containers, and binding labels are system inspiration only. The compendium, complete data workbook, loot worktables, and source audits still decide what Bellspire rewards are allowed to exist.

## Audit Rule

Run the canon audit when source files or runtime loot data changes:

```powershell
npm.cmd run canon:audit
```

The audit must report zero hard violations before new permanent rewards are considered safe. Warnings can exist only for locked-preview content, not playable rewards.

The audit also indexes source-pack research references so future AI/social/world systems can use them as design guidance without treating them as canon loot or story rows.

Every runtime data file under `src/data` must be covered by `src/data/sourceGovernance.json`, unless it is a generated audit artifact. New JSON data without source governance is considered a hard violation.

## Canon Names

Core first-slice names:

- Saint Veyra
- Hearthmere Fields
- Road Shrine of Little Dawn
- Pilgrim Trial Cryptlet
- Shrinekeeper Olla
- The Bellgrave Warden
- Bulwark
- Shield Oath
- Guard Stance
- Frontline, Midline, Backline
- Pilgrimage of the First Bell

Launch classes:

- Bulwark
- Dawn Priest
- Arcanist
- Nightblade
- Ranger
- Oathwarden
- Hexbinder
- Wildheart
