# Source Governance Skill

Use this skill whenever BellSpire content is added or changed.

## Goal

Every playable fact must have a source position. The app may curate and summarize, but it must not silently invent canon.

## Rules

- Check the source authority ladder before changing canon content.
- Use compendium and complete workbook facts first.
- Use loot worktables for item and reward truth.
- Use focused bibles for zone, dungeon, event, boss, economy, social, and progression specifics.
- Use research papers for system design only.
- Add or update `src/data/sourceGovernance.json` when adding runtime JSON files.
- Keep locked-preview content clearly locked until the app supports it.

## Done Means

- The new content has source tier, source status, and source references where required.
- `npm.cmd run canon:audit` reports zero hard violations.
- The player-facing UI does not imply unsupported content is fully playable.
