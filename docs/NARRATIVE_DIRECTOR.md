# BellSpire Narrative Director

BellSpire needs a main-story spine, not only commands and loot. The Narrative Director is the local DM layer that makes the solo MMO feel like a campaign.

## What It Does

- Tracks the current main-story chapter.
- Fires source-safe DM beats when the player travels, talks, accepts the trial, enters the dungeon, moves deeper, or loots the cache.
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
