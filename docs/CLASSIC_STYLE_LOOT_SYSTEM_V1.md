# BellSpire Classic-Style Loot System v1

BellSpire uses Classic-style loot structure without copying World of Warcraft item data.

The feeling we want is old-school MMO loot: bosses have identity, dungeons have memorable tables, common materials still matter, rare drops are exciting, and party rolls create social texture. The law underneath is BellSpire's own source governance: compendium and workbooks first, loot worktables second, research and Classic inspiration only as system guidance.

## Core Rules

- BellSpire does not use personal loot.
- Default party loot is Group Loot.
- Default loot threshold is Uncommon.
- Need beats Greed; Greed beats Pass.
- Permanent gear must have rarity, binding, source type/id, zone or dungeon context, class tags, and source status.
- AI Director may describe a reward moment, but only the loot engine grants items.
- First Road is the only playable loot loop in v1.
- Future-zone sources can be indexed as preview-locked, but cannot drop in First Road.

## Binding Language

BellSpire uses its own terms for Classic-style binding:

- Tradable: no binding; safe for materials and low-risk supplies.
- Oathbound on Pickup: BoP-style; awarded directly to the character.
- Oathbound on Equip: BoE-style; prepared for later economy/trade simulation.
- Quest-bound: quest-state item only.
- Staged-bound: prototype or staged reward waiting for final source approval.

Road-Seal Buckler remains `Staged-bound` because it is useful for the prototype but still awaits final Master_Loot_DB ownership approval.

## First Road Tables

The playable v1 tables are:

- Bellgrave Warden boss table.
- Road-Seal Cache first-clear table.
- Broken Bell Niche object-bonus table.
- Cryptlet trash/material repeat table.
- Lost Satchel container table, currently no-drop only.
- Pilgrimage completion state table.

The first Cryptlet clear remains mostly deterministic because the tutorial should teach source law and party rolling before it teaches farming. The cache grants materials and reputation, then the staged shield appears as a Need/Greed/Pass roll.

## Source Pity

Source pity is BellSpire's mercy layer. It is not modern personal-loot protection.

Source pity can:

- record progress after eligible clears
- grant extra materials or currency in later tables
- improve approved staged/eligible tables later

Source pity cannot:

- create unsourced permanent gear
- bypass rarity/source audits
- let AI invent item grants

## Source Conflict Rule

If this system conflicts with the compendium, complete data workbook, loot worktables, or source audits, source truth wins. The implementation should change, document the conflict, or keep the reward staged/prototype until the missing source row is approved.

