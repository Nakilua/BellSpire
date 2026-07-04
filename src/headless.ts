// Headless entry point: everything a Node process (replay harness, future
// realm simulation) needs to run the BellSpire core without a browser.
// Nothing in this module graph may touch window, document, or localStorage.

export { configureDeterministicIds, createInitialState, sanitizeImportedState } from "./game/state";
export { runCommand } from "./game/commands";
export { getCurrentPoi, getCurrentRoom, getCurrentZone } from "./game/selectors";
export type { CharacterCreationInput, GameState } from "./game/types";
