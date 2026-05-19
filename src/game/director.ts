import { addFeed, createId } from "./state";
import { getBudgetStatus, updateDirectorSpend, updateLocalDirectorCount } from "./budget";
import { getCurrentPoi, getCurrentRoom } from "./selectors";
import type { GameState, SocialContactState } from "./types";

export interface DirectorReply {
  contact: SocialContactState | "director";
  body: string;
  meta: string;
}

export interface DirectorIntent {
  id: string;
  mood: string;
  topic: string;
  pressure: number;
}

export interface ExternalDirectorReply {
  speaker: string;
  role: string;
  body: string;
}

export interface ExternalDirectorResult {
  provider: "openai";
  mode: "live" | "cinematic";
  model: string;
  estimatedCostUsd: number;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  budgetStatus?: string;
  fallbackReason?: string;
  intent: string;
  mood: string;
  topic: string;
  memory: string;
  replies: ExternalDirectorReply[];
}

export function runDirectorChat(state: GameState, channelId: "party-chat" | "guild-board", message: string): GameState {
  const intent = inferIntent(message);
  const replies = channelId === "guild-board" ? composeGuildReplies(state, message, intent) : composePartyReplies(state, message, intent);
  let next = updateLocalDirectorCount(recordDirectorState(state, channelId, message, intent, replies));

  for (const reply of replies) {
    if (reply.contact === "director") {
      next = addFeed(next, "social", "Bellspire Director", reply.body, reply.meta);
    } else {
      next = addFeed(next, "social", reply.contact.name, reply.body, reply.contact.role);
    }
  }

  return next;
}

export function applyExternalDirectorChat(
  state: GameState,
  channelId: string,
  message: string,
  result: ExternalDirectorResult
): GameState {
  const intent: DirectorIntent = {
    id: result.intent,
    mood: result.mood,
    topic: result.topic,
    pressure: result.mode === "cinematic" ? 2 : 1
  };
  const replies = result.replies.slice(0, 4).map((reply) => ({
    contact: state.social.contacts.find((contact) => contact.name.toLowerCase() === reply.speaker.toLowerCase()) ?? ("director" as const),
    body: reply.body,
    meta: `${reply.speaker} / ${reply.role}`
  }));
  let next = recordDirectorState(state, channelId, message, intent, replies);
  next = updateDirectorSpend(next, result.estimatedCostUsd, result.mode);

  next = {
    ...next,
    social: {
      ...next.social,
      director: {
        ...next.social.director,
        mode: "api-ready",
        lastProvider: "openai",
        lastModel: result.model,
        lastFallbackReason: result.fallbackReason,
        budgetStatus: getBudgetStatus(next.social.director)
      }
    }
  };

  for (const reply of result.replies.slice(0, 4)) {
    next = addFeed(next, "social", reply.speaker, reply.body, `${reply.role} / ${result.model}`);
  }

  return next;
}

export function markDirectorFallback(state: GameState, reason: string): GameState {
  return {
    ...state,
    social: {
      ...state.social,
      director: {
        ...state.social.director,
        mode: "local-sim",
        lastProvider: "local",
        lastModel: undefined,
        lastCostUsd: 0,
        lastFallbackReason: reason
      }
    }
  };
}

export function runDirectorPrompt(state: GameState, prompt: string): GameState {
  if (!prompt.trim()) {
    return addFeed(state, "warning", "Director prompt empty", "Try `director what does the party notice here?`.", "Bellspire Director");
  }

  const intent = inferIntent(prompt);
  const poi = getCurrentPoi(state);
  const room = getCurrentRoom(state);
  const contacts = getRecentContacts(state).slice(0, 3);
  const localScene = room ? `${room.name}: ${room.scene}` : `${poi.name}: ${poi.scene}`;
  const response = [
    `The local Director reads this as ${intent.topic}.`,
    `Current scene: ${localScene}`,
    contacts.length
      ? `Likely voices: ${contacts.map((contact) => `${contact.name} (${contact.relationshipTag})`).join(", ")}.`
      : "No staged party voices are committed yet.",
    directorNudge(intent, state)
  ].join("\n");

  const next = updateLocalDirectorCount(recordDirectorState(state, state.activeChannelId, prompt, intent, [
    {
      contact: "director",
      body: response,
      meta: "local AI Director"
    }
  ]));

  return addFeed(next, "social", "Bellspire Director", response, "local AI Director");
}

export function showDirectorMemory(state: GameState): GameState {
  const memories = state.social.director.memories;
  if (!memories.length) {
    return addFeed(state, "social", "Director memory", "No social memories logged yet. Post in party chat, join a group, or ask the Director something.", "local AI Director");
  }

  const body = memories
    .slice(-8)
    .reverse()
    .map((memory) => `${memory.topic} / ${memory.channelId}\n${memory.summary}\nContacts: ${memory.contacts.join(", ") || "none"}`)
    .join("\n\n");

  return addFeed(state, "social", "Director memory", body, "local AI Director");
}

export function inferIntent(message: string): DirectorIntent {
  const lower = message.toLowerCase();

  if (includesAnyWord(lower, ["thank", "thanks", "appreciate"])) {
    return { id: "gratitude", mood: "warm", topic: "relationship building", pressure: 0 };
  }

  if (includesAny(lower, ["notice", "look around", "around us", "around me", "current scene", "what is here"])) {
    return { id: "scene-reading", mood: "observant", topic: "scene reading", pressure: 1 };
  }

  if (includesAny(lower, ["lfg", "group", "party finder", "party up", "invite", "healer", "dps", "tank"])) {
    return { id: "group-forming", mood: "practical", topic: "forming a party", pressure: 1 };
  }

  if (includesAny(lower, ["cryptlet", "dungeon", "warden", "boss", "pull", "lane", "combat", "guard", "oath"])) {
    return { id: "dungeon-tactics", mood: "focused", topic: "dungeon tactics", pressure: 2 };
  }

  if (includesAny(lower, ["road", "shrine", "hearthmere", "saint veyra", "map", "where", "travel"])) {
    return { id: "world-navigation", mood: "watchful", topic: "road travel", pressure: 1 };
  }

  if (includesAny(lower, ["contract", "guild", "reward", "credit", "board"])) {
    return { id: "guild-work", mood: "official", topic: "guild work", pressure: 1 };
  }

  if (includesAny(lower, ["scared", "nervous", "worried", "alone", "help", "new"])) {
    return { id: "reassurance", mood: "gentle", topic: "party reassurance", pressure: 0 };
  }

  if (includesAny(lower, ["lore", "why", "who", "what is", "tell me", "remember"])) {
    return { id: "lore-question", mood: "curious", topic: "world lore", pressure: 1 };
  }

  return { id: "ambient-chat", mood: "social", topic: "ambient party chat", pressure: 0 };
}

function composePartyReplies(state: GameState, message: string, intent: DirectorIntent): DirectorReply[] {
  const speakers = choosePartySpeakers(state, intent);
  const replies: DirectorReply[] = speakers.map((contact) => ({
    contact,
    body: contactLine(state, contact, message, intent),
    meta: contact.role
  }));

  if (intent.id === "dungeon-tactics" || intent.id === "world-navigation" || intent.id === "scene-reading") {
    replies.push({
      contact: "director",
      body: directorNudge(intent, state),
      meta: "local AI Director"
    });
  }

  return replies.slice(0, 4);
}

function composeGuildReplies(state: GameState, message: string, intent: DirectorIntent): DirectorReply[] {
  const clerk = state.social.contacts.find((contact) => contact.id === "ysabet-cord");
  const scout = state.social.contacts.find((contact) => contact.id === "mothknife" && contact.availability !== "busy");
  const replies: DirectorReply[] = [];

  if (clerk) {
    replies.push({
      contact: clerk,
      body: contactLine(state, clerk, message, intent),
      meta: clerk.role
    });
  }

  if (intent.id === "world-navigation" && scout) {
    replies.push({
      contact: scout,
      body: contactLine(state, scout, message, intent),
      meta: scout.role
    });
  }

  replies.push({
    contact: "director",
    body: directorNudge(intent, state),
    meta: "local AI Director"
  });

  return replies;
}

function choosePartySpeakers(state: GameState, intent: DirectorIntent) {
  const ids = new Set<string>();
  const recent = getRecentContacts(state);

  for (const contact of recent) {
    ids.add(contact.id);
  }

  if (intent.id === "group-forming") {
    ids.add("edrin-bellhand");
    ids.add("tallowwick");
  }

  if (intent.id === "dungeon-tactics") {
    ids.add("edrin-bellhand");
    ids.add("tallowwick");
    ids.add("pilgrim-renn");
  }

  if (intent.id === "world-navigation" || intent.id === "lore-question" || intent.id === "scene-reading") {
    ids.add("pilgrim-renn");
    ids.add("shrinekeeper-olla");
  }

  if (intent.id === "reassurance" || intent.id === "gratitude") {
    ids.add("pilgrim-renn");
    ids.add("edrin-bellhand");
  }

  if (ids.size === 0) {
    ids.add("pilgrim-renn");
    ids.add("tallowwick");
  }

  return [...ids]
    .map((id) => state.social.contacts.find((contact) => contact.id === id))
    .filter(Boolean)
    .sort((left, right) => availabilityRank(left!) - availabilityRank(right!) || right!.trust - left!.trust)
    .slice(0, 3) as SocialContactState[];
}

function contactLine(state: GameState, contact: SocialContactState, message: string, intent: DirectorIntent) {
  const poi = getCurrentPoi(state);
  const room = getCurrentRoom(state);
  const sceneAnchor = room?.name ?? poi.name;
  const trust = contact.trust >= 25 ? "You have been reliable enough that I will be plain with you." : "I am still learning how you run, but I am listening.";

  if (contact.id === "pilgrim-renn") {
    if (intent.id === "reassurance") {
      return `${trust} The road feels less awful when someone names the next step. For now, breathe, check the shrine marks, and let the Bulwark go first.`;
    }
  if (intent.id === "world-navigation" || intent.id === "lore-question" || intent.id === "scene-reading") {
      return `From ${sceneAnchor}, I would follow the gentler stones and watch for candle wax on the posts. Little Dawn signs are quiet, but they do repeat if you look twice.`;
    }
    return `I can stay close and call out shrine signs. If this becomes a Cryptlet run, I will keep to the safe side of your shield.`;
  }

  if (contact.id === "shrinekeeper-olla") {
    if (intent.id === "dungeon-tactics") {
      return `The Cryptlet is not a race. If the bell answers under your feet, stop moving, let the oath settle, then continue. That is how pilgrims keep their bones arranged.`;
    }
    return `If your question touches the road, the answer is usually discipline. If it touches the bell, the answer is usually humility. Annoying, but true.`;
  }

  if (contact.id === "edrin-bellhand") {
    if (intent.id === "dungeon-tactics") {
      return `Healer read: call lane changes early, save Guard Stance for pressure spikes, and do not make me heal panic when patience was cheaper.`;
    }
    if (intent.id === "group-forming") {
      return `I can heal a clean training route. Mark pulls before you step in and I will keep the party upright.`;
    }
    return `I am watching health, position, and tone. If the party starts rushing, I will say so before it becomes expensive.`;
  }

  if (contact.id === "tallowwick") {
    if (intent.id === "dungeon-tactics") {
      return `I will take object duty unless something starts glowing in a legally suspicious way. If it does, I am calling it out before touching it. Growth.`;
    }
    if (intent.id === "gratitude") {
      return `Accepted. I will pretend to be normal about praise for exactly four seconds.`;
    }
    return `I am in. Give me a target, a warning, and preferably no ancient bell nonsense directly under my shoes.`;
  }

  if (contact.id === "mothknife") {
    if (intent.id === "world-navigation") {
      return `Road edge first. Grass movement second. Shrine silhouette third. That order keeps people alive in Hearthmere.`;
    }
    return `Short answer: move slower. The first danger is usually the one everyone was too proud to inspect.`;
  }

  if (contact.id === "ysabet-cord") {
    if (intent.id === "guild-work") {
      return `The board can recognize this as valid local work. Name the route, name the party, avoid invented rewards, and the guild will credit it.`;
    }
    if (intent.id === "group-forming") {
      return `A staged local party is acceptable for the first road. The contract cares that witnesses exist and that the report is usable.`;
    }
    return `Filed under: unusual but legible. Continue making the paperwork less haunted, please.`;
  }

  return `I heard you. In ${sceneAnchor}, that matters more than it sounds.`;
}

function directorNudge(intent: DirectorIntent, state: GameState) {
  const poi = getCurrentPoi(state);
  const room = getCurrentRoom(state);

  if (intent.id === "group-forming") {
    return "Director note: this is a social setup beat. The world should answer with availability, role confidence, and one small personality tell from each contact.";
  }

  if (intent.id === "dungeon-tactics") {
    return `Director note: pressure rises around ${room?.name ?? "the next pull"}. Good replies should mention lanes, patience, and one concrete action the party can follow.`;
  }

  if (intent.id === "world-navigation") {
    return `Director note: anchor the answer in ${poi.name}. The map should feel physical: roads, shrine signs, fields, bells, and who knows the path.`;
  }

  if (intent.id === "scene-reading") {
    return `Director note: describe ${room?.name ?? poi.name} through what the party can notice now: texture, danger, nearby voices, and one actionable clue.`;
  }

  if (intent.id === "guild-work") {
    return "Director note: the guild board should sound official, useful, and strict about canon rewards.";
  }

  if (intent.id === "reassurance") {
    return "Director note: the party should steady the player without breaking character. Give one next step, not a lecture.";
  }

  if (intent.id === "lore-question") {
    return "Director note: answer through a character viewpoint first, then leave a small mystery hook.";
  }

  return "Director note: keep it human, brief, and grounded in the current road instead of turning into generic fantasy chatter.";
}

function recordDirectorState(state: GameState, channelId: string, message: string, intent: DirectorIntent, replies: DirectorReply[]): GameState {
  const contacts = replies.map((reply) => (reply.contact === "director" ? "Bellspire Director" : reply.contact.name));
  const memory = {
    id: createId("memory"),
    channelId,
    topic: intent.topic,
    summary: shortTopic(message),
    contacts: unique(contacts),
    weight: Math.max(1, intent.pressure + contacts.length)
  };

  return {
    ...state,
    social: {
      ...state.social,
      director: {
        ...state.social.director,
        lastIntent: intent.id,
        lastMood: intent.mood,
        storyPressure: clamp(state.social.director.storyPressure + intent.pressure, 0, 10),
        memories: [...state.social.director.memories, memory].slice(-24)
      }
    }
  };
}

function getRecentContacts(state: GameState) {
  return state.social.recentParty
    .map((name) => state.social.contacts.find((contact) => contact.name === name))
    .filter(Boolean) as SocialContactState[];
}

function availabilityRank(contact: SocialContactState) {
  if (contact.availability === "online") {
    return 0;
  }
  if (contact.availability === "busy") {
    return 1;
  }
  return 2;
}

function shortTopic(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 120);
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function includesAnyWord(value: string, terms: string[]) {
  return terms.some((term) => new RegExp(`\\b${escapeRegExp(term)}\\b`, "i").test(value));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
