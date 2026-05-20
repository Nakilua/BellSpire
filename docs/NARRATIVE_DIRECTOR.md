# BellSpire Narrative Director

BellSpire needs a main-story spine, not only commands and loot. The Narrative Director is the local DM layer that makes the solo MMO feel like a campaign.

## What It Does

- Tracks the current main-story chapter.
- Fires source-safe DM beats when the player travels, talks, accepts the trial, enters the dungeon, moves deeper, or loots the cache.
- Keeps major chapter beats one-time so story milestones do not spam.
- Adds repeatable DM vignettes for `dm`, `listen`, travel, shrine, dungeon, boss, rest, and aftermath moments.
- Rotates repeatable vignettes through a saved cursor so asking the DM again can produce a different grounded scene read.
- Keeps a short narrative recap in the save file.
- Adds `story`, `dm`, `narrative`, and `dm scene` as local commands.
- Gives the AI Director better context when API mode is available.

## Source Law

Permanent story facts still come from the compendium, workbook, focused bibles, and handoff/playstyle prompts. The DM layer may add atmosphere, emotion, pacing, sensory detail, social reaction, and moment-to-moment framing.

It may not create permanent canon, invent permanent loot, rename locations, claim real multiplayer exists, or override source-governed quest and reward rules.

## Current Main Arc

`Pilgrimage of the First Bell` covers the first playable road:

Saint Veyra -> Hearthmere Fields -> Road Shrine of Little Dawn -> Pilgrim Trial Cryptlet -> Bellgrave Warden -> Road-Seal Exit.

The first pass is deterministic and local. Later passes can let the API Director create richer cinematic narration while the app keeps control of state, source law, loot, flags, and consequences.

## DM Presence Rules

The DM is allowed to repeat because a living world should not go silent after one chapter beat. Repeatable vignettes can show routines, party body language, road pressure, vow reflection, current-room reads, and aftermath texture.

Repeatable DM text still cannot create permanent new canon. It is atmosphere, pacing, table-feel, and player-facing interpretation. The save remembers the cursor and scene count, but only major story beats enter the durable narrative recap.
