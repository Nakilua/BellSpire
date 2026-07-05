---
name: waxlight-iconography
description: Use when BellSpire needs a new creature, item, or system icon and the ask is for clean, professional iconography rather than a hand-drawn face/portrait. Sources curated CC-licensed glyphs from game-icons.net, strips them to raw paths, and recolors them into the Waxlight palette as medallion tokens. Do NOT use this for player/NPC faces — those are photos (import) or the Portrait Forge (scripts/forge-portrait.mjs), never generated art of a person.
---

# Waxlight Iconography

BellSpire's rule, learned the hard way: **portraits are for people, icons are for
everything else.** Generated character faces read as uncanny or scary very fast
(see git history: the first monster-lit portrait of the player). The fix that
actually worked was to stop drawing faces for anything that isn't a real person's
photo, and instead give creatures/items/systems clean vector iconography — the
same move real MMOs make (a bestiary of hundreds of unique, professional icons,
not painted portraits of every mob).

## When to use this skill

- Adding a new enemy, ability, item, or UI-system glyph that needs a distinct,
  recognizable icon.
- The existing lucide-react set (used for UI chrome — tabs, buttons, controls)
  doesn't have a good enough thematic match (weapons, skulls, bones, magic,
  armor — lucide is generic, game-icons.net is actually built for games).
- You want "a suite of custom icons" that still feels consistent, not
  one-off SVGs redrawn by hand each time.

## When NOT to use this skill

- Player or NPC **faces** — use `scripts/forge-portrait.mjs` (the Portrait
  Forge, procedural painted portraits) or let the player **Import** their own
  photo via the Hero tab. Never synthesize a face for a named person; it goes
  wrong (see history — reads as generated/uncanny/scary).
- Anything lucide already covers well (arrows, tabs, generic controls).

## The pipeline

1. **Find candidates** on https://game-icons.net (search by name) or browse
   the raw repo directly — every icon lives at:
   `https://raw.githubusercontent.com/game-icons/icons/master/<author>/<slug>.svg`
   Authors are `lorc`, `delapouite`, `caro-asercion`, `sbed`, `skoll`, etc.
   Probe with `curl -s -o /dev/null -w "%{http_code}"` on candidate URLs —
   404 means wrong slug, try synonyms (e.g. "hooded-figure" doesn't exist,
   but "haunting" and "spectre" do).

2. **Register + fetch.** Add `key: "author/slug"` entries to the `ICONS` map
   in `scripts/fetch-game-icons.mjs`, then run:
   ```
   node scripts/fetch-game-icons.mjs
   ```
   This fetches each SVG, strips the `512x512` background plate path, and
   regenerates `src/components/atlas/gameIcons.tsx` (a `GAME_ICON_PATHS`
   record + `<GameIcon icon="key" color="..." />` component) plus
   `src/assets/icons/ATTRIBUTION.md` (required — game-icons.net is CC BY 3.0,
   attribution must ship with the game).

3. **Recolor, don't redraw.** `GameIcon` renders the raw path filled with
   whatever `color` you pass — always a Waxlight token
   (`docs/UI_UX_GOALS.md`): wax gold for sealed/friendly, blood crimson for
   hostile/threat, ash for locked/inactive. Never leave icons in their
   original black-on-white.

4. **Mount as a medallion**, the established BellSpire pattern (see
   `Medallion` in `src/components/atlas/MapArt.tsx` and `Token` in
   `src/components/atlas/EncounterDiorama.tsx`): a dark disc (`#120c09`),
   a double ring (outer colored, inner faint), the icon centered at ~55-60%
   of the disc diameter. This is what makes a one-color glyph read as a
   professional game asset instead of a flat icon pasted on a background.

5. **Verify at real size.** Icons must read at the token's actual rendered
   size (diorama tokens ≈ 20-24px, map medallions ≈ 14-18px), not just at
   full-page zoom. Screenshot with Playwright (project pattern: scratchpad
   `shoot*.mjs` scripts) and look at the *cropped* element, not the whole
   page.

## Attribution requirement (non-negotiable)

game-icons.net icons are CC BY 3.0 — attribution is legally required.
`fetch-game-icons.mjs` auto-generates `src/assets/icons/ATTRIBUTION.md` from
the `ICONS` map; never delete or hand-edit that file's credit lines, and never
add an icon without letting the script regenerate attribution for it.
