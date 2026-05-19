import type { DirectorState, GameState } from "./types";

export function getBudgetStatus(director: DirectorState): DirectorState["budgetStatus"] {
  if (director.estimatedSpendUsd >= director.stopAtUsd) {
    return "stopped";
  }
  if (director.estimatedSpendUsd >= director.strongWarnAtUsd) {
    return "strong-warn";
  }
  if (director.estimatedSpendUsd >= director.warnAtUsd) {
    return "warn";
  }
  return "safe";
}

export function shouldUseLocalDirector(state: GameState) {
  return state.social.director.qualityMode === "local" || getBudgetStatus(state.social.director) === "stopped";
}

export function updateDirectorSpend(state: GameState, amountUsd: number, mode: "live" | "cinematic"): GameState {
  const nextSpend = roundUsd(state.social.director.estimatedSpendUsd + Math.max(0, amountUsd));
  const nextDirector: DirectorState = {
    ...state.social.director,
    lastCostUsd: roundUsd(amountUsd),
    estimatedSpendUsd: nextSpend,
    budgetStatus: getBudgetStatus({
      ...state.social.director,
      estimatedSpendUsd: nextSpend
    }),
    liveTurnCount: state.social.director.liveTurnCount + (mode === "live" ? 1 : 0),
    cinematicTurnCount: state.social.director.cinematicTurnCount + (mode === "cinematic" ? 1 : 0)
  };

  return {
    ...state,
    social: {
      ...state.social,
      director: nextDirector
    }
  };
}

export function updateLocalDirectorCount(state: GameState): GameState {
  return {
    ...state,
    social: {
      ...state.social,
      director: {
        ...state.social.director,
        lastCostUsd: 0,
        budgetStatus: getBudgetStatus(state.social.director),
        localTurnCount: state.social.director.localTurnCount + 1
      }
    }
  };
}

export function roundUsd(value: number) {
  return Math.round(value * 10000) / 10000;
}
