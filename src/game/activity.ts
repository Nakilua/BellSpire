import activityRecommendations from "../data/activityRecommendations.json";
import type { GameState } from "./types";

export interface ActivityRecommendation {
  id: string;
  lane: "Story" | "Social" | "Dungeon" | "Map" | "Loot" | "Guild";
  label: string;
  title: string;
  summary: string;
  command: string;
  mapPing: string;
  sourceNote: string;
}

const recommendations = activityRecommendations as ActivityRecommendation[];

export function getActivityRecommendations(state: GameState) {
  return recommendations
    .map((recommendation) => ({
      ...recommendation,
      available: isAvailable(state, recommendation),
      completed: isCompleted(state, recommendation),
      cooldown: state.social.activityRecommendations.cooldowns[recommendation.id] ?? 0
    }))
    .filter((recommendation) => recommendation.available && !recommendation.completed && recommendation.cooldown <= state.livingWorld.tick)
    .sort((left, right) => laneRank(left.lane) - laneRank(right.lane));
}

export function getBestActivityRecommendation(state: GameState) {
  return getActivityRecommendations(state)[0] ?? recommendations.find((entry) => entry.id === "cryptlet-report") ?? recommendations[0];
}

export function markActivityUsed(state: GameState, id: string): GameState {
  return {
    ...state,
    social: {
      ...state.social,
      activityRecommendations: {
        ...state.social.activityRecommendations,
        lastAcceptedId: id,
        cooldowns: {
          ...state.social.activityRecommendations.cooldowns,
          [id]: state.livingWorld.tick + 3
        }
      }
    }
  };
}

function isAvailable(state: GameState, recommendation: ActivityRecommendation) {
  switch (recommendation.id) {
    case "first-road-start":
      return state.locationPoiId === "saint-veyra-capital";
    case "social-lfg":
      return !state.social.groupListings.some((listing) => listing.id === "cryptlet-training-lfg" && listing.status === "joined");
    case "little-dawn-shrine":
      return state.locationPoiId === "road-shrine-little-dawn" && !state.flags.ollaPermission;
    case "cryptlet-entry":
      return state.locationPoiId === "road-shrine-little-dawn" && Boolean(state.flags.ollaPermission) && !state.dungeon;
    case "cryptlet-report":
      return Boolean(state.flags.cryptletComplete) && state.social.guildContracts.some((contract) => contract.status === "complete");
    default:
      return true;
  }
}

function isCompleted(state: GameState, recommendation: ActivityRecommendation) {
  switch (recommendation.id) {
    case "first-road-start":
      return state.sessionRecap.visited.includes("Hearthmere Fields");
    case "social-lfg":
      return state.social.groupListings.some((listing) => listing.id === "cryptlet-training-lfg" && listing.status === "joined");
    case "little-dawn-shrine":
      return Boolean(state.flags.ollaPermission);
    case "cryptlet-entry":
      return Boolean(state.dungeon);
    case "cryptlet-report":
      return !state.social.guildContracts.some((contract) => contract.status === "complete");
    default:
      return false;
  }
}

function laneRank(lane: ActivityRecommendation["lane"]) {
  const ranks: Record<ActivityRecommendation["lane"], number> = {
    Story: 0,
    Social: 1,
    Dungeon: 2,
    Guild: 3,
    Loot: 4,
    Map: 5
  };
  return ranks[lane];
}
