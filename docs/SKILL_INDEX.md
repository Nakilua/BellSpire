# BellSpire Skill Index

Use these project skills when adding or testing BellSpire content. They are not Codex plugins; they are local process rules for future work in this repo.

## Skills

- [Source Governance Skill](./skills/SOURCE_GOVERNANCE_SKILL.md): use when adding or changing runtime data, canon facts, zones, NPCs, quests, classes, maps, or social content.
- [Loot Audit Skill](./skills/LOOT_AUDIT_SKILL.md): use when adding materials, gear, rewards, source pity, dungeon caches, or item tables.
- [AI Director Skill](./skills/AI_DIRECTOR_SKILL.md): use when changing NPC dialogue, simulated-player behavior, party/guild chat, or live AI prompting.
- [Tutorial Playtest Skill](./skills/TUTORIAL_PLAYTEST_SKILL.md): use when testing `/login`, the first road, Shrinekeeper Olla, and the Pilgrim Trial Cryptlet.

## Default Rule

If a change touches playable content, source law, AI replies, loot, maps, or tutorial flow, run the relevant skill and then run:

```powershell
npm.cmd run canon:audit
npm.cmd run build
```
