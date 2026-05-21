# BellSpire Compendium And Workbook Update Queue

This document is the holding pen for new BellSpire rules, systems, and runtime decisions that should eventually be folded back into the canon compendium, the workbooks, or both.

The original v1.1 PDF and workbooks remain the source archives. This queue does not overwrite them. It records what the app has learned while becoming playable, then marks where each approved idea belongs in a future v1.2 canon pass.

## Update Law

- The v1.1 compendium and workbooks still outrank this queue.
- This queue is for approved additions, clarifications, and implementation law discovered while building the app.
- If a queue item conflicts with source truth, source truth wins and the queue item must be rewritten or rejected.
- Runtime data can prove what the app currently supports; it does not automatically create canon.
- AI Director output may suggest useful flavor, but it cannot add permanent canon or permanent loot.
- Workbooks should receive structured rows. The compendium should receive readable world/system law.

## Destination Rules

- Add to compendium when the change describes world law, design philosophy, faction behavior, region identity, narrative rules, or player-facing canon.
- Add to workbook when the change needs rows, ids, tags, tables, flags, weights, coordinates, item metadata, or auditable source fields.
- Add to both when the concept needs readable canon explanation and strict runtime data.
- Keep in repo docs only when the item is implementation process, QA procedure, or temporary build guidance.

## Priority Tags

- `P0`: Needed before source-law confidence.
- `P1`: Needed before the next major playable expansion.
- `P2`: Useful during the next polish pass.
- `P3`: Future-facing, not urgent.

## Queue Summary

| Item | Destination | Priority | Current Status |
| --- | --- | --- | --- |
| Solo-local living MMO identity | Compendium | P1 | App law exists, needs v1.2 narrative/system wording |
| AI Director authority limits | Both | P0 | Implemented as app law, needs source-facing approval |
| Classic-style loot law | Both | P0 | Implemented in docs/data/engine, needs workbook tables formalized |
| Binding labels | Workbook | P0 | Implemented in runtime config, needs source table |
| Loot tables and source ids | Workbook | P0 | First Road implemented, broader source rows missing |
| Source pity | Both | P1 | Implemented for First Road, needs exact future math/rules |
| Save export receipt | Repo docs | P2 | App QA feature, likely not canon |
| Map art authority rule | Compendium | P1 | App law exists, should be canon clarification |
| Map service markers | Workbook | P1 | Runtime/service data exists, needs v1.2 rows |
| Social memory model | Both | P1 | Partially implemented, needs formal contact/event rows |
| Guild contracts | Both | P1 | Design law exists, needs contract rows |
| First Road playable status | Compendium | P1 | Should be documented as first playable route |
| Next-area gap list | Workbook | P1 | Audit exists, needs expansion rows prioritized |
| Dungeon room plates | Workbook | P2 | Needed for deeper dungeon map pass |
| Launch class readiness | Workbook | P1 | Registry has classes, only Bulwark is playable |

## Compendium Update Candidates

### Solo-Local MMO Identity

BellSpire should be described as a solo-local living MMO illusion: one real player, with the app and AI Director simulating channels, party members, guild recruitment, NPCs, world texture, dungeon pressure, and social memory.

Reason to add:

- This is now core identity, not just UI flavor.
- It protects the project from fake multiplayer claims.
- It explains why the game can feel MMO-like without accounts or networking.

Recommended compendium wording:

> BellSpire is built to feel like a living MMO world around a single local player. Simulated players, guild chatter, party allies, and NPC routines are part of the world texture, but the game does not claim real multiplayer unless a real backend exists.

### AI Director Authority

The AI Director is a DM/social voice layer, not the source of truth.

Reason to add:

- It protects canon from model drift.
- It protects loot from invented rewards.
- It explains why the Director can narrate consequences but cannot grant unsourced items.

Compendium should define:

- The AI Director may speak as NPCs and simulated players.
- The AI Director may narrate atmosphere, tactical hints, social reactions, and cinematic beats.
- The AI Director may not rename canon, invent permanent loot, create fake systems, or override source data.

Workbook should define:

- Canon packet ids.
- Allowed topic tags.
- Source note requirements.
- Scene type routing rules.
- Optional model route hint: local, live, cinematic.

### Classic-Style Loot Philosophy

BellSpire now has a Classic-inspired loot identity: dungeon tables, source identity, group rolls, rarity excitement, and social texture.

Reason to add:

- Loot is now a major system pillar.
- The game explicitly avoids personal loot for the current party simulation style.
- The rules need to be canon-safe and workbook-auditable.

Compendium should define:

- Bosses and dungeons have memorable loot identities.
- Default party style is Group Loot.
- Default roll threshold is Uncommon.
- Need beats Greed, Greed beats Pass.
- AI may narrate loot, but the loot engine grants it.

Workbook should define:

- Rarity config rows.
- Binding config rows.
- Loot source rows.
- Loot table rows.
- Drop type rows.
- Roll eligibility rows.
- Source pity rows.

### Map Art Authority

Map art supports play, but does not create canon by itself.

Reason to add:

- BellSpire uses generated/hand-drawn atlas assets.
- Visual labels can help players, but source notes and runtime data own truth.
- This prevents accidental canon from painted details.

Compendium should define:

- Maps are playable atlas aids.
- Permanent shop/vendor/POI names require source support.
- Generic service clusters may exist only when labeled as function-first and source-noted.

Workbook should define:

- Marker id.
- Map id.
- Label.
- Kind.
- Coordinates.
- Availability status.
- Source note.
- Canon/staged status.

### First Road Playable Status

The v1.2 source package should formally mark the first playable slice:

1. Saint Veyra Capital.
2. Hearthmere Fields.
3. Road Shrine of Little Dawn.
4. Pilgrim Trial Cryptlet.

Playable class:

- Bulwark.

Reason to add:

- The app has a clear tutorial route now.
- Future source work should know what is playable, preview, or missing.

## Workbook Update Candidates

### Rarity Config Table

Needed fields:

- `rarityId`
- `displayName`
- `rank`
- `color`
- `designMeaning`
- `auditWeight`
- `isPermanentGearAllowed`
- `requiresSourceRow`

Current runtime file:

- `src/data/rarityConfig.json`

### Binding Rules Table

Needed fields:

- `bindingId`
- `displayName`
- `meaning`
- `gearAllowed`
- `questOnly`
- `stagedOnly`
- `tooltipText`

Current runtime file:

- `src/data/bindingRules.json`

### Loot Sources Table

Needed fields:

- `sourceId`
- `sourceType`
- `zoneId`
- `dungeonId`
- `encounterId`
- `sourceStatus`
- `playableStatus`
- `sourceNote`
- `allowedRewardTypes`
- `previewLocked`

Current runtime file:

- `src/data/lootSources.json`

### Loot Tables Table

Needed fields:

- `tableId`
- `sourceId`
- `entryId`
- `itemId`
- `entryType`
- `rarityId`
- `bindingId`
- `weight`
- `chance`
- `quantityMin`
- `quantityMax`
- `oncePerClear`
- `repeatClear`
- `questRequired`
- `pityEligible`
- `classTags`
- `zoneTags`
- `dungeonTags`
- `sourceStatus`
- `blockedReason`

Current runtime file:

- `src/data/lootTables.json`

### Item Tooltip Fields

Needed fields for permanent gear and meaningful rewards:

- `itemId`
- `displayName`
- `itemType`
- `slot`
- `rarityId`
- `bindingId`
- `itemLevel`
- `sourceId`
- `sourceStatus`
- `classTags`
- `zoneTags`
- `dungeonTags`
- `flavor`
- `prototypeLabel`
- `stagedLabel`

### Source Pity Fields

Needed fields:

- `pityId`
- `sourceId`
- `eligibleClearType`
- `pityIncrement`
- `pityCap`
- `allowedPityRewards`
- `canGrantGear`
- `canGrantMaterials`
- `canGrantCurrency`
- `notes`

Important rule:

- Source pity cannot create unsourced permanent gear.

### Social Memory Fields

Needed fields:

- `contactId`
- `displayName`
- `role`
- `personalityTags`
- `availability`
- `trustBand`
- `memoryEventType`
- `memoryReason`
- `lastSeenLocation`
- `reactionHooks`

### Guild Contract Fields

Needed fields:

- `contractId`
- `guildId`
- `title`
- `locationId`
- `objectiveType`
- `requiredFlags`
- `progressFlags`
- `completionFlags`
- `rewardTypes`
- `sourceNote`
- `playableStatus`

### Atlas And Service Marker Fields

Needed fields:

- `markerId`
- `mapId`
- `label`
- `kind`
- `x`
- `y`
- `summary`
- `availability`
- `sourceNote`
- `canonStatus`

### Dungeon Room Plate Fields

Needed fields:

- `roomId`
- `dungeonId`
- `displayName`
- `roomPurpose`
- `lesson`
- `connectedRooms`
- `encounterId`
- `lootSourceId`
- `mapAssetId`
- `exitRules`
- `sourceNote`

## Not Ready For Source Promotion Yet

These are useful app ideas, but should stay in repo docs until they mature:

- Exact AI spend limits and budget UX.
- Exact browser QA fixture names.
- Exact save receipt checksum UI.
- Temporary staged item names unless source rows approve them.
- Any map detail that appears only in generated art and not in data.
- Any simulated player name or shop name created for testing only.

## Immediate v1.2 Source Work Recommendation

Before editing the PDF or workbooks directly, create a v1.2 source patch package with:

1. Compendium addendum: solo-local MMO identity, AI Director law, Classic-style loot philosophy, map authority, First Road playable status.
2. Workbook sheet additions: rarity config, binding rules, loot sources, loot tables, source pity, map markers, social contacts, guild contracts, dungeon rooms.
3. Gap review: mark every source zone/dungeon/class as `playable`, `preview`, `planned`, or `not started`.
4. Approval pass: compare every new row against the v1.1 PDF/workbooks before calling it canon.

## Current Decision

Do not rewrite the original compendium/workbooks yet. Keep this queue updated as the app evolves, then fold approved items into a clean v1.2 source release when the First Road loot and social systems are stable.
