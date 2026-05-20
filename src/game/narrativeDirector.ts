import narrativeArcs from "../data/narrativeArcs.json";
import { addFeed } from "./state";
import { getCurrentPoi, getCurrentRoom } from "./selectors";
import type { GameState } from "./types";

export type NarrativeTrigger = "story" | "dm" | "travel" | "talk" | "quest" | "dungeon" | "loot" | "listen" | "rest";

interface NarrativeStage {
  id: string;
  title: string;
  summary: string;
  nextHint: string;
}

interface NarrativeBeat {
  id: string;
  trigger: NarrativeTrigger;
  stageId: string;
  locationPoiId?: string;
  dungeonRoomId?: string;
  questId?: string;
  questStatus?: "inactive" | "active" | "complete";
  requiredFlag?: string;
  blockedFlag?: string;
  title: string;
  body: string;
  meta: string;
  tension: number;
  sourceNote: string;
}

const mainArc = narrativeArcs.mainArc;
const stages = mainArc.stages as NarrativeStage[];
const beats = narrativeArcs.beats as NarrativeBeat[];

export function pulseNarrative(state: GameState, trigger: NarrativeTrigger, options: { force?: boolean } = {}): GameState {
  const stage = resolveNarrativeStage(state);
  const primed = updateNarrativeState(state, stage, trigger);
  const beat = selectBeat(primed, trigger, stage, Boolean(options.force));

  if (!beat) {
    return options.force ? addCurrentSceneDmBeat(primed, stage) : primed;
  }

  return addNarrativeBeat(primed, beat, stage);
}

export function showNarrativeJournal(state: GameState): GameState {
  const stage = resolveNarrativeStage(state);
  const recentBeats = state.narrative.seenBeatIds
    .slice(-5)
    .map((id) => beats.find((beat) => beat.id === id)?.title)
    .filter(Boolean);
  const room = getCurrentRoom(state);
  const poi = getCurrentPoi(state);
  const tensionLabel = describeTension(state.narrative.tension);
  const body = [
    `Main arc: ${mainArc.title}`,
    mainArc.premise,
    "",
    `Current chapter: ${stage.title}`,
    stage.summary,
    "",
    `Current scene: ${room ? `${room.name} - ${room.scene}` : `${poi.name} - ${poi.scene}`}`,
    `DM tension: ${state.narrative.tension}/10 (${tensionLabel})`,
    `Last DM trigger: ${state.narrative.lastTrigger ?? "none"}`,
    "",
    "Recent narrative beats:",
    recentBeats.join("\n") || "No major narrative beats logged yet.",
    "",
    `Next: ${stage.nextHint}`,
    "Try `dm`, `story`, or `director give me a cinematic read of this moment`."
  ].join("\n");

  return addFeed(updateNarrativeState(state, stage, "story"), "recap", "Main Story Journal", body, "Narrative Director");
}

export function getNarrativeStatus(state: GameState) {
  const stage = resolveNarrativeStage(state);
  return {
    arcId: mainArc.id,
    arcTitle: mainArc.title,
    premise: mainArc.premise,
    stageId: stage.id,
    stageTitle: stage.title,
    stageSummary: stage.summary,
    nextHint: stage.nextHint,
    tension: state.narrative.tension,
    tensionLabel: describeTension(state.narrative.tension),
    lastBeatId: state.narrative.lastBeatId,
    seenBeatCount: state.narrative.seenBeatIds.length
  };
}

function addNarrativeBeat(state: GameState, beat: NarrativeBeat, stage: NarrativeStage): GameState {
  const seenBeatIds = unique([...state.narrative.seenBeatIds, beat.id]);
  const recapLine = `${stage.title}: ${beat.title.replace(/^DM:\s*/i, "")}`;
  const nextState: GameState = {
    ...state,
    narrative: {
      ...state.narrative,
      stageId: stage.id,
      lastBeatId: beat.id,
      tension: clamp(state.narrative.tension + beat.tension, 0, 10),
      seenBeatIds
    },
    sessionRecap: {
      ...state.sessionRecap,
      narrative: unique([...state.sessionRecap.narrative, recapLine]).slice(-16)
    }
  };

  return addFeed(nextState, "scene", beat.title, `${beat.body}\n\nSource note: ${beat.sourceNote}`, beat.meta);
}

function addCurrentSceneDmBeat(state: GameState, stage: NarrativeStage): GameState {
  const room = getCurrentRoom(state);
  const poi = getCurrentPoi(state);
  const currentScene = room ? `${room.name}: ${room.scene}` : `${poi.name}: ${poi.scene}`;
  const body = [
    stage.summary,
    "",
    `Right now: ${currentScene}`,
    "DM read: the scene should offer one sensory detail, one social reaction, and one useful next step. Nothing permanent becomes canon here unless the source files already support it."
  ].join("\n");

  return addFeed(state, "scene", `DM: ${stage.title}`, body, "Narrative Director / local DM");
}

function selectBeat(state: GameState, trigger: NarrativeTrigger, stage: NarrativeStage, force: boolean) {
  const candidates = beats.filter((beat) => {
    if (!force && beat.trigger !== trigger) {
      return false;
    }

    if (force && beat.trigger !== "dm" && beat.trigger !== trigger) {
      return false;
    }

    return beat.stageId === stage.id && !state.narrative.seenBeatIds.includes(beat.id) && matchesBeatState(state, beat);
  });

  return candidates[0];
}

function matchesBeatState(state: GameState, beat: NarrativeBeat) {
  const room = getCurrentRoom(state);
  if (beat.locationPoiId && state.locationPoiId !== beat.locationPoiId) {
    return false;
  }

  if (beat.dungeonRoomId && room?.id !== beat.dungeonRoomId) {
    return false;
  }

  if (beat.questId && state.quests[beat.questId]?.status !== beat.questStatus) {
    return false;
  }

  if (beat.requiredFlag && !state.flags[beat.requiredFlag]) {
    return false;
  }

  if (beat.blockedFlag && state.flags[beat.blockedFlag]) {
    return false;
  }

  return true;
}

function resolveNarrativeStage(state: GameState): NarrativeStage {
  const room = getCurrentRoom(state);
  const quest = state.quests["trial-under-little-dawn"];

  if (state.flags.cryptletComplete || quest?.status === "complete") {
    return getStage("road-seal-witness");
  }

  if (room?.id === "warden-chamber" || state.encounter?.id === "bellgrave-warden") {
    return getStage("warden-toll");
  }

  if (state.dungeon || state.locationPoiId === "pilgrim-trial-cryptlet") {
    return getStage("cryptlet-descent");
  }

  if (state.locationPoiId === "road-shrine-little-dawn" || state.flags.ollaPermission || quest?.status === "active") {
    return getStage("little-dawn-threshold");
  }

  if (state.locationPoiId === "hearthmere-crossing") {
    return getStage("hearthmere-crossing");
  }

  return getStage("first-road-summons");
}

function getStage(id: string) {
  return stages.find((stage) => stage.id === id) ?? stages[0];
}

function updateNarrativeState(state: GameState, stage: NarrativeStage, trigger: NarrativeTrigger): GameState {
  return {
    ...state,
    narrative: {
      ...state.narrative,
      arcId: mainArc.id,
      stageId: stage.id,
      lastTrigger: trigger
    }
  };
}

function describeTension(tension: number) {
  if (tension >= 8) {
    return "the bell is loud";
  }
  if (tension >= 5) {
    return "pressure is rising";
  }
  if (tension >= 2) {
    return "watchful";
  }
  return "quiet";
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
