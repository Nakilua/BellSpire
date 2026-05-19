# AI Director Skill

Use this skill when changing AI Director prompts, NPC dialogue, simulated-player behavior, party chat, guild chat, global/zone chatter, or cinematic narration.

## Goal

The AI Director should make BellSpire feel alive while the app keeps control of state, rewards, and rules.

## Rules

- The AI may speak as NPCs and simulated players.
- The AI may add atmosphere, emotional nuance, and social texture.
- The AI must stay inside supplied canon context and source-governed state.
- The AI must not invent permanent loot, rename canon, claim real multiplayer, or mutate game state by itself.
- Ambient chatter should stay local unless the player directly asks for an AI response.
- Normal social chat should use the live/mini model when available.
- Major lore, emotional, boss, vow, and cathedral-door moments may use cinematic quality.
- Local fallback must remain playable when the API is offline or budget stops.

## Done Means

- Replies sound like believable people in BellSpire, not generic assistant output.
- The UI clearly shows fallback, budget, or model state when relevant.
- Source law remains intact.
- `npm.cmd run build` passes.
