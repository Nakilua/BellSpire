# BellSpire UI/UX Revamp Goals

BellSpire should feel like a gothic MMO atlas client: readable as a game, rich as a hand-drawn field journal, and strict about source law.

## Current Revamp Target

- `/login` and `/` should share the same visual language: parchment, ink, wax seals, bronze trim, shrine light, and dark cathedral glass.
- Maps should be usable, not just decorative. The current generated bitmap maps are the base art layer, while readable labels, pins, and legends are source-governed UI.
- Major canon landmarks and districts may appear as painted map labels. Shops, services, trainers, inns, boards, and vendors should be data-driven markers unless a source gives an exact name.
- Pins should match the map art: ink marks, wax seals, brass tacks, hand-lettered tags, and parchment flags. Avoid modern floating app-icon badges.
- A cartographer detail layer should expose sourced labels from `src/data/mapAnnotations.json`: sparse in normal view, denser inside expanded Atlas View.
- Dungeon maps should show room order, active room, lesson, object, checkpoint/route meaning, and boss/optional branches clearly.

## Source Law For Map Details

- Use exact names when the compendium or workbook provides them.
- Use generic service clusters when the source proves the function but not a named shop, such as `Training`, `Crafting`, or `Field Supplies`.
- Do not invent permanent shop, inn, vendor, NPC, loot, or district names.
- Every map marker must keep a source note.
- Every map annotation must keep a source note.
- Map images are visual aids, not independent canon authority.

## Acceptance Goals

- Saint Veyra city view exposes the core districts from the compendium: Concord Hall, First Bell Plaza, Oath-Iron Yard, Censer Row, Blackglass Arcade, Bellgrave Steps, Market of Seven Lanterns, Low Bells, and Pilgrim Gate.
- Hearthmere/Little Dawn view exposes field rest, road rumors, field supplies, wax beds, shrine rest, Olla/shrine interaction, and the Cryptlet stair without fake shop names.
- Pilgrim Trial Cryptlet view exposes the full training route: Shrine Descent, Hall of Threaded Names, Broken Bell Niche, Pilgrim Bone Walk, Candleless Alcove, Warden Chamber, and Road-Seal Exit.
- The right-side map tab feels like an in-world atlas/journal surface.
- The expanded Atlas View is usable on desktop and still readable on mobile.
- Atlas View reveals richer hand-lettered notes without forcing clutter into the normal right-panel map.
- The command bar, quest cards, inventory, feed messages, and tabs keep moving toward the same atlas material style.
- A future bitmap map repaint pass should add more painted city, shop, inn, district, shrine, route, and dungeon detail without using the image itself as canon authority.

## Not Yet

- No full economy UI.
- No permanent vendor inventories.
- No new loot-drop rules in this UI pass.
- No fake multiplayer backend claims.
- No all-zone playable map expansion beyond locked previews.
