# BellSpire UI/UX Plan — applying Waxlight

Phased plan for bringing the whole client up to the Waxlight standard defined in
`UI_UX_GOALS.md`. Each phase leaves the app shippable.

## Phase 1: Map iconography (medallions)

- Add a `Medallion` component to `src/components/atlas/MapArt.tsx`: dark disc,
  double gold ring, centered lucide icon, three size states (capital / open /
  locked), waxlight halo on the current zone.
- Replace all hand-drawn outline glyphs on the world plate with medallions.
- Remove the rough-ink displacement filter from every icon, road, and structure
  group; keep organic roughness only on landmass, coastline, river, and contours.
- Redraw Saint Veyra with computed geometry: even tower spacing on the wall,
  uniform street weights, axis-aligned district blocks, Bell medallion at the
  cathedral close.
- POI medallions on zone plates (Bell / Tent / Flame / DoorClosed), engraved labels
  below; hide the old HTML dot markers.
- Dungeon plate: keep the stone chambers; sharpen (no wobble); lucide Skull for the
  Warden chamber and Bell for the Road-Seal exit.

## Phase 2: Client chrome (Cut Stone everywhere)

- Token block in `src/index.css`: chamfer clip-paths, stroke weights, spacing unit.
- Chamfer panels, buttons, chips, tabs, inputs across the app.
- Right panel: replace the two-row uppercase tab grid with a single-row icon deck —
  icon-only chamfered tabs, gold underline on active, tooltip labels
  (`src/components/HudPanelTabs.tsx`).
- Header as a one-line "cathedral lintel": brand left, HP/Oath/AI cluster center,
  icon-only save actions right (`src/App.tsx`).
- HUD meters as wax channels: notch ticks at quarter marks, beveled track.
- Channel rail: chamfered chips, candle-dot active indicator.

## Phase 3: Feed and login refinement

- Feed entries keep their per-type voice; type labels align as a fixed marginalia
  column; entry cards chamfered; meta line tightened.
- Login: same chamfer/token treatment; no layout change (it already works).

## Phase 4: Future (not this pass)

- Dungeon diorama panel (react-three-fiber) reading encounter state.
- Interactive map hover states: medallion tooltips with services/danger readouts.
- Motion pass: entrance transitions for feed entries and panel swaps under a
  reduced-motion media query.

## Verification standard

Every phase: `npx tsc`, `npm run build`, `npm run replay` all clean, plus a
Playwright screenshot review at real panel sizes (not just full-page) before
committing. UI changes must never touch `src/game/` logic.
