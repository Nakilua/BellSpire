# BellSpire Browser Smoke Fixtures

Use `src/data/saveFixtures.json` as the repeatable route list for manual or automated browser checks.

## Fixture Flow

1. Open `/login`.
2. Create or continue a Bulwark.
3. Run the commands listed in the fixture.
4. Check the visible panels tied to that state.

## Required Fixture Checks

- `new-character`: login, first feed line, First Road checklist, Activity Board.
- `at-shrine`: Road Shrine map, Olla availability, talk prompt, guild/social panels.
- `in-cryptlet`: dungeon room plate, party readiness, combat/action bar, dungeon Atlas View.
- `post-clear`: reward/recap path once combat automation is expanded.

Run `npm.cmd run fixtures:audit` to confirm the fixture descriptors still use supported commands.
