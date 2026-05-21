# BellSpire Save Migration Plan

BellSpire currently saves as `saveVersion: 1`. We are not migrating yet because the new First Road state still fits safely inside the existing shape.

## Future `saveVersion: 2` Triggers

- The save needs renamed top-level fields.
- The social ledger or guild contracts need a breaking data shape.
- The AI Director starts storing larger structured memory.
- Map/deep-zoom state becomes player-editable.
- Inventory or loot rules move from simple item rows into full drop history.

## Migration Rule

When version 2 is needed, add a migration function that reads version 1, fills missing fields, preserves player progress, and never throws away exported saves without a clear warning.

## Current Fixture States

Developer fixture descriptors live in `src/data/saveFixtures.json`:

- `new-character`
- `at-shrine`
- `in-cryptlet`
- `post-clear`

They are for smoke testing only. They do not create canon, loot, vendors, or live multiplayer claims.
