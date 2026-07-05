# BellSpire Grand Vision

A genuine goal for every section of the game, so each session pushes toward the
same epic instead of ad-hoc polish. Each section: a North Star, then Now → Next →
Epic, then the boundary that keeps it honest.

---

## 1. Identity & Art

**North Star:** every visible thing in BellSpire is drawn *for* BellSpire — a
player should never see a stock asset and feel the fiction crack.

- **Now:** Waxlight design language (docs/UI_UX_GOALS.md); medallion cartography;
  the Bestiary begins with the six Cryptlet enemies as hand-crafted portraits.
- **Next:** bespoke portraits for every creature and NPC on the First Road; custom
  class crests (Bulwark first); ability and item art replacing lucide in the
  inventory and hotbar. lucide remains the *UI utility* set (arrows, tabs, tools) —
  bespoke art owns everything that exists inside the world.
- **Epic:** a complete BellSpire iconographic library — creatures, classes,
  abilities, items, factions, zones — versioned like the canon registry, every
  piece screenshot-audited at real render size.
- **Boundary:** silhouette-first, one light story, no outline-only doodles, no
  wobble on icons. If it doesn't read at 40px, it isn't done.

## 2. World & Cartography

**North Star:** the atlas is a living in-fiction document — "as kept by the
Roadwardens" — that grows more precious as the world opens.

- **Now:** living SVG world/zone/dungeon plates with medallions, player position,
  and live travelers.
- **Next:** hand plates for Briarwatch Glen and Bellscar Coast before they unlock;
  medallion hover-cartouches (services, danger, guild hooks); atlas deep-zoom
  plates in the living style.
- **Epic:** seasonal and event states drawn into the maps (siege lines at
  Bellscar, rot spreading in Briarwatch), so the atlas itself tells the campaign's
  history.
- **Boundary:** source-governed placement forever; art may dramatize, data decides.

## 3. Combat & the Diorama

**North Star:** the Bellgrave Diorama becomes the DM's miniatures table made
real — every mechanic visible, every telegraph readable at a glance.

- **Now:** isometric stage, lane telegraphs, health arcs, guard ring, the
  Road-Seal Bell.
- **Next:** Bestiary portraits as tokens; hit/heal resolution flashes; boss stage
  dressing (the Warden darkens the vault); object interactions staged (wax
  channel, thread tags).
- **Epic:** party members as tokens beside you (live players from the realm),
  per-dungeon stage sets, and wipe/clear cinematics in pure SVG motion.
- **Boundary:** the diorama is a pure view. It never owns a rule, never rolls a
  die, and always respects prefers-reduced-motion.

## 4. Campaign & Narrative

**North Star:** one long pilgrimage — from the First Road to the Cathedral of the
First Bell — told in rings, each ring complete before the next opens.

- **Now:** the First Road (Saint Veyra → Hearthmere → Little Dawn → Cryptlet),
  narrative arcs and beats source-governed.
- **Next:** choose the second ring (Briarwatch Glen/Thornhouse or Bellscar Coast
  siege); give it a full loop: zone, quests, dungeon, social hooks, map plate,
  bestiary entries, loot rules.
- **Epic:** the Bellgrave Below / Cathedral of the First Bell arc — the campaign's
  answer to why bells ring inward — as a multi-zone finale with the Director
  conducting.
- **Boundary:** no unsourced canon. New rings require map, quests, loot rules, and
  acceptance notes before being declared playable (docs/ROADMAP.md law).

## 5. The Living World

**North Star:** the world remembers you and moves without you — NPCs with
schedules and grudges, a population that never feels like cardboard.

- **Now:** NPC memory events, trust, schedules, ambient channel rotation, activity
  rhythms.
- **Next:** memory-driven dialogue variation (Olla greets a Cryptlet-clearer
  differently); simulated players with persistent arcs (Renn levels too).
- **Epic:** a world tick that runs between sessions — return after days to find
  contracts completed, roads changed, and letters waiting.
- **Boundary:** simulated people are honest backfill, always labeled, never
  claimed live.

## 6. Multiplayer & the Realm

**North Star:** BellSpire becomes truthfully multiplayer in rings, per
docs/MMO_EVOLUTION_PLAN.md — never faking it, never breaking solo play.

- **Now:** realm server with presence and zone/global chat; live players on the
  map and in `who`.
- **Next:** party sync — invite a real player, see their token on the diorama,
  clear the Cryptlet together with server-refereed need/greed.
- **Epic:** the authoritative realm: accounts, server-side world flags, instanced
  dungeons, the sim population yielding gracefully to real pilgrims.
- **Boundary:** the server never invents rewards; loot legality moves server-side
  before shared loot exists. Solo/local play remains first-class forever.

## 7. Loot & Economy

**North Star:** every item is a sourced artifact — rarity you can feel, provenance
you can audit, no ghost loot unto the last bell.

- **Now:** source-governed tables, gothic rarity ramp, need/greed/pass, pity
  tracking, loot audits in CI-able scripts.
- **Next:** bespoke item art for the Cryptlet reward table; item cartouches
  (hover a Bell Sliver, read its provenance like a museum plate).
- **Epic:** professions and the wax-and-bone economy — gathering hooks that exist
  in zones today become crafting that respects source law.
- **Boundary:** `loot:audit` green forever; no reward exists without a source row.

## 8. Craft & Tooling

**North Star:** the pipeline that made this possible stays sharp — every visual
change screenshot-verified, every logic change replay-verified.

- **Now:** headless First Road replay (determinism gate), realm smoke test,
  Playwright screenshot sweeps at real panel sizes.
- **Next:** consolidate index.css into a single ordered Waxlight sheet (the known
  debt); a `bestiary:audit` that renders every portrait at 40px and diffs.
- **Epic:** a full acceptance suite — replay + realm + visual snapshots — run
  before any ring ships.
- **Boundary:** nothing ships unseen. If it wasn't screenshotted or replayed, it
  isn't done.
