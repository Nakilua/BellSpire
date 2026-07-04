# BellSpire UI/UX Goals — the Waxlight Design Language

Waxlight is BellSpire's own interface language. It exists so every future UI change
has a standard to be measured against, instead of drifting toward generic dark-theme
defaults. The target feeling: a real MMO client built by a cathedral mason — clean,
engraved, deliberate, quietly alive.

## The Four Pillars

### 1. Cut Stone
The signature shape language is the **chamfered corner** — a 45° notch, as if every
panel and button were cut from stone. No rounded rectangles anywhere in the app.
Chamfers come in two sizes only: `--chamfer-sm` (buttons, chips, tabs) and
`--chamfer-lg` (panels, cards, dialogs).

### 2. Waxlight
Gold (`--bell-wax`) means **live**. It is reserved for the player, active states,
open roads, the current room, focus rings, and flicker dots. Gold is never
decorative filler; if everything glows, nothing does. Locked, inactive, and ambient
things live in ash and fog tones.

### 3. Vellum
Two material worlds, never mixed:
- **Vellum surfaces** (warm parchment-dark, subtle grain): places where the *world*
  speaks — the narrative feed, the maps, cartouches, scene panels.
- **Void surfaces** (cold near-black): places where the *client* speaks — rails,
  headers, tab decks, settings.

### 4. Ordinance
Strict scales, few options:
- **Strokes**: 3 weights only — hairline (borders), regular (icons/dividers),
  emphasis (active edges).
- **Type**: Cinzel for display/labels, EB Garamond for story text, Inter for UI
  copy, monospace for command echoes. Four sizes per family, no more.
- **Spacing**: one 4px unit; gaps are multiples of it.
- **Icons**: lucide only, at two sizes (13px inline, 16px controls). Never
  hand-drawn UI icons.

## What "professional" means here

- **Silhouette first**: icons and markers are solid, geometric, and readable at
  their real rendered size — not thin outline sketches.
- **Weight hierarchy**: importance is communicated by size and stroke emphasis, not
  by adding more detail.
- **Organic roughness is terrain-only**: displacement/wobble filters may touch
  coastlines, contours, and river banks — never icons, badges, text, or UI chrome.
- **Restraint**: fewer marks, drawn precisely, beat many marks drawn loosely.

## Map cartography rules

- Landmarks and regions are marked with **medallions**: a dark disc, double gold
  ring, and a centered lucide icon. Size states: capital > open site > locked site.
  Locked medallions are dimmed ash with no glow.
- Roads are wax-dashed when open, ash-dotted when locked or rumored.
- Every map plate carries the ornate double frame, corner quatrefoils, and a titled
  cartouche written in-fiction ("as kept by the Roadwardens").
- The maps are living documents: the player's position pulses, the active dungeon
  room glows, live realm players appear by name.

## Hard don'ts

- No wobble/displacement filters on icons, badges, or text.
- No rounded corners.
- No rainbow accent colors; the palette is wax, blood, oath-teal, violet, ash, bone.
- No gold on things that are not live or interactive.
- No new icon families; lucide only.
- No UI element that pretends simulated players are real; live players are always
  labeled.
