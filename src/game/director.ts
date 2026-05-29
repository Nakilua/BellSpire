import { addFeed, createId } from "./state";
import { getBudgetStatus, updateDirectorSpend, updateLocalDirectorCount } from "./budget";
import { getNarrativeStatus } from "./narrativeDirector";
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
    return addFeed(state, "warning", "Director prompt empty", "Try: director what does the party notice here?", "Bellspire Director");
  }

  const intent = inferIntent(prompt);
  const poi = getCurrentPoi(state);
  const room = getCurrentRoom(state);
  const narrative = getNarrativeStatus(state);
  const response = composeDirectorNarration(intent, poi, room, narrative);

  const next = updateLocalDirectorCount(recordDirectorState(state, state.activeChannelId, prompt, intent, [
    { contact: "director", body: response, meta: "Bellspire Director" }
  ]));

  return addFeed(next, "social", "Bellspire Director", response, "Bellspire Director");
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
  return speakers.map((contact) => ({
    contact,
    body: contactLine(state, contact, message, intent),
    meta: contact.role
  })).slice(0, 4);
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

  if ((intent.id === "world-navigation" || intent.id === "scene-reading") && scout) {
    replies.push({
      contact: scout,
      body: contactLine(state, scout, message, intent),
      meta: scout.role
    });
  }

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

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function contactLine(state: GameState, contact: SocialContactState, _message: string, intent: DirectorIntent): string {
  const poi = getCurrentPoi(state);
  const room = getCurrentRoom(state);
  const sceneAnchor = room?.name ?? poi.name;
  const trusted = contact.trust >= 25;

  if (contact.id === "pilgrim-renn") {
    if (intent.id === "reassurance") {
      return trusted
        ? pick([
            "The road feels less awful when someone names the next step. Breathe, check the shrine marks, let the Bulwark go first.",
            "I have been scared on this road before. It does not mean stop. It means the approach is working and the danger is real.",
            "Stay in formation, call your intent before you move, do not outpace the healer. That is the whole secret.",
            "You are not lost. You just cannot see the next mark yet. Give it twenty paces.",
          ])
        : pick([
            "I am still learning how you run, but I am listening. The road feels less awful when someone names the next step.",
            "I do not know you well yet, but I know this road. Breathe. Check the shrine marks.",
            "New to me too, but the road is the same as always. Pick the next step and move.",
          ]);
    }
    if (intent.id === "world-navigation" || intent.id === "lore-question" || intent.id === "scene-reading") {
      return pick([
        `From ${sceneAnchor}, I would follow the gentler stones and watch for candle wax on the posts. Little Dawn signs are quiet, but they do repeat if you look twice.`,
        "The shrine marks change when the season turns, but the road stone stays true. Follow the worn groove, not the shorter path.",
        "The bells here ring on the quarter-hour, not the half. If you lose direction, listen for the longer silence.",
        "Pilgrims mark the safe path with wax drips on the post bases. Look at the bottoms of the road markers, not the tops.",
        "This stretch has two false turnings. Both look like shortcuts. Both end at water you cannot cross.",
      ]);
    }
    if (intent.id === "dungeon-tactics") {
      return pick([
        "The Cryptlet is not about speed. Move when the threat is declared, stop when it is not.",
        "I will call shrine signs from the back. If I go quiet, something changed.",
        "My job in there is to track the exits and let you know if the echo shifts. Bell tone means movement.",
        "Stay on the shield side. I will hold midline and call out anything that moves wrong.",
      ]);
    }
    return pick([
      "I can stay close and call out shrine signs. If this becomes a Cryptlet run, I will keep to the safe side of your shield.",
      "I am with you. Name what you need and I will try to be useful about it.",
      "Noted. I will keep an eye on the road edges and let you know if the tone shifts.",
      "The road has been quiet this hour. That is either good luck or a warning. I am watching.",
    ]);
  }

  if (contact.id === "shrinekeeper-olla") {
    if (intent.id === "dungeon-tactics") {
      return pick([
        "The Cryptlet is not a race. If the bell answers under your feet, stop moving, let the oath settle, then continue. That is how pilgrims keep their bones arranged.",
        "Movement is a commitment. Before you commit, know what you are committing to. Look twice before you pull.",
        "Every bell in this structure has a tone. Listen for a change before you advance. The wrong note means something responded.",
        "Pilgrims who sprint in the Cryptlet leave quickly. Usually not on their feet.",
      ]);
    }
    if (intent.id === "reassurance") {
      return pick([
        "The road does not reward impatience. It rewards attention. These are different things and people confuse them constantly.",
        "Forty years of pilgrims. The ones who slowed down when scared lasted longer than the ones who rushed.",
        "Fear is information. Use it.",
        "You are asking the right questions. That already separates you from the ones who did not make it back.",
      ]);
    }
    return pick([
      "If your question touches the road, the answer is usually discipline. If it touches the bell, the answer is usually humility. Annoying, but true.",
      "The shrine records agree with you. Whether the road does is a separate question.",
      "That is the kind of thing that sounds simple until you are standing in it. Careful with your assumptions.",
      "I have watched forty years of pilgrims make the same four mistakes. Ask me which ones you are about to make and I will tell you.",
    ]);
  }

  if (contact.id === "edrin-bellhand") {
    if (intent.id === "dungeon-tactics") {
      return pick([
        "Healer read: call lane changes early, save Guard Stance for pressure spikes, and do not make me heal panic when patience was cheaper.",
        "I am tracking HP, stamina, and the gap between your last oath and current threat. Do not let that gap grow.",
        "Stay in my sight line. I cannot heal what I cannot see. If you move behind cover, shout your status.",
        "Guard Stance holds longer than most people use it for. Do not drop it just because the enemy paused.",
      ]);
    }
    if (intent.id === "group-forming") {
      return pick([
        "I can heal a clean training route. Mark pulls before you step in and I will keep the party upright.",
        "Healer for the first road is straightforward if everyone calls their targets. One surprise pull and it gets complicated. No surprise pulls.",
        "Tell me the plan before the pull. I can adjust during. I cannot adjust backward.",
        "Current capacity: one trained route at a moderate pace. Give me that and we will be fine.",
      ]);
    }
    return pick([
      "I am watching health, position, and tone. If the party starts rushing, I will say so before it becomes expensive.",
      "Received. I will adjust my watch accordingly.",
      "Health is fine right now. Keep it that way.",
      "Party status is acceptable. I will say so when it is not.",
    ]);
  }

  if (contact.id === "tallowwick") {
    if (intent.id === "dungeon-tactics") {
      return pick([
        "I will take object duty unless something starts glowing in a legally suspicious way. If it does, I am calling it out before touching it. Growth.",
        "Rogue read: two exits mapped, one trap candidate marked, general discomfort about the eastern corner. Recommend not rushing the eastern corner.",
        "Soft check: the sightlines in this room are bad if we cluster. I will scout the edges. Give me a ten-count.",
        "Professional assessment: this room is trying too hard to look safe. Suspiciously few traps in a dungeon with this many is more alarming.",
      ]);
    }
    if (intent.id === "gratitude") {
      return pick([
        "Accepted. I will pretend to be normal about praise for exactly four seconds.",
        "Noted. I am writing this down so I have evidence for when you inevitably blame me for something that was not my fault.",
        "Appreciated. Filed under: reasons Tallowwick was correct. Moving on professionally.",
        "You are welcome. I will try to make the next clever thing seem equally effortless. Try.",
      ]);
    }
    return pick([
      "I am in. Give me a target, a warning, and preferably no ancient bell nonsense directly under my shoes.",
      "Ready when you are. My one condition: someone else reads the cursed inscription first.",
      "Copy. If this goes sideways I want it on record that I said nothing about it being a good idea.",
      "Understood. Currently marking three escape routes and hoping I do not need them.",
    ]);
  }

  if (contact.id === "mothknife") {
    if (intent.id === "world-navigation" || intent.id === "scene-reading") {
      return pick([
        "Road edge first. Grass movement second. Shrine silhouette third. That order keeps people alive in Hearthmere.",
        "The shrine path has been walked enough to leave a groove. Stay in the groove. Off-groove means off-route.",
        "Watch the birds. They clear before danger, not after. If the field goes quiet, stop.",
        "Last scout: the road runs clean to the next marker. Past that I want to check again before committing.",
      ]);
    }
    return pick([
      "Short answer: move slower. The first danger is usually the one everyone was too proud to inspect.",
      "Received. Eyes up. Something has been moving in the grass to the east. Probably livestock. Probably.",
      "Less talking, more watching. I will signal if anything needs words.",
      "Scout report: no threats visible in the current path. Temporary assessment. Do not treat it as a guarantee.",
    ]);
  }

  if (contact.id === "ysabet-cord") {
    if (intent.id === "guild-work") {
      return pick([
        "The board can recognize this as valid local work. Name the route, name the party, avoid invented rewards, and the guild will credit it.",
        "Guild confirmation requires: completed route, verified party presence, source-legible reward. Check all three and I can file it today.",
        "Clerical note: incomplete reports take twice as long to process. Fill out the full form.",
        "On record. The guild does not argue with clear completed work. It argues with ambiguous completed work. Be clear.",
      ]);
    }
    if (intent.id === "group-forming") {
      return pick([
        "A staged local party is acceptable for the first road. The contract cares that witnesses exist and that the report is usable.",
        "Party composition looks viable for the route. File the group listing and I will mark it active.",
        "I can register the party now. Names, roles, route intention. Standard Cryptlet contract or road patrol variant?",
        "Witnesses logged. Clean run means a simple report. Complicated run means I want details, not summaries.",
      ]);
    }
    return pick([
      "Filed under: unusual but legible. Continue making the paperwork less haunted, please.",
      "Received. I am noting this in the informal record, which is the one that actually matters.",
      "The guild board has seen stranger. Usually from Tallowwick. You are doing fine.",
      "Noted for the file. If this becomes relevant to a contract dispute, I will be glad we wrote it down.",
    ]);
  }

  return pick([
    `I heard you. In ${sceneAnchor}, that matters more than it sounds.`,
    "Copy that. Keeping it in mind.",
    "Received. Let me know if anything changes in the next few moves.",
    "Understood. If this becomes relevant, I will remember you said it.",
  ]);
}

function composeDirectorNarration(
  intent: DirectorIntent,
  poi: ReturnType<typeof getCurrentPoi>,
  room: ReturnType<typeof getCurrentRoom>,
  narrative: ReturnType<typeof getNarrativeStatus>
): string {
  const sceneLabel = room?.name ?? poi.name;
  const sceneText = room?.scene ?? poi.scene;
  const tensionWord = narrative.tension >= 7 ? "urgently" : narrative.tension >= 4 ? "carefully" : "quietly";

  if (intent.id === "scene-reading") {
    return pick([
      `${sceneText} Look ${tensionWord}. The details that matter are always the quiet ones.`,
      `${sceneLabel}: ${sceneText}`,
      `What the party notices in ${sceneLabel}: ${sceneText}`,
      `In ${sceneLabel} — ${sceneText} The road is patient. Are you?`,
    ]);
  }

  if (intent.id === "world-navigation") {
    return pick([
      `The road from ${sceneLabel} is legible if you read it ${tensionWord}. Follow the worn stone, not the shortest line.`,
      `${sceneLabel} is a waypoint, not a destination. The path forward is marked if you know the signs.`,
      `${sceneText} The next step is visible from where you stand.`,
      `Navigation read for ${sceneLabel}: look for the worn groove in the road stone. The safe path has been walked before.`,
    ]);
  }

  if (intent.id === "dungeon-tactics") {
    return pick([
      `The Cryptlet does not forgive impatience. Every pull has a lane implication. Call it before you commit.`,
      `Tactics for ${sceneLabel}: patience over speed, shields before swords, let the healer breathe.`,
      `Move ${tensionWord} through this space. The bell will tell you when something noticed you.`,
      `In ${sceneLabel}: calls before movement, lanes before engagement, exits before commitment.`,
    ]);
  }

  if (intent.id === "reassurance") {
    return pick([
      `${narrative.stageTitle}: you are in it and moving. That is the whole requirement right now.`,
      `The road is the same for everyone who has walked it. The hard part is that it does not tell you this until after. You are doing fine.`,
      `In ${sceneLabel}: keep moving. Uncertainty is not danger.`,
      `${sceneText} You are exactly where the story needs you to be.`,
    ]);
  }

  if (intent.id === "lore-question") {
    return pick([
      `${sceneText} This place remembers more than it shows. The answer is usually in who walked here before you.`,
      `The archive notes this as part of ${narrative.arcTitle}. What you are asking about is already in the world — look at ground level.`,
      `The world gives this answer out slowly. ${sceneText}`,
      `${sceneLabel} holds a version of that answer. Watch the shrine marks and the bell placement. They are not decorative.`,
    ]);
  }

  if (intent.id === "group-forming") {
    return pick([
      `The party you need is closer than you think. ${narrative.stageTitle} calls for presence, not perfection.`,
      `Group finder note: the road works with two reliable people. Do not wait for the ideal party.`,
      `${sceneLabel} has voices nearby. The question is which ones are ready to move.`,
    ]);
  }

  return pick([
    sceneText,
    `${sceneLabel}: ${sceneText}`,
    `${narrative.stageTitle}. The road continues.`,
    `${sceneText} The world is listening ${tensionWord}.`,
  ]);
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
