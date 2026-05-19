# Workbook Reading Audit

Generated on 2026-05-19. Every visible worksheet in each discovered Bellspire workbook was opened and scanned.


## project_bellspire_bellscar_coast_db_patch_rows_v0_1.xlsx

- Sheets: 20
- Path: `C:\Users\steph\Downloads\project_bellspire_bellscar_coast_db_patch_rows_v0_1.xlsx`

| Sheet | Rows | Cells | Headers / First Row |
| --- | --- | --- | --- |
| README | 6 | 12 | Field; Value |
| Canon_Intake | 12 | 24 | Source; Use |
| Zone_DB | 2 | 34 | Zone_ID; Zone_Name; Region_Type; Level_Min; Level_Max; Zone_Tier; Time_Targets; Primary_Factions |
| Sublocation_DB | 35 | 210 | SubLocation_ID; SubLocation_Name; Type; Primary_Function; State_Hook; Zone |
| Hub_Service_DB | 6 | 42 | Hub_ID; Hub_Name; Hub_Type; Services; NPC_Anchors; Design_Notes; State_Flags |
| NPC_DB | 17 | 102 | NPC_ID; NPC_Name; Location; Affiliation_or_Type; Gameplay_Function; Quest_or_Event_Hook |
| Faction_DB | 7 | 35 | Faction; Public_Role; Hidden_Pressure; Gameplay_Use; State_Flags |
| Enemy_Ecology_DB | 11 | 66 | Enemy_ID; Enemy_Name; Role; Mechanics; Teaches; Zone |
| RareSpawn_DB | 9 | 54 | Rare_ID; Rare_Name; Location; Type; Reward_Purpose; Spawn_Note |
| Public_Event_DB | 7 | 56 | Event_ID; Event_Name; Event_Type; Primary_Location; Faction_Tie; Contribution_Types; World_State_Output; Reward_Vector |
| Event_Stage_DB | 6 | 36 | Event_ID; Stage_Number; Stage_Name; Player_Jobs; Success_Result; Failure_Result |
| Quest_DB | 16 | 96 | Quest_ID; Quest_Name; Quest_Type; Location; Objective_Summary; Reward_Vector |
| Material_Node_DB | 11 | 66 | Material_ID; Material_Name; Source_Locations; Uses; Zone; Rarity_Note |
| Dungeon_Lead_DB | 2 | 18 | Dungeon_ID; Dungeon_Name; Zone; Entrance_Location; Level_Range; Unlock_Rule; Primary_Lessons; Source_State |
| Guild_Contract_DB | 6 | 30 | Contract_ID; Contract_Name; Requirement; Reward_Vector; Abuse_Guard |
| Class_Hook_DB | 9 | 27 | Class; Bellscar_Hook; Implementation_Use |
| Vendor_Patch | 6 | 36 | Vendor_ID; Vendor_Name; Location; Services; State_Behavior; Reputation_Tie |
| World_State_DB | 7 | 35 | State_Flag; Player_Visible_Effects; Improves_When; Worsens_When; UI_Surface |
| ActivityBoard_DB | 6 | 36 | Activity_ID; Activity_Name; Lane; Trigger; Reward_Vector; Recommendation_Logic |
| Archive_Notes | 5 | 10 | Field; Value |

### Social/System Hits

- `Canon_Intake`:
  - row 2: Systems First Research | Systems-first hybrid MMO, reward cadence, social tools, guild support, economy as first-class, zone-sharded world.
  - row 5: Zone Atlas v0.1 | Bellscar identity, Bell Tower Siege, Saltbroken Bellworks slot, launch world/faction doctrine.
  - row 9: UX/HUD v0.1 | Group finder cards, activity board, event callouts, dungeon tracker, wipe recaps.
  - row 10: Guild/Social Tools v0.1 | Guild contracts, mentoring, recruitment, social confidence, Dominion support.
- `Zone_DB`:
  - row 1: Zone_ID | Zone_Name | Region_Type | Level_Min | Level_Max | Zone_Tier | Time_Targets | Primary_Factions | Hostile_Factions | Public_Event_IDs | Dungeon_IDs | Source_Names | Crafting_Materials | World_State_Flags | Travel_Unlock | Visual_Keywords | Implementation_Status
- `Sublocation_DB`:
  - row 2: BSC-001 | Coastwatch Landing | Primary Hub | Militia inn, repair, mailbox, notice board, guild contract plank, Roadwarden post. | Safe unless Siege Heat is high. | Bellscar Coast
  - row 4: BSC-003 | Roadwarden Tidepost | Secondary Camp | Escort boards, trap kits, Ranger scouting contracts. | Road Safety hub. | Bellscar Coast
  - row 19: BSC-018 | Old Chain Causeway | Travel Route | Rust chains across tide flats, escort hazards. | Caravan/guild contracts. | Bellscar Coast
  - row 21: BSC-020 | Banner-Scrap Field | Gathering POI | Recovered flags, cloth, guild-banner cosmetics. | Prestige and guild materials. | Bellscar Coast
- `Hub_Service_DB`:
  - row 2: PB-HUB-BEL-001 | Coastwatch Landing | Primary Hub | Inn; repair; mailbox; notice board; guild contract plank; Roadwarden post | Captain Mira Vale; Quartermaster Joss Brine; Roadwarden Pell; Innkeeper Runa | Default arrival and safest social point | Road Safety; Siege Heat
  - row 4: PB-HUB-BEL-003 | Oath-Iron Clampworks | Crafting Hub | Blacksmithing; armorsmithing; artificing; repair kits; bronze clamp quests | Master Harl Oathiron; Apprentice Venn; Guild Contract Clerk | Economy and siege repair anchor | Material Flow; Tower State
  - row 6: PB-HUB-BEL-005 | Roadwarden Tidepost | Secondary Camp | Ranger contracts; escort boards; trap kits; scouting tasks; travel unlock | Roadwarden Eska; Hawkhandler Trove; Scout Bel | Public event reconnaissance and route safety | Road Safety; Public Event Cooldown
- `NPC_DB`:
  - row 3: PB-NPC-BEL-002 | Quartermaster Joss Brine | Coastwatch Landing | Militia quartermaster | Vendor / guild contract intro | Guild Contract Unlocked
  - row 12: PB-NPC-BEL-011 | Roadwarden Eska | Roadwarden Tidepost | Scout commander | Ranger contracts | Landing point scouting
- `Faction_DB`:
  - row 1: Faction | Public_Role | Hidden_Pressure | Gameplay_Use | State_Flags
  - row 2: Roadwardens | Road safety, scouting, escort logic | Will cut deals with smugglers if the coast collapses | Escort contracts; safe route unlocks; trap kits | Road Safety; Guild Contracts
  - row 3: Oath-Iron Foundries | Repair bells, clamps, armor, and siege lines | War contracts and labor pressure | Repair projects; crafting orders; bronze sinks | Material Flow; Tower State
  - row 4: Bellspire Concord | Keep factions working together | Order fast, truth later | Default quest path; balanced aftermath | Concord Stability
- `Public_Event_DB`:
  - row 1: Event_ID | Event_Name | Event_Type | Primary_Location | Faction_Tie | Contribution_Types | World_State_Output | Reward_Vector
  - row 3: PB-EVT-BEL-TDE-0002 | Tidepost Escort | Local repeatable | Old Chain Causeway | Roadwardens | Escort; Defense; Logistics | Road Safety; Guild Contract availability | Roadwarden rep; materials
- `Event_Stage_DB`:
  - row 6: PB-EVT-BEL-BTS-0001 | 5 | Aftermath | Turn in banners; spend event currency; choose faction report | Vendors and guild contracts improve | Enemy density and repair costs stay high until reset
- `Quest_DB`:
  - row 8: PB-QST-BEL-MAIN-007 | Guild Contract Unlocked | Main/Social | Militia Quartermaster Row | Open guild contract boards through the first Bellscar war contract. | Guild contract tutorial.
  - row 12: PB-QST-BEL-SIDE-003 | The Banner That Still Salutes | Side | Drowned Banner Shoals | Destroy or recover a drowned banner that drains militia morale. | Prestige fragment, faction choice.
  - row 16: PB-QST-BEL-GUILD-001 | First Bellscar Contract | Guild | Militia Quartermaster Row | Complete a supply, defense, or repair objective with guild members. | Dominion Warrants staging, guild prestige.
- `Material_Node_DB`:
  - row 2: PB-MAT-BEL-001 | Cracked Bronze | Bell tower scaffolds, clampworks, Bell Tower Siege aftermath | Blacksmithing, Armorsmithing, Artificing, guild repair projects. | Bellscar Coast | Common/Uncommon unless rare route stated
  - row 4: PB-MAT-BEL-003 | Banner Scraps | Banner-Scrap Field, Drowned Banner Shoals, event rewards | Guild banners, Tailoring, Prestige, Dominion contracts. | Bellscar Coast | Common/Uncommon unless rare route stated
- `Dungeon_Lead_DB`:
  - row 2: PB-DNG-BEL-SBW-0001 | Saltbroken Bellworks | Bellscar Coast | Saltbroken Bellworks Exterior / Bellworks Intake Tunnels | Level 17-20 normal; training after Bell Tower Siege participation | Bell Tower Siege participation + The Bellworks Intake quest | Public-to-instance transition; siege mechanics; repair objects; salt-curses; drowned banners | Proposed source rows needed before final permanent loot ownership | Heroic
- `Guild_Contract_DB`:
  - row 1: Contract_ID | Contract_Name | Requirement | Reward_Vector | Abuse_Guard
  - row 2: PB-GCT-BEL-001 | First Bellscar Contract | Complete a Bell Tower Siege objective with 3 guild members | Dominion Warrants staging; guild prestige | Requires event participation and contribution in at least two categories
  - row 5: PB-GCT-BEL-004 | Tidepost Caravan Guard | Escort Roadwarden wagons through Old Chain Causeway | Road Safety and guild credit | Requires escort completion, not speedrun abandonment
  - row 6: PB-GCT-BEL-005 | Keep the Bellworks Open | Complete Saltbroken Bellworks with guild members after siege stage completion | Dungeon/Dominion bridge reward | Requires eligible dungeon completion and objective credit

## project_bellspire_brackenholt_thornhouse_db_patch_rows_v0_1.xlsx

- Sheets: 17
- Path: `C:\Users\steph\Downloads\project_bellspire_brackenholt_thornhouse_db_patch_rows_v0_1.xlsx`

| Sheet | Rows | Cells | Headers / First Row |
| --- | --- | --- | --- |
| README | 6 | 12 | Field; Value |
| Canon_Intake_Checklist | 12 | 36 | Source; Status; Use In Thornhouse |
| Dungeon_DB | 2 | 24 | Dungeon_ID; Dungeon_Name; Zone; Level_Min; Level_Max; Group_Size; Target_Time_Min; Target_Time_Max |
| Dungeon_Room_DB | 13 | 78 | Room_ID; Dungeon_ID; Room_Name; Room_Type; Gameplay_Function; Route_Notes |
| Boss_DB | 4 | 32 | Boss_ID; Dungeon_ID; Boss_Name; Room; Role; Primary_Mechanics; Wipe_Tags; Reward_Vector |
| Enemy_Ecology_DB | 10 | 60 | Enemy_ID; Dungeon_ID; Enemy_Name; Role; Mechanics; Teaches |
| Loot_Source_Map | 5 | 40 | Source_ID; Dungeon_ID; Source_Name; Source_Type; Encounter; Canonical_State; Drop_Rule_ID; Notes |
| Quest_DB | 6 | 30 | Quest_ID; Quest_Name; Faction_Path; Objective_Summary; Reward_Vector |
| Class_Hook_DB | 9 | 18 | Class; Thornhouse_Hook |
| Material_Currency_DB_Patch | 9 | 54 | Material_ID; Name; Type; Source; Use; Canon_State |
| Gathering_Node_DB | 6 | 42 | Node_ID; Dungeon_ID; Node_Name; Profession; Location; Respawn_Logic; Notes |
| Vendor_DB_Patch | 5 | 30 | Vendor_ID; Vendor_Name; Location; Unlock_Condition; Inventory_Impact; Notes |
| GroupFinder_DB | 2 | 18 | Dungeon_ID; Card_Title; Estimated_Time; Level_Range; Role_Requirements; Mechanic_Tags; Source_Loot; Route_Note |
| Wipe_Recap_DB | 9 | 27 | Wipe_Tag; Observed_Cause; Suggested_Fix |
| Endgame_Lane_DB | 6 | 18 | Lane; Thornhouse Normal Role; Heroic Return Role |
| ActivityBoard_DB | 5 | 30 | Activity_ID; Activity_Name; Lane; Availability; Board_Text; Reward_Preview |
| Archive_Notes | 5 | 10 | Note_ID; Note |

### Social/System Hits

- `Canon_Intake_Checklist`:
  - row 7: UX / HUD / Activity Board Bible v0.1 | Present | Governs group finder card, dungeon tracker, boss UI, wipe recaps, activity board, Bell Reliquary readability.
  - row 8: Guild / Mentoring / Social Tools Bible v0.1 | Present | Governs guild contracts, mentoring, recruitment, Dominion projects, social confidence, anti-Discord-dependency tools.
  - row 9: Briarwatch Glen Integrated Zone Bible v0.2 | Present | Governs Briarwatch identity, Thornhouse lead-in, sublocations, NPC/service ecology, dungeon entrances, faction state, endgame return hooks.
- `Dungeon_Room_DB`:
  - row 5: PB-DNG-BRI-THO-R04 | PB-DNG-BRI-THO-0001 | Boss 1 Arena: Lower Kennels | Room | Kennelmaster Orra Thornbite and bellbound hounds. | Nonlethal hound control changes reward/reputation.
  - row 6: PB-DNG-BRI-THO-R05 | PB-DNG-BRI-THO-0001 | Low Servants Hall | Room | Social evidence, frightened civilians, patrol avoidance or rescue. | Servant testimony alters final aftermath.
  - row 13: PB-DNG-BRI-THO-R12 | PB-DNG-BRI-THO-0001 | Aftermath: Broken Writ Stair | Room | Faction choice turn-in, world-state update, shortcut unlock. | Determines which zone state improves after clear.
- `Loot_Source_Map`:
  - row 2: PB-SRC-BRI-THO-000 | PB-DNG-BRI-THO-0001 | Brackenholt Thornhouse | Dungeon Wrapper | All dungeon | Proposed | DNG_NORMAL | Dungeon wrapper source for tables and group finder.
- `Quest_DB`:
  - row 1: Quest_ID | Quest_Name | Faction_Path | Objective_Summary | Reward_Vector
  - row 3: PB-QST-BRI-THO-002 | The Warrant That Was Not Sent | Roadwarden | Gather toll evidence, enter by service gate, seize the Thorn Ledger, defeat Sir Brackenholt, return proof to Hollow Bell Watch. | Roadwarden Favor, road safety state, Dominion contract unlock.
- `Class_Hook_DB`:
  - row 2: Bulwark | Gate pressure, Green-Black Guard timing, tanking hounds without dragging trap lanes through the party.
- `Material_Currency_DB_Patch`:
  - row 2: PB-MAT-BRI-MOSS-LEATHER | Moss Leather | Material | Briarwatch beasts / Thornhouse hounds | Leatherworking, repair, guild projects | Use existing or add if missing
  - row 3: PB-MAT-BRI-BRIAR-IRON | Briar Iron | Material | Estate gates, chains, oath bells | Blacksmithing, trap components, guild projects | Use existing or add if missing
  - row 9: PB-CUR-DOMINION-WARRANT | Dominion Warrants | Currency | Guild contracts and caravans | Guild upgrades, banners, projects | Already governed by Progression Bible
- `Gathering_Node_DB`:
  - row 2: PB-NOD-BRI-THO-001 | PB-DNG-BRI-THO-0001 | Moss Leather Rack | Leatherworking/Skinning | Lower Kennels | Once per instance, party-shared | Appears after Boss 1.
- `Vendor_DB_Patch`:
  - row 3: PB-VEN-BRI-THO-002 | Quartermaster Ell Rownt | Hollow Bell Watch | Roadwarden Proof Delivered aftermath | Road repair supplies, Dominion contract turn-ins | Supports road stabilization.
- `Wipe_Recap_DB`:
  - row 2: TRAP_LANE_FAILURE | Party took repeated Trapwire Lane hits. | Move after lane telegraph; assign one player to disarm marked thornwire objects.
  - row 7: TANK_POSITIONING_FAILURE | Boss cleaves or oathrails crossed the party. | Face boss away, rotate during Green-Black Guard, keep object players out of front lanes.
- `Endgame_Lane_DB`:
  - row 4: Dominion | Road/servant aftermath teaches world-state consequence | Guild contract: clear Thornhouse with 3 guild members; road stabilization project
- `ActivityBoard_DB`:
  - row 2: PB-ACT-BRI-THO-NORMAL | Brackenholt Thornhouse | Ascension / Mastery | Level 12-15 normal | Investigate House Brackenholt and break the Thorn Oathkeeper. | Gear chance, source pity, materials, faction outcome
  - row 4: PB-ACT-BRI-THO-GUILD | Guild Contract: Thornhouse Writ | Dominion | Guild contract rotation | Clear Thornhouse with 3 guild members and deliver road proof. | Dominion Warrants, guild project progress

## Project_Bellspire_Complete_Data_Workbook_v1_1.xlsx

- Sheets: 16
- Path: `C:\Users\steph\Downloads\Project_Bellspire_Complete_Data_Workbook_v1_1.xlsx`

| Sheet | Rows | Cells | Headers / First Row |
| --- | --- | --- | --- |
| V1_COVERAGE | 6 | 18 | File; Role; Instruction |
| Zone_DB | 11 | 66 | Zone_ID; Name; Type; Level_Range; Primary_Function; Status |
| Instance_DB | 11 | 77 | Instance_ID; Name; Zone; Level_Range; Format; Boss_Count; Status |
| Boss_DB | 22 | 132 | Boss_ID; Name; Instance; Role; Signature_Mechanics; Status |
| Public_Event_DB | 11 | 44 | Event_ID; Name; Zone; Primary_Lesson |
| Material_Currency_Summary | 15 | 45 | Material; Primary_Source; Use |
| Endgame_Lane_Map | 5 | 30 | Content; Ascension; Mastery; Dominion; Economy; Prestige |
| Prototype_App_Map | 7 | 21 | System; Definition; Priority |
| V1_1_COVERAGE | 8 | 32 | Component; Artifact; Status; Notes |
| V1_1_ZONE_POI_EXPANSION | 61 | 366 | Zone; POI_ID; Name; Type; Function; State_Hook |
| V1_1_INSTANCE_ROOMS | 27 | 135 | Instance; Room_ID; Name; Type; Primary_Lesson |
| V1_1_ENEMY_ECOLOGY | 28 | 140 | Area; Enemy; Role; Mechanics; Counterplay |
| V1_1_BOSS_MECHANICS | 15 | 90 | Instance; Boss; Boss_ID_or_Order; Core_Mechanics; Role_Jobs; Reward_Family |
| V1_1_LOOT_SOURCE_STAGING | 20 | 120 | Area; Source; Type; Holder_or_Event; Reward_Vector; Status |
| V1_1_MATERIALS | 13 | 65 | Area; Material; Source; Use; Node_Logic |
| V1_1_CODEX_MVP_MAP | 8 | 32 | Layer; Content; Priority; Notes |

### Social/System Hits

- `V1_COVERAGE`:
  - row 6: Project_Bellspire_Discord_Style_Text_MMO_Implementation_Bible_v1_0.pdf | Prototype implementation bridge | Reference/Codex
- `Zone_DB`:
  - row 2: PB-ZON-SVY-0001 | Saint Veyra Capital | Capital hub | 1-60 | social, crafting, guilds, training, world boss, faction envoys | Core foundation
  - row 5: PB-ZON-BEL-0001 | Bellscar Coast | Early-mid public warfare | 10-20 | Bell Tower Siege, militia defense, guild contracts, Saltbroken | Complete
  - row 9: PB-ZON-NOC-0001 | Nocturne Vale | High vampire court | 38-50 | Red Court, social stealth, blood contracts, Sanguine Court | New v1.0
- `Public_Event_DB`:
  - row 3: PB-EVT-BRI-CLAIM | Briar Claim | Briarwatch Glen | faction territory and elite hunt
  - row 4: PB-EVT-BEL-SIEGE | Bell Tower Siege | Bellscar Coast | scaled public warfare and guild contracts
  - row 5: PB-EVT-ARG-VOWS | Vows Under Ash | Argentwood Cathedral | cleanse windows and faction control
  - row 8: PB-EVT-NOC-MOONRISE | Masquerade at Moonrise | Nocturne Vale | charm resistance and social stealth
- `Material_Currency_Summary`:
  - row 6: Cracked Bronze | Bellscar / Saltbroken | bells, shields, Oath-Iron contracts
  - row 7: Banner Scraps | Bellscar | guild contracts, cosmetics, event tokens
  - row 11: Court Seals | Nocturne / Sanguine Court | court contracts, prestige, inscription
- `Endgame_Lane_Map`:
  - row 2: Nocturne Vale | late heroic dungeon/court rares | court route badges | guest rescue contracts | court seals/bloodglass | masque cosmetics
- `Prototype_App_Map`:
  - row 2: Discord-style app shell | Left channel rail, center feed, map panel, right state panel, command bar | P0
- `V1_1_COVERAGE`:
  - row 2: Nocturne Vale + Sanguine Court | Deep parity PDF v1.1 | Included | Late-mid vampire court zone/dungeon; charm resistance, Guest Right, blood contracts.
  - row 3: Bloodglass Spires + Castle Veyr | Deep parity PDF v1.1 | Included | Endgame approach and first raid wing; Red Crown Decree, red-crown fragments, guild banners.
  - row 6: Codex Handoff Prompt | Markdown + PDF v1.1 | Included | Build instructions for Discord-style text MMO client.
  - row 7: Discord/Map Playstyle Prompt | Markdown + PDF v1.1 | Included | Operational prompt for running Bellspire in the Discord-map style.
- `V1_1_ZONE_POI_EXPANSION`:
  - row 4: Nocturne Vale | NOC-003 | Red Wax Embassy | Faction Hub | Red Court emissaries, contract vendors, etiquette training | Court Favor and Blood Debt services
  - row 7: Nocturne Vale | NOC-006 | Velvet Vineyard Rows | Gathering Route | bloodglass grapes, court seals, hidden witnesses | rare material and social stealth route
  - row 12: Nocturne Vale | NOC-011 | Vintner Crypt Steps | Dungeon Approach | wine crypt, blood contract marks | Sanguine Court breadcrumb
  - row 13: Nocturne Vale | NOC-012 | Sanguine Court Exterior | Dungeon Entrance | red glass estate doors, guest-right warning | Group finder and route selection
- `V1_1_INSTANCE_ROOMS`:
  - row 2: Sanguine Court | SC-01 | Guest Hall of Red Wax | entrance/social hazard | Guest Right rules, court etiquette, first Bloodmark warning
  - row 4: Sanguine Court | SC-03 | Boss 1: The Velvet Footman | boss | social charm, forced movement, court rule compliance
  - row 8: Sanguine Court | SC-07 | Bloodglass Dining Room | mechanic room | contract objects, curse cleanse timing, red glass reflections
  - row 10: Sanguine Court | SC-09 | Aftermath: Broken Invitation Stair | exit | faction report choice, road access, court favor or court hostility
- `V1_1_ENEMY_ECOLOGY`:
  - row 2: Nocturne Vale | Red Wax Envoy | social controller | Charm Etiquette, Guest Right Warning | respect or deliberately break court rule windows
  - row 6: Nocturne Vale | Marrow Contract Scribe | support | Debt Seal, Bloodmark Ledger | object priority and Hexbinder counterplay
- `V1_1_BOSS_MECHANICS`:
  - row 4: Sanguine Court | Duchess Marrowveil | Final boss | Guest Right; Bloodmark; Courtly Debt; Last Invitation | charm swaps; anti-charm cleanse; contract breaks | Duchess source roll, Bloodglass Shards
- `V1_1_MATERIALS`:
  - row 2: Nocturne Vale | Court Seal | Seal Press, Red Court emissaries, Masquerade | prestige cosmetics, invitation crafting, faction writs | limited nodes + event/vendor
  - row 13: Bellgrave Below | Corpse-Right Seal | Tribunal, Union objectives | reputation turn-ins, profession writs | quest/boss reward

## project_bellspire_tank_loot_workbook_v0_1.xlsx

- Sheets: 9
- Path: `C:\Users\steph\Downloads\project_bellspire_tank_loot_workbook_v0_1.xlsx`

| Sheet | Rows | Cells | Headers / First Row |
| --- | --- | --- | --- |
| Dashboard | 11 | 43 | Project Bellspire MMO Loot Dashboard |
| README | 20 | 20 | Project Bellspire MMO Loot Workbook v0.1 |
| Item_Master_Tank | 306 | 8384 | ItemID; ItemName; RoleClass; Slot; ArmorType; ReqLevel; ItemLevel; Rarity |
| Rarity_Config | 8 | 56 | Rarity; Multiplier; ColorHex; DesignMeaning; WorldDropPct; DungeonBossPct; RaidBossPct |
| Slots_and_Stats | 16 | 80 | Slot; ArmorType; PrimaryUsage; SlotWeight; Notes |
| Source_Tables | 21 | 147 | SourceID; SourceType; Name; Zone; LevelBand; Repeatable; Notes |
| Affix_Pool | 11 | 88 | AffixID; AffixName; Stat1; Stat2; PowerBudgetCost; AppearsOn; RarityMin; Flavor |
| Set_Bonuses | 5 | 40 | SetID; SetName; Role; Pieces; 2pcBonus; 4pcBonus; 6pcBonus; SourceTier |
| Drop_Rules | 6 | 54 | SourceType; Common; Uncommon; Rare; Epic; Mythic; Legendary; Artifact |

### Social/System Hits

- `README`:
  - row 11: World model: massive overworld atlas, zone bands, dungeons, raids, guilds, player economy.
- `Item_Master_Tank`:
  - row 10: BLSP-TNK-0009 | Dawn Aegis | Tank / Bulwark | Shield | Shield | 1 | 9 | Common | Zone | Dawnmere Fields | Dawnmere Fields | BoE | Guard/Haste | 22 | 1 | 1.5 | 33 | 14 | 22 | Guard | 6 | Haste | 6 | When blocking a Heavy Strike, reduce party-wide damage by 3% next round. |  | 18 | Shield, Common, Tank, Guard, Haste | The maker's mark is hidden beneath a scratched prayer. | Draft | 
  - row 60: BLSP-TNK-0059 | Hollow-Wrought Bell-Core | Tank / Bulwark | Trinket | Relic | 10 | 18 | Common | Profession | Armorsmithing | All | BoE | MagicResist/Faith | 43 | 1 | 1.1 | 47 | 29 | 0 | MagicResist | 14 | Faith | 10 | When blocking a Heavy Strike, reduce party-wide damage by 3% next round. |  | 0 | Relic, Common, Tank, MagicResist, Faith | A practical piece, blessed by somebody tired and angry. | Draft | 
  - row 61: BLSP-TNK-0060 | Crypt-Wrought Reliquary Seal | Tank / Bulwark | Class Relic | Relic | 10 | 17 | Uncommon | Zone | Briarbell Woods | Briarbell Woods | BoE | Armor/Stamina | 41 | 1.18 | 1.25 | 60 | 30 | 0 | Armor | 8 | Stamina | 6 | When blocking a Heavy Strike, reduce party-wide damage by 3% next round. |  | 7.5 | Relic, Uncommon, Tank, Armor, Stamina | Its edge smells of rain, iron, and old candle smoke. | Draft | 
  - row 70: BLSP-TNK-0069 | Saint Kite Shield | Tank / Bulwark | Shield | Shield | 13 | 17 | Uncommon | Zone | Ashfen Parish | Ashfen Parish | BoE | Lifeward/Resolve | 41 | 1.18 | 1.5 | 73 | 30 | 42 | Lifeward | 13 | Resolve | 8 | When blocking a Heavy Strike, reduce party-wide damage by 3% next round. |  | 7.5 | Shield, Uncommon, Tank, Lifeward, Resolve | A stubborn little bastard of an item. Mina approved. | Draft | 
