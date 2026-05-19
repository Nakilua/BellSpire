# Bellspire Map Topography Audit

Generated on 2026-05-19 from the compendium/workbook reading pass.

## Honest Map Status

The current app originally had a simple node map for the first playable path. That was useful for proving travel, but it did not show the larger Bellspire world shape described in the source bundle.

This pass adds a curated region-topography layer for the app. It is a schematic map, not final cartography. Coordinates are approximate UI positions so the world can be navigated visually while the canon is still being turned into structured data.

## Source Signals Used

- The handoff prompt locks the core region names: Saint Veyra, Hearthmere Fields, Pilgrim Trial Cryptlet, Briarwatch Glen, Thornhouse, Bellscar, Saltbroken, Argentwood, Chapel, Duskfen, Crypt, Veyrholm, Abbey, Nocturne, Sanguine, Bloodglass, Castle Veyr, Mooncrypt, Cathedral of the First Bell.
- The Discord/map prompt defines map behavior: world maps show regions, zone maps show node networks, dungeon maps show room order, and combat maps show lanes.
- The UX/HUD material says map layers should eventually support quests, events, dungeons, vendors/services, gathering nodes, rare spawn hints, guild contracts, faction control, travel routes, danger level, and profession stations.
- The complete workbook marks Saint Veyra as social/crafting/guild/training/world-boss/faction-envoy foundation.
- The complete workbook and v1.1 expansion rows describe Nocturne Vale as a vampire court space with Red Wax Embassy, Velvet Vineyard Rows, Guestless Inn, social stealth, Guest Right, and Sanguine Court.
- The Bellscar workbook describes Bellscar Coast through storm-coast warfare: cracked bell towers, shipwreck chapels, militia defense, Saltbroken, road safety, guild contracts, cracked bronze, drowned banners, and Bell Tower Siege.
- The Brackenholt/Thornhouse workbook describes Briarwatch/Thornhouse through old roads, Hollow Bell Watch, road repair, House Brackenholt pressure, hounds, traps, and road stabilization.
- The Saltbroken bible includes the text map: Causeway -> Clamp Yard -> Broken Bronze Smelter -> Clamp Foundry -> Flooded Banner Hall -> Salvage.

## Curated Runtime Data

The app now stores its schematic world map in:

`src/data/regionTopography.json`

Each region entry tracks:

- name
- level range
- terrain type
- topography summary
- danger state
- services
- landmarks
- guild hooks
- rough schematic coordinates
- route connections
- source note

## What Is Still Not Final

- Exact geographic distances are not final.
- Region shapes are schematic, not hand-drawn atlas art.
- Layer toggles are first-pass UI only.
- Locked regions are preview entries until their runtime data is curated.
- Duskfen, Veyrholm, Mooncrypt, Cathedral, and Bellgrave Below need a deeper dedicated pass before final POI placement.

## Next Better Map Pass

1. Add actual layer toggles for quests, vendors, dungeons, guild contracts, danger, and faction control.
2. Add zone-specific topographic maps for Hearthmere, Bellscar, Briarwatch, and Nocturne.
3. Add route-state changes, such as Road Safety, Siege Heat, Court Debt, and Dungeon Pressure.
4. Add map pings from the Activity Board.
5. Add social/group-finder markers where the source says group finder or guild contracts should surface.
