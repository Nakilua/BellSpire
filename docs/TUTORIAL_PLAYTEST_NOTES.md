# Tutorial Playtest Notes

Generated for the first post-foundation docs pass.

## Route Under Test

- `/login`
- Saint Veyra Capital
- Hearthmere Fields
- Road Shrine of Little Dawn
- Pilgrim Trial Cryptlet entry
- Basic social/world commands
- Early combat command feedback
- Premature loot feedback
- Recap visibility

## Results

- Passed: `/login` loaded and created a fresh local Bulwark save.
- Passed: main game shell loaded with channel rail, feed, command bar, right-side panels, map, Canon Library, party, inventory, quest tracker, and activity board.
- Passed: `look` in Saint Veyra explained the location and exits.
- Passed: `travel Hearthmere Fields` moved the player and produced local zone/social chatter.
- Passed: `listen` produced global canon-law chatter and a local DM beat.
- Passed: `who` surfaced nearby contacts and suggested social commands.
- Passed: `travel Road Shrine of Little Dawn` moved the player and produced road-report chatter.
- Passed: `talk Shrinekeeper Olla` opened the quest path and set up dungeon permission.
- Passed: `accept quest` activated `Trial Under Little Dawn`.
- Passed: `enter dungeon` moved into Pilgrim Trial Cryptlet, set Road Trial Oath state, and showed dungeon map/room structure.
- Passed: `continue` moved from Shrine Descent into Hall of Threaded Names and started the first encounter.
- Passed: `guard frontline` changed combat state and advanced enemy intent.
- Passed: `shield oath bellgrave warden` still resolved to the active Vowless Pilgrim Shade in the current encounter.
- Passed: early `loot` produced a source-law warning instead of granting a reward.
- Passed: `recap` tracked visited locations, quest start/acceptance, no loot, no wipes, set flags, and Olla's NPC reaction.
- Passed: `party can anyone help call lanes?` produced local party replies from Renn, Edrin, Tallowwick, and the local Director.
- Passed: local save autosaved through the route.
- Expected limitation: AI bridge was offline during the playtest, so browser console showed failed calls to `127.0.0.1:8787`; local fallback worked and the UI showed fallback state.

## Follow-Up Candidates

- Improve target feedback: `shield oath bellgrave warden` during a non-Warden encounter silently targeted the active shade. That is functional, but a beginner would benefit from a short "target not present, using current threat" message.
- Consider starting or checking the AI bridge before tutorial tests when live AI behavior is being evaluated. For this pass, local fallback was the intended safe behavior.
- Consider adding one early prompt that teaches `party <message>` before combat, because the feature works and feels good once discovered.
- Consider adding a clearer first-session nudge toward `join cryptlet group` or `invite Renn`, since group finder and social trust are important to the MMO feeling.
- Keep the early `loot` warning; it correctly teaches source-law reward timing.
