# Loot Audit Skill

Use this skill whenever BellSpire adds rewards, gear, materials, caches, currencies, source pity, or drop behavior.

## Goal

No ghost loot. Rewards should feel exciting without breaking source law.

## Rules

- Permanent gear must be canonical, source-checked, staged, or prototype-labeled.
- Runtime items must include rarity, source status, source type/id, and relevant zone/dungeon/class tags.
- Materials, reputation, source pity, guild credit, quest progress, and social trust are valid rewards.
- Staged rewards must say they are staged.
- Prototype rewards must say they are prototypes.
- Do not add random gear directly from AI dialogue.

## Done Means

- `src/data/items.json` has full source metadata for changed items.
- Rewards are described honestly in feed text and recap.
- `npm.cmd run canon:audit` passes with zero hard violations.
