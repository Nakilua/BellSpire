# BellSpire Map Revamp Art Brief

BellSpire maps should look like source-governed gothic atlas plates: hand-drawn, inked, parchment-worn, dense with useful detail, and still readable as game maps.

## Current Issue

The current bitmap maps are moving in the right direction, but the overlay pins can feel too modern if they read like app icons. The map UI should feel native to the art: wax seals, brass tacks, ink stamps, and small hand-lettered cartographer tags.

## Pin Law

- Pins are UI, not canon by themselves.
- Marker text must come from `src/data/mapServices.json` and keep a `sourceNote`.
- Cartographer labels must come from `src/data/mapAnnotations.json` and keep a `sourceNote`.
- If the compendium proves a function but not an exact shop name, use a generic label like `Training`, `Crafting`, `Field Supplies`, or `Guild Board`.
- Do not invent permanent shop, inn, vendor, NPC, or loot names to make a map prettier.
- In-map labels should stay sparse; detail belongs in hover/selection panels and legends.

## Cartographer Detail Layer

- The bitmap map is the visual plate.
- `src/data/mapAnnotations.json` is the readable detail layer for districts, roads, shrine thresholds, dungeon rooms, and source-safe service clusters.
- Normal map mode should show only the most important labels.
- Expanded Atlas View may show denser labels and short notes.
- The detail layer can be revised safely without regenerating the bitmap art, but future bitmap repaint passes should visually support the same source-governed labels.

## Bitmap Map Revamp Targets

### Saint Veyra City

- Add more city density around the Cathedral of the First Bell.
- Make district identities visible: Concord Hall, First Bell Plaza, Oath-Iron Yard, Censer Row, Blackglass Arcade, Bellgrave Steps, Market of Seven Lanterns, Low Bells, and Pilgrim Gate.
- Show service clusters as visual districts rather than fake named stores.
- Add small signs, awnings, courtyards, bell ropes, watch posts, guild-table traffic, and pilgrim route cues.

### Hearthmere / Little Dawn

- Add more readable field roads, low walls, wax beds, field rest points, roadside warning posts, shrine steps, and the Cryptlet stair.
- Keep Hearthmere humble and lived-in: practical farms, supply points, road repairs, field workers, shrine traffic.
- Make the route to Little Dawn legible at a glance.

### Pilgrim Trial Cryptlet

- Dungeons need more visible room purpose.
- Shrine Descent should clearly read as entry/oath space.
- Hall of Threaded Names should show hanging name-tags.
- Broken Bell Niche should show the cracked bell and wax channel.
- Pilgrim Bone Walk should show lane pressure.
- Candleless Alcove should look optional and strange.
- Warden Chamber should make the Road-Seal Bell and boss arena readable.
- Road-Seal Exit should feel like the reward/report threshold.

## Acceptance Bar

- The map should be beautiful when viewed without pins.
- The map should still be usable when pins are hidden.
- Pins should feel painted onto or physically attached to the map.
- Expanded Atlas View should make small details inspectable.
- Mobile view can simplify labels, but it must keep tap targets usable.
- Detail labels should feel hand-lettered into the atlas rather than like modern app labels.
