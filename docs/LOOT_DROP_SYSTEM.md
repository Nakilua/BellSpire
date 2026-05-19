# BellSpire Loot Drop System

BellSpire loot follows one simple law:

Source first. Rarity second. Vibes third.

In plain English: the game checks whether a reward is allowed before it checks how exciting the reward is. No ghost loot gets quietly slipped into the world.

## What Works Today

The current playable MVP uses a fixed reward cache for the Pilgrim Trial Cryptlet.

It does not yet roll a full random loot table every time an enemy dies. That is intentional. The first slice proves the reward flow safely before we let the haunted spreadsheet machinery start throwing dice.

The current reward path is:

1. Start with `Road-Iron Rations x2` from the Saint Veyra starter kit.
2. Enter the Pilgrim Trial Cryptlet.
3. Clear the dungeon rooms in order.
4. Defeat the Bellgrave Warden.
5. Reach the Road-Seal Exit.
6. Use `loot`.
7. The app grants the first-dungeon reward cache once.

The current Cryptlet cache grants:

- `Pilgrim Wax x2`
- `Bone Fragment x2`
- `Bell Sliver x1` only if the Broken Bell Niche was stabilized
- `Road-Seal Buckler x1`
- `Bellspire Concord +25`
- `Roadwardens +10`
- `Pilgrimage of the First Bell source pity +1`

The `Road-Seal Buckler` is explicitly labeled:

```text
Staged source reward - final Master_Loot_DB item ID pending
```

That label matters. It means the item is allowed for prototype play, but it is not pretending to be fully finalized permanent canon loot yet.

## What The Current Code Does Not Do Yet

The current build does not yet support:

- Enemy-by-enemy trash drops
- Random roll results after every encounter
- Personal loot rolls
- Need/greed/pass
- Duplicate protection beyond source pity tracking
- Boss-specific gear pools beyond the fixed MVP reward cache
- Full class-by-class loot filtering
- Full profession-crafted output rolls

So if you ask, "Did the Bellgrave Warden randomly drop this shield?" the honest current answer is:

No. The Warden unlocks a source-governed reward cache. The cache gives the staged Bulwark shield because the MVP needs a readable first victory reward.

## Workbook Drop Rules

The loot workbook already gives us the rule families for future drop behavior.

The current extracted source rows include these drop-rule families:

| Source Type | Common | Uncommon | Rare | Epic | Mythic | Legendary | Artifact |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Zone Trash | 55 | 30 | 12 | 2.5 | 0.45 | 0.05 | 0 |
| Zone Named | 0 | 45 | 40 | 12 | 2.5 | 0.5 | 0 |
| Dungeon Boss | 0 | 5 | 65 | 30 | 4.5 | 0.5 | 0 |
| Raid Boss | 0 | 0 | 0 | 70 | 25 | 4.5 | 0.5 |
| Profession Craft | 0 | 45 | 35 | 15 | 4.5 | 0.5 | 0 |

These rows come from the tank loot workbook's `Drop_Rules` sheet. Before turning them into code, we should treat them as source weights/rules and validate how each row is meant to be rolled. Some rows may represent weighted reward bands instead of one direct single-roll percentage table.

The rarity config also defines these rarity tiers:

- Common
- Uncommon
- Rare
- Epic
- Mythic
- Legendary
- Artifact

## Planned Drop Engine

When we upgrade from the fixed cache to real drops, the flow should be:

1. Identify the reward source.

Examples:

- Zone trash enemy
- Named overworld enemy
- Dungeon boss
- Raid boss
- Profession craft
- Quest reward
- Object bonus

2. Build the legal item pool.

The item pool must match the source:

- source type
- source id
- zone id
- dungeon id
- class tags
- rarity
- source status

3. Remove illegal rewards.

The engine must reject:

- missing rarity
- missing source status
- permanent gear without source proof
- wrong zone/dungeon/source
- wrong class or armor role
- unlabeled prototype rewards
- unlabeled staged rewards

4. Roll or choose the reward result.

Depending on the reward type, the game may:

- grant guaranteed materials
- roll a rarity band
- roll an item inside that rarity band
- grant source pity if no gear drops
- upgrade a pity result after enough clears
- add reputation, guild credit, or quest progress

5. Explain the result to the player.

The feed should show:

- what dropped
- why it was eligible
- its rarity
- whether it is canonical, staged, or prototype
- source pity gained or spent

## Source Pity

Source pity is progress toward a source family.

For the MVP, the tracked source is:

```text
Pilgrimage of the First Bell
```

Each Cryptlet completion gives:

```text
Pilgrimage of the First Bell +1
```

Future use:

- Track repeated clears.
- Reduce frustration when gear does not drop.
- Let source-governed vendors, reliquaries, or quest turn-ins recognize effort.
- Avoid inventing unsourced consolation gear.

## Reward States

Every reward should fit one of these states:

| State | Meaning |
| --- | --- |
| Canonical source row | Fully supported by source data. |
| Source checked | Verified against source material but may be curated for runtime. |
| Staged source reward | Allowed for play, final item row or ID still pending. |
| Prototype reward | Temporary MVP reward, clearly labeled. |

Permanent gear should move toward canonical/source-checked status over time.

## Current Implementation Files

- `src/game/loot.ts` grants the current Cryptlet reward cache.
- `src/game/commands.ts` decides when `loot` is allowed.
- `src/data/items.json` stores the current runtime item rows.
- `src/data/canonRegistry.json` contains extracted workbook rarity and drop-rule rows.
- `src/data/sourceGovernance.json` records why runtime item data is allowed.
- `scripts/build-canon-registry.mjs` audits source governance and loot safety.

## Non-Negotiable Rule

If the game cannot explain where a permanent item came from, the item does not enter the game as permanent loot.

It can become a clearly marked prototype or staged reward, but it cannot sneak in wearing a fake crown.
