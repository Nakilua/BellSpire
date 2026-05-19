# Bellspire Source Manifest

These handoff files are the source truth for the current MVP pass.

The fuller local source inventory and reading audit lives in [source_audit/SOURCE_INVENTORY.md](./source_audit/SOURCE_INVENTORY.md).

## Source Authority

Bellspire uses sources in this order:

1. Complete Canon Compendium v1.1 and Complete Data Workbook v1.1 define current canon.
2. Loot worktables, Master_Loot_DB style rows, DB patch rows, rarity config, drop rules, and source tables define item/reward truth.
3. Focused content bibles define zone, dungeon, boss, event, social, economy, progression, and locked-preview content.
4. Discord/map playstyle and Codex handoff prompts define app behavior and MVP scope.
5. Research papers and production notes inform quality, MMO feel, pacing, UX, economy, social systems, and progression design. They do not override canon names or loot rows.

| Source | Current Local Path | Runtime Use |
| --- | --- | --- |
| Complete Canon Compendium v1.1 | `C:\Users\steph\Downloads\Project_Bellspire_Complete_Canon_Compendium_v1_1.pdf` | Canon archive and review source |
| Complete Data Workbook v1.1 | `C:\Users\steph\Downloads\Project_Bellspire_Complete_Data_Workbook_v1_1.xlsx` | Canon/staging workbook |
| Discord Map Playstyle Prompt v1.1 | `C:\Users\steph\Downloads\Project_Bellspire_Discord_Map_Playstyle_Prompt_v1_1.md` | Play operation and output style |
| Codex Handoff Prompt v1.1 | `C:\Users\steph\Downloads\Project_Bellspire_Codex_Handoff_Prompt_v1_1.md` | Build guardrails |

## Additional Local Source Files Found

The 2026-05-19 source audit also found focused Bellspire PDFs and workbooks in `C:\Users\steph\Downloads`, including:

- Bellscar Coast deep bible and DB patch rows.
- Brackenholt Thornhouse dungeon bible and DB patch rows.
- Saltbroken Bellworks dungeon bible.
- Endgame operating system bible.
- Progression/item-level/reward math bible.
- Tank loot workbook.
- Thornhouse conformance audit addendum.
- Current source pack zip.
- Deep research report and source-pack research notes.

The large canon PDFs and workbooks are intentionally not imported by the app at runtime. The app uses curated JSON in `src/data` so the first vertical slice stays stable and buildable.

The canon registry now indexes the source-pack entries and research references so future AI Director, social simulation, loot, and map work can cite the right source tier.

## Reading Audit

- [Complete compendium reading audit](./source_audit/COMPENDIUM_READING_AUDIT.md)
- [Workbook reading audit](./source_audit/WORKBOOK_READING_AUDIT.md)
- [Social systems canon audit](./source_audit/SOCIAL_SYSTEMS_CANON_AUDIT.md)
- [Map topography audit](./source_audit/MAP_TOPOGRAPHY_AUDIT.md)
