# BellSpire Classic-Style Loot System v1: 125-Step Plan

This is the active loot build plan for the Classic-style loot pass.

## Summary

BellSpire loot should feel like Classic MMO loot: boss identity, memorable dungeon tables, rarity excitement, common materials that matter, party loot rolls, and social texture. It must also obey BellSpire source law: no ghost loot, no unsourced permanent gear, no AI-created item grants, and no playable future-zone bleed.

## Steps

1. Start from clean `main`.
2. Create branch `codex/classic-style-loot-v1`.
3. Leave stale PR #1 alone.
4. Add `docs/CLASSIC_STYLE_LOOT_SYSTEM_V1.md`.
5. Add `docs/MASTER_PLAN_125_CLASSIC_LOOT_STEPS.md`.
6. Update `README.md`.
7. Update `docs/START_HERE.md`.
8. Update `docs/MMO_RULES_BIBLE.md`.
9. Update `docs/CANON_RULES.md` if loot wording needs tightening.
10. Document Classic-inspired, not copied.
11. Define BellSpire loot pillars.
12. Pillar: source identity.
13. Pillar: dungeon memory.
14. Pillar: social rolling.
15. Pillar: rarity excitement.
16. Pillar: useful common rewards.
17. Pillar: no ghost loot.
18. Pillar: readable outcomes.
19. Pillar: auditability.
20. Pillar: AI narration without AI item authority.
21. Add `rarityConfig.json`.
22. Source it from BellSpire loot workbooks.
23. Include Common.
24. Include Uncommon.
25. Include Rare.
26. Include Epic.
27. Include Mythic.
28. Include Legendary.
29. Include Artifact.
30. Include color, rank, design meaning, and audit weight.
31. Add loot threshold rules.
32. Default threshold: Uncommon.
33. Below threshold: auto-loot or round-robin simulation.
34. At or above threshold: roll prompt.
35. Future party setting can raise threshold to Rare.
36. Future guild setting can raise threshold to Epic.
37. Show threshold in UI.
38. Save threshold only if user can change it.
39. Audit thresholds against rarity config.
40. Block unknown thresholds.
41. Add binding rules.
42. Tradable means no binding.
43. Oathbound on Pickup means BoP-style.
44. Oathbound on Equip means BoE-style.
45. Quest-bound means quest item only.
46. Staged-bound means unfinished prototype/staged reward.
47. Show binding in tooltips.
48. Audit binding on permanent gear.
49. Block permanent gear without binding.
50. Keep Road-Seal Buckler staged-bound for now.
51. Add `lootSources.json`.
52. Add boss source type.
53. Add dungeon cache source type.
54. Add dungeon trash source type.
55. Add rare spawn source type.
56. Add chest/container source type.
57. Add quest reward source type.
58. Add profession/material node source type.
59. Add vendor/reputation source type for later.
60. Add public event source type for later.
61. Add Cryptlet loot sources.
62. Bellgrave Warden boss source.
63. Road-Seal Cache source.
64. Broken Bell Niche source.
65. Cryptlet trash/material source.
66. Cryptlet chest/container source.
67. Pilgrimage quest reward source.
68. Mark all non-Cryptlet sources preview-locked.
69. Add source notes to every source.
70. Add source-governance coverage.
71. Add `lootTables.json`.
72. Add Bellgrave Warden boss table.
73. Add Road-Seal Cache table.
74. Add Broken Bell Niche table.
75. Add Cryptlet trash table.
76. Add Cryptlet chest table.
77. Add Pilgrimage quest reward table.
78. Keep guaranteed material rows.
79. Keep conditional Bell Sliver row.
80. Keep staged Road-Seal Buckler row.
81. Add loot table entry types.
82. Guaranteed entry.
83. Weighted entry.
84. Conditional entry.
85. Once-per-clear entry.
86. Repeat-clear entry.
87. Quest-required entry.
88. Source-pity-eligible entry.
89. Preview-locked entry.
90. No-drop entry.
91. Build `lootEngine`.
92. Input current game state.
93. Input loot source id.
94. Input party state.
95. Input optional deterministic seed.
96. Return granted rewards.
97. Return roll prompts.
98. Return roll history.
99. Return blocked rewards.
100. Return source-law explanations.
101. Add Need/Greed/Pass simulation.
102. Player can Need eligible gear.
103. Player can Greed eligible gear.
104. Player can Pass.
105. Simulated party members roll by role fit.
106. Simulated party members respect tutorial fairness.
107. Need beats Greed.
108. Greed beats Pass.
109. Ties use hidden reroll.
110. Roll results appear in feed.
111. Add role eligibility.
112. Bulwark can Need tank shields.
113. Bulwark can Need tank armor when available.
114. Bulwark can Greed non-upgrades.
115. Materials default to Greed/auto distribution.
116. Quest items go to eligible character.
117. Staged rewards explain their status.
118. Simulated contacts comment on big rolls.
119. Social memory records notable loot moments.
120. Recap records loot and roll outcomes.
121. Add source pity rules.
122. Pity increases after eligible clear.
123. Pity cannot create unsourced gear.
124. Pity can improve approved staged/eligible tables later.
125. Pity can grant extra materials or currency when gear does not drop.

## Adaptive Source-Law Clause

If this plan conflicts with source truth, source truth wins. Adjust the implementation, document the gap, or keep the affected reward staged/prototype until the source rows are approved.

