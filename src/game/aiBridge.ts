import canonContextPacks from "../data/canonContextPacks.json";
import canonRegistry from "../data/canonRegistry.json";
import { inferIntent } from "./director";
import { getNarrativeStatus } from "./narrativeDirector";
import { getCurrentPoi, getCurrentRoom } from "./selectors";
import type { GameState } from "./types";

export interface LiveDirectorReply {
  speaker: string;
  role: string;
  body: string;
}

export interface LiveDirectorResult {
  ok: boolean;
  provider?: "openai";
  mode?: "live" | "cinematic";
  model?: string;
  estimatedCostUsd?: number;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  budgetStatus?: string;
  intent?: string;
  mood?: string;
  topic?: string;
  memory?: string;
  replies?: LiveDirectorReply[];
  error?: string;
  fallbackReason?: string;
}

const AI_ENDPOINT = "http://127.0.0.1:8787/api/ai/director";
const STATUS_ENDPOINT = "http://127.0.0.1:8787/api/ai/status";

export async function fetchAiStatus() {
  const response = await fetch(STATUS_ENDPOINT);
  if (!response.ok) {
    throw new Error("AI bridge status unavailable");
  }
  return response.json() as Promise<{
    ok: boolean;
    hasKey: boolean;
    mode: string;
    liveModel: string;
    cinematicModel: string;
  }>;
}

export async function requestLiveDirector(state: GameState, channelId: string, message: string): Promise<LiveDirectorResult> {
  const intent = inferIntent(message);
  const response = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      channelId,
      message,
      intent,
      qualityMode: state.social.director.qualityMode,
      budget: {
        estimatedSpendUsd: state.social.director.estimatedSpendUsd,
        monthlyBudgetUsd: state.social.director.monthlyBudgetUsd,
        warnAtUsd: state.social.director.warnAtUsd,
        strongWarnAtUsd: state.social.director.strongWarnAtUsd,
        stopAtUsd: state.social.director.stopAtUsd
      },
      gameSnapshot: createGameSnapshot(state, message)
    })
  });

  const body = (await response.json()) as LiveDirectorResult;
  if (!response.ok) {
    return {
      ...body,
      ok: false
    };
  }

  return body;
}

function createGameSnapshot(state: GameState, message: string) {
  const poi = getCurrentPoi(state);
  const room = getCurrentRoom(state);
  const narrative = getNarrativeStatus(state);

  return {
    location: {
      id: state.locationPoiId,
      name: poi.name,
      scene: poi.scene,
      services: poi.services,
      exits: poi.exits
    },
    room: room
      ? {
          id: room.id,
          name: room.name,
          scene: room.scene,
          lesson: room.lesson,
          type: room.type
        }
      : undefined,
    character: {
      name: state.character.name,
      className: state.character.className,
      origin: state.character.origin,
      vow: state.character.vow,
      level: state.character.level,
      lane: state.character.lane,
      hp: state.character.hp,
      maxHp: state.character.maxHp,
      oath: state.character.oath
    },
    narrative: {
      arcTitle: narrative.arcTitle,
      stageTitle: narrative.stageTitle,
      stageSummary: narrative.stageSummary,
      nextHint: narrative.nextHint,
      tension: narrative.tension,
      tensionLabel: narrative.tensionLabel,
      seenBeatCount: narrative.seenBeatCount,
      lastBeatId: narrative.lastBeatId
    },
    recentParty: state.social.recentParty,
    contacts: state.social.contacts.map((contact) => ({
      name: contact.name,
      role: contact.role,
      kind: contact.kind,
      trust: contact.trust,
      availability: contact.availability,
      relationshipTag: contact.relationshipTag,
      notes: contact.notes.slice(0, 3),
      voice: contact.voice
    })),
    memories: state.social.director.memories.slice(-8).map((memory) => ({
      topic: memory.topic,
      summary: memory.summary,
      contacts: memory.contacts
    })),
    canonContext: selectCanonContext(state, message),
    canonRegistrySummary: {
      zones: canonRegistry.summary.zones,
      dungeons: canonRegistry.summary.dungeons,
      lootItems: canonRegistry.summary.lootItems,
      rarityRows: canonRegistry.summary.rarityRows,
      hardViolations: canonRegistry.summary.hardViolations,
      sourceFiles: canonRegistry.summary.sourceFiles,
      researchReferences: canonRegistry.summary.researchReferences,
      sourceAuthority: canonRegistry.sourceAuthority.map((tier) => ({
        tier: tier.tier,
        label: tier.label,
        authority: tier.authority,
        sourceNames: tier.sources.slice(0, 8).map((source) => source.name)
      })),
      researchNames: canonRegistry.researchReferences.slice(0, 10).map((source) => source.name)
    },
    storyPressure: state.social.director.storyPressure,
    budgetStatus: state.social.director.budgetStatus,
    quests: state.quests,
    flags: state.flags
  };
}

function selectCanonContext(state: GameState, message: string) {
  const room = getCurrentRoom(state);
  const haystack = [
    state.locationPoiId,
    state.activeChannelId,
    room?.id,
    room?.name,
    state.social.recentParty.join(" "),
    message,
    state.social.director.lastIntent,
    state.social.director.memories.slice(-3).map((memory) => memory.summary).join(" ")
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return canonContextPacks
    .filter((pack) => pack.id === "canon-rules" || pack.keywords.some((keyword) => haystack.includes(keyword)))
    .slice(0, 5);
}
