# Bellspire MVP Acceptance Checklist

The MVP is accepted when all checks below pass.

## Shell

- `docs/MMO_RULES_BIBLE.md` exists and defines the source-governed solo MMO rules.
- App starts locally.
- `/login` opens the local character creation screen.
- Character creation can set name, origin, first vow, and the locked Bulwark starter class.
- Existing local saves can continue from `/login`.
- Layout has left channel rail, center feed, right state panels, and bottom command input.
- UI is readable on desktop and usable on a mobile-width viewport.

## Navigation

- Channel clicks update the feed.
- Typed commands update the feed.
- Player can travel from Saint Veyra to Hearthmere Fields.
- Player can travel from Hearthmere Fields to Road Shrine of Little Dawn.
- Map panel shows the current route and locked future regions.
- Map panel renders hand-authored SVG topography for world, zone, and dungeon views.
- Map layers still support routes, services, danger, and guild hooks without breaking mobile readability.

## Quest

- Talking to Shrinekeeper Olla starts or advances `Trial Under Little Dawn`.
- Quest tracker updates as the player moves through the first slice.

## Social World

- Typing in `#party-chat` creates local party chat messages.
- Party contacts answer through the AI Director with topic-aware, character-specific replies.
- When `npm.cmd run ai` is running with `.env.local`, normal chat can use `gpt-5.4-mini`.
- Cinematic/director scenes try `gpt-5.4`, then fall back if the account/model quota blocks it.
- Quality mode buttons and `ai mode <auto|mini|cinematic|local>` update the AI Director mode.
- Local mode and budget stop mode use the built-in Director instead of calling the API.
- The Social World panel shows estimated monthly spend, last request cost, budget state, and live/cinematic/local turn counts.
- Live AI replies receive curated canon context packs for the current location, party state, dungeon room, and message.
- `lfg`, `join cryptlet group`, and `invite <name>` update group finder, party memory, trust, and the feed.
- `#guild-board`, `guild contracts`, and `accept contract <name>` update guild contracts and guild credit.
- `director <message>` produces a local Director readout grounded in the current location, party, and dungeon state.
- `social memory` shows recent Director memory.
- Social recap tracks group joins, invites, guild posts, and contract actions.
- `#global`, `#zone`, and `#guild-recruitment` produce local living-world chatter.
- `listen` and `who` surface proactive ambient activity and nearby contacts.
- Ambient social simulation does not call the API automatically.

## Canon Registry

- `npm.cmd run canon:audit` completes with zero hard violations.
- `src/data/canonRegistry.json` represents all available workbook rows, source-pack entries, research references, and the existing PDF reading index.
- Canon registry exposes a source authority ladder: compendium/workbooks first, loot worktables for rewards, focused bibles for preview content, research references for design guidance.
- `src/data/sourceGovernance.json` covers every existing runtime data file and record.
- Canon audit reports `Runtime data files governed` and `Runtime records governed` at full coverage.
- Canon library panel shows source counts, loot audit status, and class playable/preview status.
- Runtime items include rarity, source status, source type/id, zone/dungeon mapping where available, and class tags where relevant.
- Permanent gear remains canonical, staged, or prototype-labeled.

## Dungeon

- Player can enter Pilgrim Trial Cryptlet from the Road Shrine.
- Dungeon rooms progress in canon order:
  - Shrine Descent
  - Hall of Threaded Names
  - Broken Bell Niche
  - Pilgrim Bone Walk
  - Candleless Alcove
  - Warden Chamber
  - Road-Seal Exit

## Combat

- Bulwark abilities affect combat state.
- Combat shows lanes, enemy intent, telegraphs, player actions, and results.
- The Bellgrave Warden shows Grave Bell Swing, Vowless Mark, Bone Rattle Adds, Road-Seal Pulse, and Final Toll.
- Defeat produces a wipe recap that explains the failure.
- Victory unlocks the reward flow.

## Loot And Persistence

- Rewards include materials, reputation, source pity, and only sourced or staged gear.
- No untracked permanent gear enters the world.
- Browser refresh preserves save state.
- Save JSON can be validated, previewed, exported, and imported through the Save Tools panel.
- Session recap tracks visited places, quests, loot, wipes, reputation, source pity, flags, and NPC reactions.
