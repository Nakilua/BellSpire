# Bellspire Social Systems Canon Audit

Generated on 2026-05-19 after full extraction of the v1.1 compendium and every discovered Bellspire workbook.

## Big Honest Finding

The current app has the visual shell for social play, but not the full social game yet. It has channels, a static party panel, reputation numbers, world flags, NPC reactions in recap, and an Activity Board surface. The source material contains a much richer social layer: friends, contacts, relationship memory, guilds, guild contracts, mentoring, group finder, social reputation, activity recommendations, and social consequences.

## Core Social Canon Found

- The Discord-style interface is not just decoration. It is the intended play wrapper: channel rail, center feed, party/map panels, activity board, command bar, and session recap.
- Social progress is a reward type alongside XP, loot, reputation, materials, world-state improvement, and guild contribution.
- The social loop is explicit: see friend/guild/zone activity, choose whether to join, party/chat/trade/craft/queue, build reputation, and gain future invitations or consequences.
- Relationship memory exists and should be fair, not melodramatic. Helping players, abandoning parties, making mistakes, or performing well can affect future social memory.
- Guild systems are deep: roster, ranks, officers, raid teams, event calendar, bank tabs, crafting specialists, recruitment status, reputation, drama flags, and guild contracts.
- Guild contracts are social objectives that feed world systems, such as defending Bellscar, gathering materials, clearing dungeons with guild members, or escorting Roadwarden wagons.
- Party finder / group finder is a real system, with role needs, level/activity target, route notes, mechanics tags, and group behavior.
- NPC simulation includes nearby NPC memory/reactions, regional service state, faction counters, schedules, injury/saved states, mail, recurring characters, and reputation-gated dialogue.
- Activity Board should recommend activities by lane: Ascension, Dominion, Mastery, Prestige, economy, guild, and event goals.

## Strong Source Anchors

- Compendium page 69 introduces Party Finder and Group Play in the Play Mode/Core Loop section.
- Compendium pages 85-91 cover friends, relationship memory, guild systems, NPC/world simulation, and the social loop.
- Compendium pages 100-102 cover character ledger, session recap, party finder fields, queue pop, and group behavior.
- Compendium pages 283-307 strongly cluster around Guild, Mentoring, and Social Tools.
- Complete Data Workbook: `Zone_DB` marks Saint Veyra as social/crafting/guilds/training/world boss/faction envoy foundation.
- Complete Data Workbook: `Public_Event_DB` includes Bell Tower Siege and guild-contract public warfare; Nocturne includes social stealth and blood contracts.
- Bellscar patch workbook includes concrete `Guild_Contract_DB`, `Faction_DB`, `Hub_Service_DB`, `ActivityBoard_DB`, and world-state rows.
- Thornhouse patch workbook includes `GroupFinder_DB`, `Wipe_Recap_DB`, `ActivityBoard_DB`, and guild contract / Dominion rows.
- Tank loot workbook reinforces the broader model: overworld atlas, dungeons, raids, guilds, and player economy.

## Current App Coverage

Implemented now:

- Discord-style channel rail.
- Party panel, currently static.
- Activity Board panel, currently first-slice focused.
- Reputation and world flags.
- Session recap includes NPC reactions, source pity, flags, loot, and wipes.
- Local character creation through `/login`.

Missing or only placeholder-level:

- Friends list / contacts.
- Relationship memory ledger.
- Social reputation separate from faction reputation.
- Guild roster, ranks, calendar, recruitment, and bank/project concepts.
- Guild contracts as playable objectives.
- Group finder / queue card system.
- Mentoring tools.
- Mail/whisper/chat behavior beyond channel-flavored feed entries.
- NPC schedules and persistent NPC memory beyond first-slice reactions.
- Activity Board recommendations based on social, guild, and world-state pressure.

## Recommended Next Build Slice

Do not jump straight to a full MMO social simulator. The next practical slice should be:

1. Add a Social Ledger panel with Contacts, Recent Party, NPC Memory, and Social Reputation.
2. Turn `#guild-board` into a real panel with 2-3 staged guild contracts.
3. Add a Group Finder card for Pilgrim Trial Cryptlet Training mode.
4. Track simple relationship events: helped Renn, earned Olla permission, wiped, cleared Warden, abandoned/continued dungeon.
5. Add session recap lines for social changes.

This would bring Bellspire much closer to the actual source material without exploding scope.
