import channels from "../data/channels.json";
import dungeons from "../data/dungeons.json";
import focusOptions from "../data/locationFocusOptions.json";
import mapServices from "../data/mapServices.json";
import npcs from "../data/npcs.json";
import npcTopics from "../data/npcTopics.json";
import pois from "../data/pois.json";
import quests from "../data/quests.json";
import travelRoutes from "../data/travelRoutes.json";
import zones from "../data/zones.json";
import { getBestActivityRecommendation, markActivityUsed } from "./activity";
import { performCombatAction, startEncounter } from "./combat";
import { postWorldChat, pulseLivingWorld, showNearbyWorld } from "./livingWorld";
import { grantCryptletRewards, resolveCryptletLootRoll } from "./loot";
import { pulseNarrative, showNarrativeJournal } from "./narrativeDirector";
import { addFeed, createId, createNotice } from "./state";
import { getActiveDungeon, getBulwarkAbilities, getCurrentPoi, getCurrentRoom, getCurrentZone, getQuestDefinition } from "./selectors";
import { handleSocialCommand, progressGuildContract, recordContactMemory, setPartyReadiness } from "./social";
import type { GameState } from "./types";

interface TravelStageDefinition {
  id: string;
  title: string;
  body: string;
  meta: string;
  objective: string;
  mapPing: string;
  partyLine: string;
  zoneLine: string;
}

interface TravelRouteDefinition {
  id: string;
  fromPoiId: string;
  toPoiId: string;
  label: string;
  aliases: string[];
  sourceNote: string;
  stages: TravelStageDefinition[];
}

interface FocusOptionDefinition {
  id: string;
  locationPoiId?: string;
  dungeonRoomId?: string;
  label: string;
  aliases: string[];
  title: string;
  body: string;
  meta: string;
  suggestedCommands: string[];
  partyLine: string;
  objective: string;
  mapPing: string;
  sourceNote: string;
}

interface NpcTopicDefinition {
  id: string;
  npcId: string;
  topic: string;
  aliases: string[];
  title: string;
  response: string;
  flagResponses?: { flag: string; value: boolean | number | string; response: string }[];
  sourceNote: string;
}

interface MapServiceDefinition {
  id: string;
  zoneId: string;
  poiId?: string;
  label: string;
  kind: string;
  x: number;
  y: number;
  summary: string;
  sourceNote: string;
}

const stagedTravelRoutes = travelRoutes as TravelRouteDefinition[];
const firstRoadFocusOptions = focusOptions as FocusOptionDefinition[];
const firstRoadNpcTopics = npcTopics as NpcTopicDefinition[];
const firstRoadMapServices = mapServices as MapServiceDefinition[];

export function runCommand(state: GameState, rawCommand: string): GameState {
  const raw = rawCommand.trim();
  if (!raw) {
    return state;
  }

  const socialCommand = handleSocialCommand(state, raw);
  if (socialCommand) {
    return socialCommand;
  }

  let next = addFeed(state, "command", `> ${raw}`, "Command received.", state.activeChannelId);
  const command = raw.toLowerCase();

  if (command.startsWith("channel ")) {
    return switchChannel(next, raw.slice("channel ".length).trim());
  }

  if (command === "look") {
    return look(next);
  }

  if (command === "map") {
    return showMap(next);
  }

  if (command === "listen" || command === "wait" || command === "world pulse" || command === "social pulse" || command === "pulse") {
    return pulseNarrative(pulseLivingWorld(next, "listen"), "listen");
  }

  if (command === "who" || command === "nearby") {
    return showNearbyWorld(next);
  }

  if (command === "checklist" || command === "first road") {
    return showFirstRoadChecklist(next);
  }

  if (command === "activity" || command === "recommendation" || command === "next step") {
    return showActivityRecommendation(next);
  }

  if (command === "what should i do" || command === "what should i do?" || command === "help me choose") {
    return showContextualAdvice(next);
  }

  if (command === "explore" || command === "search" || command === "observe" || command === "look deeper" || command === "what do i notice" || command === "what do i notice?") {
    return showFocusOptions(next);
  }

  if (command.startsWith("explore ") || command.startsWith("search ") || command.startsWith("observe ") || command.startsWith("look deeper ")) {
    return exploreFocus(next, raw.replace(/^(explore|search|observe|look deeper)\s*/i, ""));
  }

  if (command === "ask around") {
    return askAround(next);
  }

  if (command.startsWith("ask ")) {
    return askNpcTopic(next, raw.replace(/^ask\s*/i, ""));
  }

  if (command === "check party" || command === "party check") {
    return checkParty(next);
  }

  if (command === "follow road" || command === "continue road" || command === "walk road" || command === "listen while walking" || command === "move cautiously") {
    return advanceTravelRoute(next, command.includes("listen") ? "listening" : command.includes("cautious") ? "cautious" : undefined);
  }

  if (command === "story" || command === "main story" || command === "narrative") {
    return showNarrativeJournal(next);
  }

  if (command === "dm" || command === "narrate" || command === "dm scene") {
    return pulseNarrative(next, "dm", { force: true });
  }

  if (command.startsWith("global ")) {
    return postWorldChat(next, "global-chat", raw.replace(/^global\s*/i, ""));
  }

  if (command.startsWith("zone ")) {
    return postWorldChat(next, "zone-chat", raw.replace(/^zone\s*/i, ""));
  }

  if (command.startsWith("travel ")) {
    return travel(next, raw.slice("travel ".length));
  }

  if (command.startsWith("talk")) {
    return talk(next, raw.replace(/^talk\s*/i, ""));
  }

  if (command === "accept quest") {
    return acceptQuest(next);
  }

  if (command === "inventory") {
    return showInventory(next);
  }

  if (command === "abilities") {
    return showAbilities(next);
  }

  if (command.startsWith("guard")) {
    return performCombatAction(next, "guard");
  }

  if (command.startsWith("shield oath")) {
    return performCombatAction(next, "shield-oath", raw.replace(/^shield oath\s*/i, ""));
  }

  if (command.startsWith("attack")) {
    return performCombatAction(next, "attack", raw.replace(/^attack\s*/i, ""));
  }

  if (command.startsWith("move")) {
    return performCombatAction(next, "move", raw.replace(/^move\s*/i, ""));
  }

  if (command.startsWith("use")) {
    return performCombatAction(next, "use-object", raw.replace(/^use\s*/i, ""));
  }

  if (command.startsWith("inspect")) {
    const target = raw.replace(/^inspect\s*/i, "");
    if (command.startsWith("inspect marker ")) {
      return inspectMapMarker(next, target.replace(/^marker\s*/i, ""));
    }
    return inspect(next, raw.replace(/^inspect\s*/i, ""));
  }

  if (command.startsWith("gather")) {
    return gather(next, raw.replace(/^gather\s*/i, ""));
  }

  if (command === "enter dungeon") {
    return enterDungeon(next);
  }

  if ((command === "continue" || command === "continue deeper") && state.gameplay.activeTravel && !state.dungeon) {
    return advanceTravelRoute(next);
  }

  if (command === "continue" || command === "continue deeper") {
    return continueDungeon(next);
  }

  if (command === "retry encounter") {
    return retryEncounter(next);
  }

  if (command === "loot") {
    return loot(next);
  }

  if (command === "need" || command === "greed" || command === "pass") {
    return resolveLootChoice(next, command);
  }

  if (command === "recap") {
    return recap(next);
  }

  if (command.startsWith("rest")) {
    return rest(next);
  }

  if (state.activeChannelId === "global-chat") {
    return postWorldChat(next, "global-chat", raw);
  }

  if (state.activeChannelId === "zone-chat") {
    return postWorldChat(next, "zone-chat", raw);
  }

  if (state.activeChannelId === "guild-recruitment") {
    return pulseLivingWorld(addFeed(next, "social", `${state.character.name} in #guild-recruitment`, raw, "local recruitment reply"), "social");
  }

  return addFeed(
    next,
    "warning",
    "Command not recognized",
    beginnerHelp(state),
    "MVP parser"
  );
}

function beginnerHelp(state: GameState) {
  if (state.locationPoiId === "saint-veyra-capital") {
    return "Try `explore`, `ask Halren about training`, `listen`, `who`, `lfg`, `guild contracts`, or `travel Hearthmere Fields`.";
  }
  if (state.locationPoiId === "hearthmere-crossing") {
    return "Try `explore`, `ask Renn about shrine`, `check party`, `map`, or `travel Road Shrine of Little Dawn`.";
  }
  if (state.locationPoiId === "road-shrine-little-dawn" && !state.flags.ollaPermission) {
    return "Try `talk Shrinekeeper Olla`, `ask Olla about the bell`, `explore candle rail`, `guild contracts`, or `map`.";
  }
  if (state.locationPoiId === "road-shrine-little-dawn") {
    return "Try `accept quest`, `enter dungeon`, `invite Renn`, `ready`, or `director what does the party notice?`.";
  }
  if (state.dungeon) {
    return "Try `explore`, `look`, `continue`, `inspect <object>`, `guard frontline`, `shield oath <target>`, `loot`, `recap`, or `report contract`.";
  }
  return "Try `explore`, `what should I do?`, `story`, `dm`, `world pulse`, `map`, `lfg`, `guild contracts`, `party hello`, or use the action buttons.";
}

function switchChannel(state: GameState, channelText: string): GameState {
  const normalized = channelText.replace("#", "").toLowerCase();
  const channel = channels.find((entry) => entry.id === normalized || entry.label.toLowerCase().includes(normalized));
  if (!channel) {
    return addFeed(state, "warning", "Unknown channel", "That channel is not on the MVP rail yet.", "Channel rail");
  }

  let next: GameState = {
    ...state,
    activeChannelId: channel.id
  };

  if ("poiId" in channel && channel.poiId) {
    next = moveToPoi(next, channel.poiId);
  }

  return pulseLivingWorld(addFeed(next, "scene", channel.label, channel.description, "Channel selected"), "channel");
}

function look(state: GameState): GameState {
  if (state.encounter) {
    return addFeed(
      state,
      "combat",
      state.encounter.name,
      [
        `Round ${state.encounter.round}`,
        `Intent: ${state.encounter.currentIntentName} - ${state.encounter.currentTelegraph}`,
        `Enemies: ${state.encounter.enemies.map((enemy) => `${enemy.name} ${enemy.hp}/${enemy.maxHp}`).join(", ")}`,
        `Naki: ${state.character.hp}/${state.character.maxHp} HP, ${state.character.oath} Oath, ${state.character.lane}${state.character.guardStance ? ", Guard Stance" : ""}`
      ].join("\n"),
      "Encounter bubble"
    );
  }

  const room = getCurrentRoom(state);
  if (room) {
    return addFeed(state, "scene", room.name, `${room.scene}\nLesson: ${room.lesson}`, room.type);
  }

  const poi = getCurrentPoi(state);
  return addFeed(state, "scene", poi.name, `${poi.scene}\nAvailable exits: ${poi.exits.join(", ")}`, poi.type);
}

function showMap(state: GameState): GameState {
  const dungeon = getActiveDungeon(state);
  if (dungeon && state.dungeon) {
    const route = dungeon.rooms
      .map((room, index) => `${index === state.dungeon?.roomIndex ? ">" : "-"} ${room.name}`)
      .join("\n");
    return addFeed(state, "scene", "Dungeon map", route, dungeon.name);
  }

  const zone = getCurrentZone(state);
  const nodes = pois
    .filter((poi) => poi.zoneId === zone.id)
    .map((poi) => `${poi.id === state.locationPoiId ? ">" : "-"} ${poi.name}`)
    .join("\n");
  const locked = zones.filter((entry) => entry.locked).map((entry) => `Locked preview: ${entry.name} (${entry.levelRange})`).join("\n");
  return addFeed(state, "scene", `${zone.name} map`, `${nodes}\n\n${locked}`, zone.levelRange);
}

function showFirstRoadChecklist(state: GameState): GameState {
  const lines = [
    `${state.profileCreated ? "[done]" : "[todo]"} Create your Bulwark`,
    `${state.livingWorld.tick > 0 ? "[done]" : "[todo]"} Hear the world with listen/world pulse`,
    `${state.social.groupListings.some((listing) => listing.status === "joined") ? "[done]" : "[todo]"} Form or join a training party`,
    `${state.sessionRecap.visited.includes("Hearthmere Fields") ? "[done]" : "[todo]"} Reach Hearthmere Fields`,
    `${state.sessionRecap.visited.includes("Road Shrine of Little Dawn") ? "[done]" : "[todo]"} Reach Little Dawn`,
    `${state.flags.ollaPermission ? "[done]" : "[todo]"} Talk to Shrinekeeper Olla`,
    `${state.dungeon ? "[done]" : "[todo]"} Enter Pilgrim Trial Cryptlet`,
    `${state.flags.cryptletComplete ? "[done]" : "[todo]"} Claim and report the clear`
  ];

  return addFeed(state, "system", "First Road Checklist", lines.join("\n"), "Beginner route");
}

function markTutorialStep(state: GameState, id: string): GameState {
  return {
    ...state,
    tutorial: {
      ...state.tutorial,
      checklistCompleteIds: state.tutorial.checklistCompleteIds.includes(id)
        ? state.tutorial.checklistCompleteIds
        : [...state.tutorial.checklistCompleteIds, id]
    }
  };
}

function showActivityRecommendation(state: GameState): GameState {
  const recommendation = getBestActivityRecommendation(state);
  const next = {
    ...markActivityUsed(state, recommendation.id),
    gameplay: {
      ...state.gameplay,
      currentObjective: {
        label: recommendation.title,
        command: recommendation.command,
        mapPing: recommendation.mapPing,
        source: recommendation.sourceNote
      }
    }
  };

  return addFeed(
    next,
    "system",
    `Activity Board: ${recommendation.title}`,
    `${recommendation.label} / ${recommendation.lane}\n${recommendation.summary}\nMap ping: ${recommendation.mapPing}\nTry: \`${recommendation.command}\`\nSource: ${recommendation.sourceNote}`,
    "Activity recommendation"
  );
}

function showContextualAdvice(state: GameState): GameState {
  if (state.encounter) {
    return addFeed(
      state,
      "system",
      "Good next step",
      `Read the enemy intent, then answer it. Current intent: ${state.encounter.currentIntentName}. Try \`guard frontline\`, \`shield oath ${state.encounter.enemies[0]?.name ?? "target"}\`, or an object button if one appears.`,
      "Tutorial advice"
    );
  }

  if (state.gameplay.activeTravel) {
    return addFeed(state, "system", "Good next step", "You are already on the road. Use `follow road`, `listen while walking`, or `move cautiously`.", "Route progress");
  }

  if (state.pendingLootRoll) {
    return addFeed(state, "system", "Good next step", `Resolve the ${state.pendingLootRoll.itemName} roll with \`need\`, \`greed\`, or \`pass\`.`, "Loot roll");
  }

  if (state.gameplay.currentObjective) {
    const objective = state.gameplay.currentObjective;
    return addFeed(state, "system", `Good next step: ${objective.label}`, `Try \`${objective.command}\`.\nMap ping: ${objective.mapPing}\nSource: ${objective.source}`, "Current objective");
  }

  return showActivityRecommendation(state);
}

function showFocusOptions(state: GameState): GameState {
  const options = getContextFocusOptions(state);
  if (!options.length) {
    return addFeed(state, "warning", "Nothing obvious to explore", "This spot has no focused exploration hooks yet. Try `look`, `map`, or `what should I do?`.", "Explore");
  }

  const lines = options.map((option) => `${option.label}: try \`explore ${option.aliases[0] ?? option.label}\``).join("\n");
  const body = `${lines}\n\nExploration can reveal suggested actions, party reactions, and session notes without creating unsourced rewards.`;
  return addFeed(state, "scene", "What you notice", body, getCurrentContextName(state));
}

function exploreFocus(state: GameState, targetText: string): GameState {
  const options = getContextFocusOptions(state);
  const focus = findFocusOption(options, targetText);
  if (!focus) {
    const choices = options.map((option) => option.aliases[0] ?? option.label).join(", ");
    return addFeed(state, "warning", "Focus not found", choices ? `Try one of these: ${choices}.` : "Try `look`, `map`, or `what should I do?`.", "Explore");
  }

  let next: GameState = {
    ...state,
    gameplay: {
      ...state.gameplay,
      discoveredFocusIds: unique([...state.gameplay.discoveredFocusIds, focus.id]),
      currentObjective: {
        label: focus.objective,
        command: focus.suggestedCommands[0] ?? "look",
        mapPing: focus.mapPing,
        source: focus.sourceNote
      },
      recentDiscoveries: [
        {
          id: createId("discovery"),
          title: focus.title,
          summary: focus.objective,
          source: focus.sourceNote,
          tick: state.livingWorld.tick
        },
        ...state.gameplay.recentDiscoveries
      ].slice(0, 6)
    },
    sessionRecap: {
      ...state.sessionRecap,
      narrative: unique([...state.sessionRecap.narrative, `Explored: ${focus.title}`]).slice(-16)
    }
  };

  next = addFeed(next, "scene", focus.title, `${focus.body}\n\nTry: ${focus.suggestedCommands.map((command) => `\`${command}\``).join(" / ")}`, focus.meta);
  if (focus.partyLine) {
    next = addFeed(next, "social", "Party reaction", focus.partyLine, "#party-chat");
  }

  return pulseNarrative(pulseLivingWorld(next, "listen"), "listen");
}

function askAround(state: GameState): GameState {
  const poi = getCurrentPoi(state);
  const possible = npcs.filter((npc) => poi.npcIds.includes(npc.id));
  const focus = getContextFocusOptions(state).slice(0, 3).map((option) => option.label).join(", ");
  const people = possible.map((npc) => `${npc.name}: ${topicsForNpc(npc.id).map((topic) => topic.topic).join(", ")}`).join("\n");
  return addFeed(
    state,
    "social",
    "You ask around",
    `${people || "No one nearby is available for a focused topic yet."}\n${focus ? `Nearby focuses: ${focus}.` : ""}`,
    poi.name
  );
}

function checkParty(state: GameState): GameState {
  const members = state.social.recentParty
    .map((name) => state.social.contacts.find((contact) => contact.name === name))
    .filter(Boolean);
  const lines = members.map((contact) => {
    const readiness = state.social.partyReadiness.find((entry) => entry.contactId === contact!.id)?.status ?? "joined";
    const latestMemory = state.social.memoryEvents.find((event) => event.contactId === contact!.id)?.summary ?? contact!.notes[0] ?? "No recent memory.";
    return `${contact!.name}: ${readiness}, ${contact!.relationshipTag}. ${latestMemory}`;
  });
  const advice = state.encounter
    ? "Current advice: answer the telegraph before trying to be flashy."
    : state.dungeon
      ? "Current advice: read the room object before pressing deeper."
      : state.locationPoiId === "road-shrine-little-dawn"
        ? "Current advice: Olla and the crypt stair are the important pressure points."
        : "Current advice: form the route, read the road, keep the party informed.";

  return addFeed(state, "social", "Party check", `${lines.join("\n") || "No party contacts are committed yet. Try `lfg` or `invite Renn`."}\n\n${advice}`, "#party-chat");
}

function travel(state: GameState, targetText: string): GameState {
  if (state.encounter) {
    return addFeed(state, "warning", "Travel blocked", "The party is in combat. Finish the encounter before trying to move the road under your feet.", "Combat");
  }

  if (state.dungeon) {
    return addFeed(state, "warning", "Travel blocked", "You are inside the Cryptlet. Use `continue`, `look`, or finish the dungeon route.", "Dungeon");
  }

  if (state.gameplay.activeTravel) {
    return addFeed(state, "warning", "Already on the road", "Use `follow road`, `listen while walking`, or `move cautiously` to advance the current route.", "Route progress");
  }

  const stagedRoute = findStagedRoute(state.locationPoiId, targetText);
  if (stagedRoute) {
    return startTravelRoute(state, stagedRoute, "normal");
  }

  const target = findPoiByAlias(targetText);
  if (!target) {
    return addFeed(state, "warning", "Unknown destination", "Named nodes only, sweet boy. Try `Hearthmere Fields` or `Road Shrine of Little Dawn`.", "Map rules");
  }

  const current = getCurrentPoi(state);
  if (!current.exits.includes(target.id)) {
    return addFeed(state, "warning", "Road not open from here", `${target.name} is not connected to your current node.`, current.name);
  }

  return moveToPoi(state, target.id);
}

function startTravelRoute(state: GameState, route: TravelRouteDefinition, pace: "normal" | "cautious" | "listening"): GameState {
  return applyTravelStage(
    {
      ...state,
      gameplay: {
        ...state.gameplay,
        activeTravel: {
          routeId: route.id,
          stageIndex: 0,
          destinationPoiId: route.toPoiId,
          pace
        }
      }
    },
    route,
    0,
    pace
  );
}

function advanceTravelRoute(state: GameState, paceOverride?: "normal" | "cautious" | "listening"): GameState {
  const active = state.gameplay.activeTravel;
  if (!active) {
    const route = stagedTravelRoutes.find((entry) => entry.fromPoiId === state.locationPoiId);
    if (route) {
      return startTravelRoute(state, route, paceOverride ?? "normal");
    }
    return addFeed(state, "warning", "No active road", "There is no staged road under your boots right now. Try `travel Hearthmere Fields` or `travel Road Shrine of Little Dawn`.", "Route progress");
  }

  const route = stagedTravelRoutes.find((entry) => entry.id === active.routeId);
  if (!route) {
    return addFeed(
      {
        ...state,
        gameplay: {
          ...state.gameplay,
          activeTravel: undefined
        }
      },
      "warning",
      "Route lost",
      "The staged route was not found, so BellSpire cleared it safely. Try travel again.",
      "Route progress"
    );
  }

  const pace = paceOverride ?? active.pace;
  const nextIndex = active.stageIndex + 1;
  if (nextIndex >= route.stages.length) {
    return moveToPoi(
      {
        ...state,
        gameplay: {
          ...state.gameplay,
          activeTravel: undefined
        }
      },
      active.destinationPoiId
    );
  }

  const staged = {
    ...state,
    gameplay: {
      ...state.gameplay,
      activeTravel: {
        ...active,
        pace,
        stageIndex: nextIndex
      }
    }
  };

  return applyTravelStage(staged, route, nextIndex, pace);
}

function applyTravelStage(state: GameState, route: TravelRouteDefinition, stageIndex: number, pace: "normal" | "cautious" | "listening"): GameState {
  const stage = route.stages[stageIndex];
  const finalStage = stageIndex >= route.stages.length - 1;
  const paceLine =
    pace === "cautious"
      ? "Pace: cautious. The party slows enough to read warning signs before stepping into them."
      : pace === "listening"
        ? "Pace: listening. The party leaves space for road sounds, zone chatter, and very rude silence."
        : "Pace: normal. The party keeps a steady MMO road rhythm.";
  let next: GameState = {
    ...state,
    gameplay: {
      ...state.gameplay,
      currentObjective: finalStage
        ? objectiveForPoi(route.toPoiId)
        : {
            label: stage.objective,
            command: "follow road",
            mapPing: stage.mapPing,
            source: route.sourceNote
          }
    },
    sessionRecap: {
      ...state.sessionRecap,
      narrative: unique([...state.sessionRecap.narrative, `Travel stage: ${stage.title}`]).slice(-16)
    }
  };

  next = addFeed(next, "scene", stage.title, `${stage.body}\n\n${paceLine}`, stage.meta);
  next = addFeed(next, "social", "Party road call", stage.partyLine, "#party-chat");
  next = addFeed(next, "social", "Zone roadwatch", stage.zoneLine, "#zone-chat");

  if (finalStage) {
    return moveToPoi(
      {
        ...next,
        gameplay: {
          ...next.gameplay,
          activeTravel: undefined
        }
      },
      route.toPoiId
    );
  }

  return pulseNarrative(pulseLivingWorld(next, "travel"), "travel");
}

function moveToPoi(state: GameState, poiId: string): GameState {
  const poi = pois.find((entry) => entry.id === poiId);
  if (!poi) {
    return state;
  }
  const zone = zones.find((entry) => entry.id === poi.zoneId);
  const channelId = zone?.channelId ?? state.activeChannelId;
  const visited = state.sessionRecap.visited.includes(poi.name) ? state.sessionRecap.visited : [...state.sessionRecap.visited, poi.name];
  let next = addFeed(
    {
      ...state,
      activeChannelId: channelId,
      locationPoiId: poi.id,
      gameplay: {
        ...state.gameplay,
        activeTravel: undefined,
        currentObjective: objectiveForPoi(poi.id)
      },
      sessionRecap: {
        ...state.sessionRecap,
        visited
      }
    },
    "scene",
    poi.name,
    poi.scene,
    zone?.name
  );

  if (poi.id === "hearthmere-crossing") {
    next = markTutorialStep(next, "reach-hearthmere");
    next = progressGuildContract(next, "first-road-watch", 35, "Hearthmere road reached");
  }

  if (poi.id === "road-shrine-little-dawn") {
    next = markTutorialStep(next, "reach-shrine");
    next = progressGuildContract(next, "first-road-watch", 70, "Road Shrine reached");
    next = {
      ...next,
      social: {
        ...next.social,
        notices: [
          createNotice("Road Shrine reached", "Little Dawn is now in play. Talk to Olla before entering the Cryptlet.", "Roadwatch", next.livingWorld.tick),
          ...next.social.notices
        ].slice(0, 12)
      }
    };
  }

  return pulseNarrative(pulseLivingWorld(next, "travel"), "travel");
}

function findPoiByAlias(targetText: string) {
  const normalized = targetText.toLowerCase();
  return pois.find((poi) => {
    const name = poi.name.toLowerCase();
    return name.includes(normalized) || normalized.includes(name) || normalized.includes(poi.id.split("-").join(" "));
  });
}

function findStagedRoute(fromPoiId: string, targetText: string) {
  const normalized = normalizeText(targetText);
  if (!normalized) {
    return undefined;
  }
  return stagedTravelRoutes.find((route) => {
    if (route.fromPoiId !== fromPoiId) {
      return false;
    }
    const destination = pois.find((poi) => poi.id === route.toPoiId);
    const destinationName = normalizeText(destination?.name ?? "");
    return (
      destinationName.includes(normalized) ||
      normalized.includes(destinationName) ||
      route.aliases.some((alias) => normalized.includes(normalizeText(alias)) || normalizeText(alias).includes(normalized))
    );
  });
}

function talk(state: GameState, targetText: string): GameState {
  const poi = getCurrentPoi(state);
  const possible = npcs.filter((npc) => poi.npcIds.includes(npc.id));
  const normalized = targetText.toLowerCase();
  const npc = possible.find((entry) => entry.name.toLowerCase().includes(normalized)) ?? possible[0];

  if (!npc) {
    return addFeed(state, "warning", "No one to talk to", "No available NPC is standing here in the MVP slice.", poi.name);
  }

  const topics = topicsForNpc(npc.id);
  const history = state.gameplay.conversationHistory[npc.id] ?? [];
  const greeting =
    history.length > 0
      ? `${npc.dialogue}\n\n${npc.name.split(" ")[0]} has more to say if you ask a focused topic instead of making the poor soul repeat the same doorway speech forever.`
      : npc.dialogue;
  const topicLine = topics.length ? `\n\nAsk about: ${topics.map((topic) => `\`${topic.topic}\``).join(" / ")}` : "";
  let next = addFeed(
    {
      ...state,
      gameplay: {
        ...state.gameplay,
        conversationHistory: {
          ...state.gameplay.conversationHistory,
          [npc.id]: unique([...history, "greeting"])
        },
        currentObjective: topics[0]
          ? {
              label: `Ask ${npc.name.split(" ")[0]} About ${topics[0].topic}`,
              command: `ask ${npc.name} about ${topics[0].topic}`,
              mapPing: npc.name,
              source: topics[0].sourceNote
            }
          : state.gameplay.currentObjective
      }
    },
    "dialogue",
    npc.name,
    `${greeting}${topicLine}`,
    npc.role
  );
  next = {
    ...next,
    sessionRecap: {
      ...next.sessionRecap,
      npcReactions: next.sessionRecap.npcReactions.includes(npc.reaction)
        ? next.sessionRecap.npcReactions
        : [...next.sessionRecap.npcReactions, npc.reaction]
    }
  };

  if (npc.id === "shrinekeeper-olla") {
    next = markTutorialStep(next, "speak-olla");
    next = {
      ...next,
      flags: {
        ...next.flags,
        ollaPermission: true
      },
      gameplay: {
        ...next.gameplay,
        currentObjective: {
          label: "Accept Trial Under Little Dawn",
          command: "accept quest",
          mapPing: "Cryptlet Stair",
          source: "Shrinekeeper Olla permission"
        }
      },
      quests: {
        ...next.quests,
        "trial-under-little-dawn": {
          status: "active",
          stepIndex: Math.max(next.quests["trial-under-little-dawn"]?.stepIndex ?? 0, 0)
        }
      },
      sessionRecap: {
        ...next.sessionRecap,
        quests: next.sessionRecap.quests.includes("Trial Under Little Dawn started")
          ? next.sessionRecap.quests
          : [...next.sessionRecap.quests, "Trial Under Little Dawn started"],
        flags: next.sessionRecap.flags.includes("Olla's Permission")
          ? next.sessionRecap.flags
          : [...next.sessionRecap.flags, "Olla's Permission"]
      }
    };
    next = recordContactMemory(next, "shrinekeeper-olla", "helped", "Olla granted permission for the Cryptlet route.", "Road Shrine of Little Dawn", 4);
    next = progressGuildContract(next, "little-dawn-candle-run", 20, "Olla permission");
    next = addFeed(next, "system", "Quest available", "Trial Under Little Dawn is ready. Use `accept quest` or press the action button.", "Shrinekeeper Olla");
  }

  return pulseNarrative(pulseLivingWorld(next, "talk"), "talk");
}

function askNpcTopic(state: GameState, questionText: string): GameState {
  const match = questionText.match(/^(.+?)\s+about\s+(.+)$/i);
  if (!match) {
    return addFeed(state, "warning", "Ask needs a topic", "Use `ask Olla about the bell`, `ask Renn about shrine`, or `ask Halren about training`.", "Conversation");
  }

  const npcText = match[1].trim();
  const topicText = match[2].trim();
  const poi = getCurrentPoi(state);
  const possible = npcs.filter((npc) => poi.npcIds.includes(npc.id));
  const npc = findNpcInContext(possible, npcText);

  if (!npc) {
    return addFeed(state, "warning", "No matching NPC nearby", "Use `who`, `ask around`, or move closer to the person you want to ask.", poi.name);
  }

  const topics = topicsForNpc(npc.id);
  const topic = findNpcTopic(topics, topicText);
  if (!topic) {
    const topicList = topics.map((entry) => entry.topic).join(", ");
    return addFeed(state, "warning", "Unknown topic", topicList ? `${npc.name} can answer: ${topicList}.` : `${npc.name} has no focused topics yet.`, npc.name);
  }

  const response = topic.flagResponses?.find((entry) => state.flags[entry.flag] === entry.value)?.response ?? topic.response;
  const previous = state.gameplay.conversationHistory[npc.id] ?? [];
  let next: GameState = {
    ...state,
    gameplay: {
      ...state.gameplay,
      conversationHistory: {
        ...state.gameplay.conversationHistory,
        [npc.id]: unique([...previous, topic.id])
      },
      currentObjective: {
        label: topic.title,
        command: nextCommandAfterTopic(state, npc.id, topic.topic),
        mapPing: npc.name,
        source: topic.sourceNote
      }
    },
    sessionRecap: {
      ...state.sessionRecap,
      npcReactions: unique([...state.sessionRecap.npcReactions, `${npc.name} answered about ${topic.topic}`]).slice(-16)
    }
  };

  next = addFeed(next, "dialogue", topic.title, response, npc.role);
  next = recordContactMemory(next, npc.id, "helped", `Answered ${state.character.name}'s question about ${topic.topic}.`, npc.name, 1);

  if (npc.id === "shrinekeeper-olla" && !next.flags.ollaPermission) {
    next = grantOllaPermission(next);
  }

  return pulseNarrative(pulseLivingWorld(next, "talk"), "talk");
}

function acceptQuest(state: GameState): GameState {
  if (state.locationPoiId !== "road-shrine-little-dawn" || !state.flags.ollaPermission) {
    return addFeed(state, "warning", "Quest not ready", "Talk to Shrinekeeper Olla at the Road Shrine first.", "Trial Under Little Dawn");
  }

  const quest = getQuestDefinition("trial-under-little-dawn")!;
  let next = addFeed(
    {
      ...state,
      quests: {
        ...state.quests,
        [quest.id]: {
          status: "active",
          stepIndex: 1
        }
      },
      sessionRecap: {
        ...state.sessionRecap,
        quests: state.sessionRecap.quests.includes(`${quest.name} accepted`)
          ? state.sessionRecap.quests
          : [...state.sessionRecap.quests, `${quest.name} accepted`]
      },
      gameplay: {
        ...state.gameplay,
        currentObjective: {
          label: "Enter The Cryptlet",
          command: "enter dungeon",
          mapPing: "Cryptlet Stair",
          source: quest.source
        }
      }
    },
    "system",
    `Quest accepted: ${quest.name}`,
    quest.steps[1],
    quest.source
  );
  next = progressGuildContract(next, "little-dawn-candle-run", 35, "Quest accepted");
  next = recordContactMemory(next, "shrinekeeper-olla", "helped", "The trial was accepted under Olla's shrine permission.", "Trial Under Little Dawn", 2);
  next = {
    ...next,
    social: {
      ...next.social,
      notices: [
        createNotice("Quest accepted", "Trial Under Little Dawn is active. The Cryptlet entrance is now the main road step.", "Shrinekeeper Olla", next.livingWorld.tick),
        ...next.social.notices
      ].slice(0, 12)
    }
  };

  return pulseNarrative(next, "quest");
}

function enterDungeon(state: GameState): GameState {
  if (state.locationPoiId !== "road-shrine-little-dawn") {
    return addFeed(state, "warning", "No dungeon entrance here", "The Cryptlet entrance is beneath the Road Shrine of Little Dawn.", "Dungeon");
  }

  if (!state.flags.ollaPermission) {
    return addFeed(state, "warning", "The bell stays sealed", "Shrinekeeper Olla has not given permission yet. Go talk to her first, baka.", "Little Dawn Crypt Bell");
  }

  const dungeon = dungeons[0];
  let next = addFeed(
    {
      ...state,
      activeChannelId: "combat-log",
      locationPoiId: "pilgrim-trial-cryptlet",
      dungeon: {
        dungeonId: dungeon.id,
        roomIndex: 0,
        mode: "Training",
        clearedEncounterIds: [],
        completed: false
      },
      quests: {
        ...state.quests,
        "trial-under-little-dawn": {
          status: "active",
          stepIndex: 2
        }
      },
      flags: {
        ...state.flags,
        roadTrialOathRead: true
      },
      gameplay: {
        ...state.gameplay,
        activeTravel: undefined,
        currentObjective: {
          label: "Read The Road Trial Oath",
          command: "explore road trial oath",
          mapPing: "Shrine Descent",
          source: dungeon.source
        }
      },
      sessionRecap: {
        ...state.sessionRecap,
        visited: state.sessionRecap.visited.includes(dungeon.name) ? state.sessionRecap.visited : [...state.sessionRecap.visited, dungeon.name],
        flags: state.sessionRecap.flags.includes("Road Trial Oath Read")
          ? state.sessionRecap.flags
          : [...state.sessionRecap.flags, "Road Trial Oath Read"]
      }
    },
    "scene",
    "Pilgrim Trial Cryptlet",
    "The inward bell opens the roadstone door. Room 1: Shrine Descent. The Road Trial Oath is read and logged.",
    "Training mode"
  );
  next = markTutorialStep(next, "enter-cryptlet");
  next = setPartyReadiness(next, ["pilgrim-renn", "edrin-bellhand", "tallowwick"], "ready");
  next = recordContactMemory(next, "pilgrim-renn", "ready", "Entered the Cryptlet with Renn prepared to call prayer marks.", "Pilgrim Trial Cryptlet", 3);
  next = recordContactMemory(next, "shrinekeeper-olla", "helped", "Watched the Cryptlet door open after granting permission.", "Road Shrine of Little Dawn", 1);
  next = progressGuildContract(next, "cryptlet-training-party", 40, "Cryptlet entered");
  next = {
    ...next,
    social: {
      ...next.social,
      notices: [
        createNotice("Cryptlet entered", "The party frame is now in dungeon mode. Read rooms, inspect objects, and keep lane calls boring.", "Training route", next.livingWorld.tick),
        ...next.social.notices
      ].slice(0, 12)
    }
  };

  return pulseNarrative(pulseLivingWorld(next, "dungeon"), "dungeon");
}

function continueDungeon(state: GameState): GameState {
  if (!state.dungeon) {
    return addFeed(state, "warning", "No active dungeon", "There is no dungeon route active right now.", "Dungeon");
  }

  if (state.encounter) {
    return addFeed(state, "warning", "Encounter active", "Finish the current encounter before moving deeper.", state.encounter.name);
  }

  const dungeon = getActiveDungeon(state);
  const room = getCurrentRoom(state);
  if (!dungeon || !room) {
    return state;
  }

  if (room.encounterId && !state.dungeon.clearedEncounterIds.includes(room.encounterId)) {
    return startEncounter(withRoomObjective(state, room), room.encounterId);
  }

  if (state.dungeon.roomIndex >= dungeon.rooms.length - 1) {
    return addFeed(state, "system", "Road-Seal Exit", "Use `loot` to claim the source-driven reward cache.", "Dungeon complete");
  }

  const nextRoomIndex = state.dungeon.roomIndex + 1;
  const nextRoom = dungeon.rooms[nextRoomIndex];
  let next: GameState = {
    ...state,
    dungeon: {
      ...state.dungeon,
      roomIndex: nextRoomIndex
    }
  };

  if (nextRoom.id === "broken-bell-niche") {
    next = {
      ...next,
      quests: {
        ...next.quests,
        "trial-under-little-dawn": {
          status: "active",
          stepIndex: Math.max(next.quests["trial-under-little-dawn"]?.stepIndex ?? 0, 3)
        }
      }
    };
  }

  if (nextRoom.id === "pilgrim-bone-walk") {
    next = {
      ...next,
      quests: {
        ...next.quests,
        "trial-under-little-dawn": {
          status: "active",
          stepIndex: Math.max(next.quests["trial-under-little-dawn"]?.stepIndex ?? 0, 4)
        }
      }
    };
  }

  if (nextRoom.id === "warden-chamber") {
    next = {
      ...next,
      quests: {
        ...next.quests,
        "trial-under-little-dawn": {
          status: "active",
          stepIndex: Math.max(next.quests["trial-under-little-dawn"]?.stepIndex ?? 0, 5)
        }
      }
    };
  }

  next = addFeed(next, "scene", nextRoom.name, `${nextRoom.scene}\nLesson: ${nextRoom.lesson}`, nextRoom.type);
  next = withRoomObjective(next, nextRoom);

  if (nextRoom.encounterId) {
    return startEncounter(pulseNarrative(next, "dungeon"), nextRoom.encounterId);
  }

  return pulseNarrative(pulseLivingWorld(next, "dungeon"), "dungeon");
}

function retryEncounter(state: GameState): GameState {
  const room = getCurrentRoom(state);
  if (!room?.encounterId) {
    return addFeed(state, "warning", "No encounter to retry", "This room is not currently holding an encounter.", "Dungeon");
  }
  return startEncounter(state, room.encounterId);
}

function inspect(state: GameState, targetText: string): GameState {
  const room = getCurrentRoom(state);
  const target = targetText.toLowerCase();

  if (state.encounter && target.includes("road-seal")) {
    return performCombatAction(state, "use-object", targetText);
  }

  if (room?.id === "hall-threaded-names" && target.includes("thread")) {
    const count = Number(state.flags.threadedNameTagsRead ?? 0) + 1;
    return addFeed(
      {
        ...state,
        flags: {
          ...state.flags,
          threadedNameTagsRead: count
        }
      },
      "scene",
      "Threaded Name Tag",
      `"Merren, who carried bread past the third bell." Thread tags read: ${count}.`,
      "Hidden memory"
    );
  }

  if (room?.id === "broken-bell-niche" && (target.includes("wax") || target.includes("bell"))) {
    return addFeed(
      {
        ...state,
        flags: {
          ...state.flags,
          brokenBellStabilized: true
        },
        quests: {
          ...state.quests,
          "trial-under-little-dawn": {
            status: "active",
            stepIndex: Math.max(state.quests["trial-under-little-dawn"]?.stepIndex ?? 0, 4)
          }
        },
        sessionRecap: {
          ...state.sessionRecap,
          flags: state.sessionRecap.flags.includes("Broken Bell Stabilized")
            ? state.sessionRecap.flags
            : [...state.sessionRecap.flags, "Broken Bell Stabilized"]
        },
        gameplay: {
          ...state.gameplay,
          currentObjective: {
            label: "Pressure The Bell-Ringer Shade",
            command: "shield oath Bell-Ringer Shade",
            mapPing: "Broken Bell Niche",
            source: "Runtime Pilgrim Trial Cryptlet object lesson"
          }
        }
      },
      "system",
      "Broken Bell Niche stabilized",
      "The wax channel catches. Future bell casts in this room will hit softer, and the reward cache can include a Bell Sliver.\nWhy it mattered: the room object turns a punishing cast into a teachable hit, so the party learns to read the dungeon instead of only the enemy bar.",
      "Object interaction"
    );
  }

  if (!room && state.locationPoiId === "road-shrine-little-dawn") {
    return addFeed(state, "scene", "Little Dawn Crypt Bell", "The bell is palm-sized bronze. It does not ring outward. It rings into the stone.", "Dungeon entrance");
  }

  if (room?.object) {
    return addFeed(state, "scene", room.object, "You inspect it carefully. No new state change triggers from this object yet.", room.name);
  }

  return addFeed(state, "warning", "Nothing obvious", "That object is not interactable in the MVP slice.", "Inspect");
}

function gather(state: GameState, targetText: string): GameState {
  if (!state.dungeon) {
    return addFeed(state, "warning", "No gathering node", "The MVP gathering hooks live inside the Cryptlet rooms.", "Gather");
  }
  return addFeed(state, "system", "Gathering noted", `${targetText || "node"} logged for future profession support. No permanent item was created.`, "Prototype hook");
}

function loot(state: GameState): GameState {
  if (!state.dungeon) {
    return addFeed(state, "warning", "No loot source", "There is no active dungeon reward source here.", "Loot");
  }

  const room = getCurrentRoom(state);
  if (room?.id !== "road-seal-exit" && !state.flags.wardenDefeated) {
    return addFeed(state, "warning", "Reward not ready", "Defeat the Bellgrave Warden and reach the Road-Seal Exit first.", "Source-driven loot");
  }

  const wasComplete = Boolean(state.flags.cryptletComplete);
  let next = grantCryptletRewards(state);
  if (!wasComplete && next.flags.cryptletComplete) {
    next = completeCryptletRoute(next);
  }

  return pulseNarrative(pulseLivingWorld(next, "loot"), "loot");
}

function resolveLootChoice(state: GameState, choice: "need" | "greed" | "pass"): GameState {
  const wasComplete = Boolean(state.flags.cryptletComplete);
  let next = resolveCryptletLootRoll(state, choice);
  if (!wasComplete && next.flags.cryptletComplete) {
    next = completeCryptletRoute(next);
  }

  return pulseNarrative(pulseLivingWorld(next, "loot"), "loot");
}

function completeCryptletRoute(state: GameState): GameState {
  let next = markTutorialStep(state, "claim-cache");
  next = {
    ...next,
    quests: {
      ...next.quests,
      "trial-under-little-dawn": {
        status: "complete",
        stepIndex: 6
      }
    },
    flags: {
      ...next.flags,
      wardenDefeated: true,
      cryptletComplete: true
    },
    gameplay: {
      ...next.gameplay,
      currentObjective: {
        label: "Report The Contract",
        command: "report contract",
        mapPing: "Guild Contract Board",
        source: "First Road completion"
      }
    },
    sessionRecap: {
      ...next.sessionRecap,
      quests: next.sessionRecap.quests.includes("Trial Under Little Dawn complete")
        ? next.sessionRecap.quests
        : [...next.sessionRecap.quests, "Trial Under Little Dawn complete"]
    }
  };
  next = progressGuildContract(next, "first-road-watch", 100, "Cryptlet clear");
  next = progressGuildContract(next, "little-dawn-candle-run", 100, "Cryptlet clear");
  next = progressGuildContract(next, "cryptlet-training-party", 100, "Cryptlet clear");
  next = setPartyReadiness(next, ["pilgrim-renn", "edrin-bellhand", "tallowwick"], "post-clear");
  next = recordContactMemory(next, "pilgrim-renn", "cleared", "Cleared the Cryptlet training route together.", "Pilgrim Trial Cryptlet", 6);
  next = recordContactMemory(next, "edrin-bellhand", "cleared", "Healed a clean training clear with called lanes.", "Pilgrim Trial Cryptlet", 5);
  next = recordContactMemory(next, "tallowwick", "cleared", "Handled object-duty chatter during the first clear.", "Pilgrim Trial Cryptlet", 4);
  next = recordContactMemory(next, "shrinekeeper-olla", "cleared", "The First Road party returned with the Cryptlet quieted.", "Road-Seal Cache", 3);
  next = {
    ...next,
    social: {
      ...next.social,
      notices: [
        createNotice("Cryptlet clear recorded", "Guild contracts may now be report-ready. Use `report contract` to file the route.", "Road-Seal Cache", next.livingWorld.tick),
        ...next.social.notices
      ].slice(0, 12)
    }
  };

  return next;
}

function showInventory(state: GameState): GameState {
  const body = state.inventory.map((item) => `${item.name} x${item.quantity} [${item.rarity ?? "Unrated"} ${item.kind}] - ${item.sourceStatus}`).join("\n");
  return addFeed(state, "system", "Inventory", body || "Inventory is empty.", "Source checked");
}

function showAbilities(state: GameState): GameState {
  const body = getBulwarkAbilities()
    .map((ability) => `${ability.name} (${ability.actionType}, ${ability.resource}) - ${ability.description}`)
    .join("\n");
  return addFeed(state, "system", "Bulwark abilities", body, "Shield Oath / Guard Stance");
}

function rest(state: GameState): GameState {
  const poi = getCurrentPoi(state);
  if (!poi.services.includes("field rest") && !poi.services.includes("rest shrine")) {
    return addFeed(state, "warning", "No safe rest here", "Find a road shrine or field rest point first.", "Rest");
  }

  const rested = addFeed(
    {
      ...state,
      character: {
        ...state.character,
        hp: state.character.maxHp,
        oath: Math.max(state.character.oath, 10),
        condition: undefined
      }
    },
    "system",
    "Rest complete",
    "HP restored. Oath steadied. The road is still rude, but you are less crunchy.",
    poi.name
  );
  return pulseNarrative(pulseLivingWorld(rested, "rest"), "rest");
}

function recap(state: GameState): GameState {
  const recapLines = [
    `Visited: ${state.sessionRecap.visited.join(" -> ") || "None"}`,
    `Quests: ${state.sessionRecap.quests.join("; ") || "None"}`,
    `Narrative: ${state.sessionRecap.narrative.join("; ") || "None"}`,
    `Loot: ${state.sessionRecap.loot.join("; ") || "None"}`,
    `Loot rolls: ${state.sessionRecap.lootRolls.join("; ") || "None"}`,
    `Wipes: ${state.sessionRecap.wipes.join("; ") || "None"}`,
    `Reputation: ${state.sessionRecap.reputation.join("; ") || "None"}`,
    `Source pity: ${state.sessionRecap.sourcePity.join("; ") || "None"}`,
    `Flags: ${state.sessionRecap.flags.join("; ") || "None"}`,
    `NPC reactions: ${state.sessionRecap.npcReactions.join("; ") || "None"}`,
    `Social: ${state.sessionRecap.social.join("; ") || "None"}`
  ];

  return addFeed(state, "recap", "Session recap", recapLines.join("\n"), "Exportable save state");
}

function getCurrentContextName(state: GameState) {
  const room = getCurrentRoom(state);
  return room?.name ?? getCurrentPoi(state).name;
}

function getContextFocusOptions(state: GameState) {
  const room = getCurrentRoom(state);
  if (room) {
    return firstRoadFocusOptions.filter((option) => option.dungeonRoomId === room.id);
  }
  return firstRoadFocusOptions.filter((option) => option.locationPoiId === state.locationPoiId);
}

function findFocusOption(options: FocusOptionDefinition[], targetText: string) {
  const normalized = normalizeText(targetText);
  return options.find((option) => {
    const label = normalizeText(option.label);
    const title = normalizeText(option.title);
    return (
      option.id === normalized ||
      label.includes(normalized) ||
      normalized.includes(label) ||
      title.includes(normalized) ||
      normalized.includes(title) ||
      option.aliases.some((alias) => {
        const aliasText = normalizeText(alias);
        return aliasText.includes(normalized) || normalized.includes(aliasText);
      })
    );
  });
}

function topicsForNpc(npcId: string) {
  return firstRoadNpcTopics.filter((topic) => topic.npcId === npcId);
}

function findNpcTopic(topics: NpcTopicDefinition[], topicText: string) {
  const normalized = normalizeText(topicText);
  return topics.find((topic) => {
    const topicName = normalizeText(topic.topic);
    return (
      topicName.includes(normalized) ||
      normalized.includes(topicName) ||
      topic.aliases.some((alias) => {
        const aliasText = normalizeText(alias);
        return aliasText.includes(normalized) || normalized.includes(aliasText);
      })
    );
  });
}

function findNpcInContext(possible: typeof npcs, npcText: string) {
  const normalized = normalizeText(npcText);
  return possible.find((npc) => {
    const name = normalizeText(npc.name);
    return npc.id.includes(normalized) || name.includes(normalized) || normalized.includes(name.split(" ")[0]) || name.split(" ").some((part) => part === normalized);
  });
}

function nextCommandAfterTopic(state: GameState, npcId: string, topic: string) {
  if (npcId === "shrinekeeper-olla" && !state.flags.ollaPermission) {
    return "accept quest";
  }
  if (npcId === "shrinekeeper-olla" && state.quests["trial-under-little-dawn"]?.status !== "complete") {
    return state.quests["trial-under-little-dawn"]?.status === "active" ? "enter dungeon" : "accept quest";
  }
  if (npcId === "master-halren-voss" && topic.toLowerCase().includes("training")) {
    return "abilities";
  }
  if (npcId === "pilgrim-renn") {
    return state.locationPoiId === "hearthmere-crossing" ? "travel Road Shrine of Little Dawn" : "check party";
  }
  return "what should I do?";
}

function grantOllaPermission(state: GameState): GameState {
  let next = markTutorialStep(state, "speak-olla");
  next = {
    ...next,
    flags: {
      ...next.flags,
      ollaPermission: true
    },
    quests: {
      ...next.quests,
      "trial-under-little-dawn": {
        status: "active",
        stepIndex: Math.max(next.quests["trial-under-little-dawn"]?.stepIndex ?? 0, 0)
      }
    },
    gameplay: {
      ...next.gameplay,
      currentObjective: {
        label: "Accept Trial Under Little Dawn",
        command: "accept quest",
        mapPing: "Cryptlet Stair",
        source: "Shrinekeeper Olla permission"
      }
    },
    sessionRecap: {
      ...next.sessionRecap,
      quests: next.sessionRecap.quests.includes("Trial Under Little Dawn started")
        ? next.sessionRecap.quests
        : [...next.sessionRecap.quests, "Trial Under Little Dawn started"],
      flags: next.sessionRecap.flags.includes("Olla's Permission")
        ? next.sessionRecap.flags
        : [...next.sessionRecap.flags, "Olla's Permission"]
    }
  };
  next = recordContactMemory(next, "shrinekeeper-olla", "helped", "Olla granted permission for the Cryptlet route.", "Road Shrine of Little Dawn", 4);
  next = progressGuildContract(next, "little-dawn-candle-run", 20, "Olla permission");
  return addFeed(next, "system", "Quest available", "Trial Under Little Dawn is ready. Use `accept quest` or press the action button.", "Shrinekeeper Olla");
}

function inspectMapMarker(state: GameState, targetText: string): GameState {
  const focus = findFocusOption(getContextFocusOptions(state), targetText);
  if (focus) {
    return exploreFocus(state, focus.aliases[0] ?? focus.label);
  }

  const zone = getCurrentZone(state);
  const normalized = normalizeText(targetText);
  const service = firstRoadMapServices
    .filter((entry) => entry.zoneId === zone.id)
    .find((entry) => {
      const label = normalizeText(entry.label);
      return label.includes(normalized) || normalized.includes(label);
    });

  if (!service) {
    return addFeed(state, "warning", "Marker not found", "Pick a visible atlas service marker or use `explore` for nearby focus points.", "Map marker");
  }

  return addFeed(
    {
      ...state,
      gameplay: {
        ...state.gameplay,
        currentObjective: {
          label: `Inspect ${service.label}`,
          command: "what should I do?",
          mapPing: service.label,
          source: service.sourceNote
        }
      }
    },
    "scene",
    service.label,
    `${service.summary}\nSource: ${service.sourceNote}`,
    `Atlas marker / ${service.kind}`
  );
}

function withRoomObjective<T extends { id: string; name: string; lesson: string; object?: string; encounterId?: string }>(state: GameState, room: T): GameState {
  const focus = firstRoadFocusOptions.find((option) => option.dungeonRoomId === room.id);
  const command = room.id === "road-seal-exit"
    ? "loot"
    : focus?.suggestedCommands[0] ?? (room.object ? `inspect ${room.object}` : room.encounterId ? "guard frontline" : "continue");

  return {
    ...state,
    gameplay: {
      ...state.gameplay,
      currentObjective: {
        label: focus?.objective ?? room.lesson,
        command,
        mapPing: focus?.mapPing ?? room.name,
        source: focus?.sourceNote ?? "Pilgrim Trial Cryptlet room lesson"
      }
    }
  };
}

function objectiveForPoi(poiId: string) {
  switch (poiId) {
    case "saint-veyra-capital":
      return {
        label: "Take the Old Pilgrim Road",
        command: "travel Hearthmere Fields",
        mapPing: "East Road Gate",
        source: "First Road route"
      };
    case "hearthmere-crossing":
      return {
        label: "Follow The Shrine Road",
        command: "travel Road Shrine of Little Dawn",
        mapPing: "Old Pilgrim Road",
        source: "First Road route"
      };
    case "road-shrine-little-dawn":
      return {
        label: "Ask Olla About The Bell",
        command: "ask Olla about bell",
        mapPing: "Little Dawn Bell",
        source: "Road Shrine of Little Dawn"
      };
    case "pilgrim-trial-cryptlet":
      return {
        label: "Read The Current Room",
        command: "explore",
        mapPing: "Pilgrim Trial Cryptlet",
        source: "Pilgrim Trial Cryptlet room lessons"
      };
    default:
      return undefined;
  }
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
