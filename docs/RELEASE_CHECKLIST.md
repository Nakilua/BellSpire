# BellSpire Release Checklist

Use this before every serious PR.

## Source Law

- New runtime data is covered in `src/data/sourceGovernance.json`.
- No permanent shop, vendor, NPC, item, class, dungeon, or reward canon is invented.
- Map art is treated as visual support, not canon authority.
- Loot is canonical, source-checked, staged, or prototype-labeled.

## Local Checks

```powershell
npm.cmd run build
npm.cmd run canon:audit
npm.cmd run loot:audit
npm.cmd run fixtures:audit
npm.cmd run assets:audit
npm.cmd audit --json
```

Run a secret scan excluding `.env.local`, `.git`, `node_modules`, `dist`, screenshots, and logs.

## Browser Smoke

- `/login` creates or continues a Bulwark.
- First Road route works: Saint Veyra -> Hearthmere -> Little Dawn -> Cryptlet.
- Party, guild, world pulse, activity board, map, inventory, recap, and save tools still work.
- AI bridge online and offline both keep the game playable.

## Visual QA

- Desktop around 1440px.
- Tablet around 768px.
- Mobile around 390px.
- Command bar remains reachable.
- Atlas View, Social Ledger, Guild Board, Activity Board, and reward moments remain readable.

## Save / Fixtures

- `saveVersion: 1` still imports and exports.
- Fixture descriptors in `src/data/saveFixtures.json` still pass audit.
- Future migration notes stay in `docs/SAVE_MIGRATION_PLAN.md` until version 2 is actually needed.

## Git Safety

- `.env.local` is not staged.
- `dist`, logs, screenshots, and generated scratch output are not staged.
- PR body says what was tested and what remains intentionally unfinished.
