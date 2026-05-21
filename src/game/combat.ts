import encounters from "../data/encounters.json";
import enemies from "../data/enemies.json";
import { addFeed, createId, reviveForRetry } from "./state";
import { recordContactMemory, setPartyReadiness } from "./social";
import type { CombatEnemyState, EncounterState, GameState, Lane } from "./types";

function getEncounterDefinition(encounterId: string) {
  const encounter = encounters.find((entry) => entry.id === encounterId);
  if (!encounter) {
    throw new Error(`Unknown encounter: ${encounterId}`);
  }
  return encounter;
}

function getEnemyDefinition(enemyId: string) {
  const enemy = enemies.find((entry) => entry.id === enemyId);
  if (!enemy) {
    throw new Error(`Unknown enemy: ${enemyId}`);
  }
  return enemy;
}

function getIntent(encounterId: string, round: number) {
  const encounter = getEncounterDefinition(encounterId);
  return encounter.intents[(round - 1) % encounter.intents.length];
}

function buildEnemies(encounterId: string): CombatEnemyState[] {
  const encounter = getEncounterDefinition(encounterId);
  const result: CombatEnemyState[] = [];

  for (const group of encounter.enemyGroups) {
    const enemy = getEnemyDefinition(group.enemyId);
    for (let index = 0; index < group.count; index += 1) {
      result.push({
        instanceId: createId(enemy.id),
        enemyId: enemy.id,
        name: group.count > 1 ? `${enemy.name} ${index + 1}` : enemy.name,
        maxHp: enemy.maxHp,
        hp: enemy.maxHp,
        threatSealed: false
      });
    }
  }

  return result;
}

export function startEncounter(state: GameState, encounterId: string): GameState {
  const definition = getEncounterDefinition(encounterId);
  const intent = getIntent(encounterId, 1);
  const encounter: EncounterState = {
    id: definition.id,
    name: definition.name,
    round: 1,
    enemies: buildEnemies(encounterId),
    currentIntentId: intent.id,
    currentIntentName: intent.name,
    currentTelegraph: intent.telegraph,
    log: [`Round 1 intent: ${intent.name}. ${intent.telegraph}`],
    roadSealPrimed: false
  };

  return addFeed(
    {
      ...state,
      activeChannelId: "combat-log",
      encounter,
      character: {
        ...state.character,
        guardStance: false,
        lane: "Frontline"
      }
    },
    "combat",
    `Encounter started: ${definition.name}`,
    `Enemy intent: ${intent.name}. ${intent.telegraph}`,
    "Frontline / Midline / Backline"
  );
}

function findTarget(encounter: EncounterState, targetText?: string) {
  const alive = encounter.enemies.filter((enemy) => enemy.hp > 0);
  if (!targetText) {
    return alive[0];
  }

  const normalized = targetText.toLowerCase();
  return alive.find((enemy) => enemy.name.toLowerCase().includes(normalized)) ?? alive[0];
}

function setNextIntent(encounter: EncounterState): EncounterState {
  const nextRound = encounter.round + 1;
  const intent = getIntent(encounter.id, nextRound);
  return {
    ...encounter,
    round: nextRound,
    currentIntentId: intent.id,
    currentIntentName: intent.name,
    currentTelegraph: intent.telegraph,
    log: [...encounter.log, `Round ${nextRound} intent: ${intent.name}. ${intent.telegraph}`].slice(-12)
  };
}

function damageEnemy(encounter: EncounterState, target: CombatEnemyState, damage: number, threatSealed = false): EncounterState {
  return {
    ...encounter,
    enemies: encounter.enemies.map((enemy) =>
      enemy.instanceId === target.instanceId
        ? {
            ...enemy,
            hp: Math.max(0, enemy.hp - damage),
            threatSealed: threatSealed || enemy.threatSealed
          }
        : enemy
    )
  };
}

function allEnemiesDefeated(encounter: EncounterState) {
  return encounter.enemies.every((enemy) => enemy.hp <= 0);
}

function targetHint(encounter: EncounterState, target: CombatEnemyState, targetText?: string) {
  const normalized = targetText?.trim().toLowerCase();
  if (!normalized || target.name.toLowerCase().includes(normalized)) {
    return "";
  }
  return ` Target "${targetText}" was not present, so BellSpire used current threat: ${target.name}.`;
}

function applyEnemyDamage(state: GameState, damage: number, failureTag: string, line: string): GameState {
  const hp = Math.max(0, state.character.hp - damage);
  const next: GameState = {
    ...state,
    character: {
      ...state.character,
      hp,
      guardStance: false
    },
    encounter: state.encounter
      ? {
          ...state.encounter,
          lastFailureTag: failureTag,
          log: [...state.encounter.log, line, `Naki takes ${damage} damage.`].slice(-12)
        }
      : undefined
  };

  if (hp > 0) {
    return next;
  }

  const wipeLine = buildWipeRecap(failureTag);
  let wiped: GameState = {
    ...next,
    encounter: undefined,
    sessionRecap: {
      ...next.sessionRecap,
      wipes: [...next.sessionRecap.wipes, `${failureTag}: ${wipeLine}`]
    }
  };
  wiped = setPartyReadiness(wiped, ["pilgrim-renn", "edrin-bellhand", "tallowwick"], "post-wipe");
  wiped = recordContactMemory(wiped, "edrin-bellhand", "wiped", `Wipe noted: ${wipeLine}`, "Combat recap", 1);
  const revived = reviveForRetry(wiped);

  return addFeed(revived, "warning", "Wipe recap", wipeLine, failureTag);
}

function buildWipeRecap(failureTag: string) {
  switch (failureTag) {
    case "Tank Positioning Failure":
      return "The heavy hit crossed out of the Frontline. Keep the boss faced away from Midline and Backline before the swing lands.";
    case "Object Failure":
      return "The room object mattered. Use the wax channel or Road-Seal Bell when the telegraph calls for it.";
    case "Resource Misuse":
      return "Final Toll landed while your defensive timing was weak. Save Guard Stance for the big bell, not the little cuts.";
    case "DPS Target Failure":
      return "Adds and marked targets stayed alive too long. Swap targets before pressure stacks.";
    case "Lane Control Failure":
      return "The enemy moved the fight through unsafe lanes. Hold Frontline before the hook or drag resolves.";
    default:
      return "The party collapsed under overlapping pressure. Read the next telegraph, then answer the specific problem.";
  }
}

function resolveEnemyTurn(state: GameState): GameState {
  const encounter = state.encounter;
  if (!encounter) {
    return state;
  }

  let next = state;
  const intentId = encounter.currentIntentId;
  const isGuarding = state.character.guardStance;
  const lane = state.character.lane;

  if (intentId === "grave-bell-swing") {
    const damage = lane === "Frontline" ? (isGuarding ? 2 : 7) : 12;
    const tag = lane === "Frontline" ? "Resource Misuse" : "Tank Positioning Failure";
    next = applyEnemyDamage(state, damage, tag, "Grave Bell Swing crashes through the marked lane.");
  } else if (intentId === "vowless-mark" || intentId === "unanswered-name") {
    const damage = isGuarding ? 2 : 4;
    next = applyEnemyDamage(
      {
        ...state,
        character: {
          ...state.character,
          condition: "Road Chill"
        }
      },
      damage,
      "Bad Cleanse Timing",
      "A thread tag bites cold around the oath-line."
    );
  } else if (intentId === "bone-rattle-adds") {
    let activeEncounter = encounter;
    const hasAdds = activeEncounter.enemies.some((enemy) => enemy.enemyId === "bone-rattle-add" && enemy.hp > 0);
    if (!hasAdds) {
      const add = getEnemyDefinition("bone-rattle-add");
      activeEncounter = {
        ...activeEncounter,
        enemies: [
          ...activeEncounter.enemies,
          {
            instanceId: createId("bone-rattle-add"),
            enemyId: add.id,
            name: add.name,
            maxHp: add.maxHp,
            hp: add.maxHp,
            threatSealed: false
          }
        ]
      };
    }
    next = applyEnemyDamage(
      {
        ...state,
        encounter: activeEncounter
      },
      isGuarding ? 3 : 7,
      "DPS Target Failure",
      "Bone Rattle Adds pull themselves out of the floor."
    );
  } else if (intentId === "road-seal-pulse") {
    const primed = encounter.roadSealPrimed;
    next = applyEnemyDamage(
      {
        ...state,
        encounter: {
          ...encounter,
          roadSealPrimed: primed
        }
      },
      primed ? 1 : 4,
      "Object Failure",
      primed ? "The Road-Seal Bell answers and weakens the next toll." : "The wax channel pulses unanswered."
    );
  } else if (intentId === "final-toll") {
    const reduced = encounter.roadSealPrimed;
    const damage = reduced && isGuarding ? 5 : reduced || isGuarding ? 10 : 18;
    next = applyEnemyDamage(
      {
        ...state,
        encounter: {
          ...encounter,
          roadSealPrimed: false
        }
      },
      damage,
      reduced && isGuarding ? "Clean Defensive Timing" : "Resource Misuse",
      "Final Toll lands like a bell heard from inside your ribs."
    );
  } else if (intentId === "ritual-windup" || intentId === "wax-channel-pressure") {
    const stabilized = Boolean(state.flags.brokenBellStabilized);
    next = applyEnemyDamage(
      state,
      stabilized ? 2 : 8,
      "Object Failure",
      stabilized ? "The stabilized wax channel softens the bell cast." : "The Bell-Ringer Shade rings the wrong way."
    );
  } else if (intentId === "hook-drag" || intentId === "bone-snare") {
    const held = state.character.lane === "Frontline";
    next = applyEnemyDamage(
      {
        ...state,
        character: {
          ...state.character,
          lane: held ? state.character.lane : "Frontline"
        }
      },
      held || isGuarding ? 4 : 8,
      "Lane Control Failure",
      held ? "The hook catches your shield and fails to reach the companion lane." : "The hook drags the lane order into danger."
    );
  } else {
    next = applyEnemyDamage(state, isGuarding ? 2 : 4, "Healer Overload", "The enemy pack lands chip damage.");
  }

  if (!next.encounter) {
    return next;
  }

  return {
    ...next,
    encounter: setNextIntent(next.encounter)
  };
}

function completeEncounter(state: GameState, encounter: EncounterState): GameState {
  const cleared = state.dungeon?.clearedEncounterIds ?? [];
  const definition = getEncounterDefinition(encounter.id);
  const bossCleared = encounter.id === "bellgrave-warden";
  const next = {
    ...state,
    encounter: undefined,
    character: {
      ...state.character,
      guardStance: false,
      condition: undefined,
      hp: Math.min(state.character.maxHp, state.character.hp + 18),
      oath: Math.max(state.character.oath, 12)
    },
    dungeon: state.dungeon
      ? {
          ...state.dungeon,
          clearedEncounterIds: cleared.includes(encounter.id) ? cleared : [...cleared, encounter.id]
        }
      : undefined,
    flags: bossCleared
      ? {
          ...state.flags,
          wardenDefeated: true
        }
      : state.flags,
    quests: bossCleared
      ? {
        ...state.quests,
        "trial-under-little-dawn": {
            status: "active" as const,
            stepIndex: 6
          }
        }
      : state.quests,
    sessionRecap: bossCleared
      ? {
          ...state.sessionRecap,
          flags: state.sessionRecap.flags.includes("Bellgrave Warden Defeated")
            ? state.sessionRecap.flags
            : [...state.sessionRecap.flags, "Bellgrave Warden Defeated"]
        }
      : state.sessionRecap
  };

  return addFeed(next, "combat", `Encounter cleared: ${encounter.name}`, "The lane pressure drops. Continue when you are ready.", definition.source);
}

export function performCombatAction(state: GameState, action: "guard" | "shield-oath" | "attack" | "move" | "use-object", detail?: string): GameState {
  if (!state.encounter) {
    return addFeed(state, "warning", "No active encounter", "There is nothing trying to eat the party right now. Suspiciously peaceful.", "Combat");
  }

  let next = state;
  let encounter = state.encounter;
  let actionLine = "";

  if (action === "guard") {
    next = {
      ...next,
      character: {
        ...next.character,
        lane: "Frontline",
        guardStance: true,
        oath: Math.min(100, next.character.oath + 5)
      }
    };
    actionLine = "Naki locks Guard Stance on the Frontline. Oath +5.";
  }

  if (action === "shield-oath") {
    const target = findTarget(encounter, detail);
    if (target) {
      encounter = damageEnemy(encounter, target, 12, true);
      next = {
        ...next,
        encounter,
        character: {
          ...next.character,
          lane: "Frontline",
          guardStance: false,
          oath: Math.min(100, next.character.oath + 10)
        }
      };
      actionLine = `Shield Oath hits ${target.name}. Threat Seal applied. Oath +10.${targetHint(encounter, target, detail)}`;
    }
  }

  if (action === "attack") {
    const target = findTarget(encounter, detail);
    if (target) {
      encounter = damageEnemy(encounter, target, 9);
      next = {
        ...next,
        encounter,
        character: {
          ...next.character,
          guardStance: false,
          oath: Math.min(100, next.character.oath + 2)
        }
      };
      actionLine = `Road-Iron Strike hits ${target.name}. Oath +2.${targetHint(encounter, target, detail)}`;
    }
  }

  if (action === "move") {
    const lane = parseLane(detail);
    next = {
      ...next,
      character: {
        ...next.character,
        lane,
        guardStance: false
      }
    };
    actionLine = `Naki moves to ${lane}.`;
  }

  if (action === "use-object") {
    const canPrime = encounter.currentIntentId === "road-seal-pulse";
    next = {
      ...next,
      encounter: {
        ...encounter,
        roadSealPrimed: canPrime || encounter.roadSealPrimed,
        log: [
          ...encounter.log,
          canPrime ? "Road-Seal Bell used. Final Toll will be weakened." : "The object does not answer this telegraph."
        ].slice(-12)
      },
      character: {
        ...next.character,
        guardStance: false
      }
    };
    encounter = next.encounter!;
    actionLine = canPrime ? "Naki rings the Road-Seal Bell at the correct pulse." : "Naki reaches for the object, but the room gives no answer.";
  }

  if (!actionLine) {
    return addFeed(state, "warning", "Action failed", "That action did not find a valid target. Try `attack`, `shield oath`, or `guard frontline`.", "Combat");
  }

  next = {
    ...next,
    encounter: {
      ...next.encounter!,
      log: [...next.encounter!.log, actionLine].slice(-12)
    }
  };

  if (allEnemiesDefeated(next.encounter!)) {
    return completeEncounter(next, next.encounter!);
  }

  next = resolveEnemyTurn(next);

  if (next.encounter && allEnemiesDefeated(next.encounter)) {
    return completeEncounter(next, next.encounter);
  }

  return addFeed(
    next,
    "combat",
    actionLine,
    next.encounter
      ? `Enemy intent now: ${next.encounter.currentIntentName}. ${next.encounter.currentTelegraph}`
      : "The encounter state changed.",
    next.character.hp <= 12 ? "Low HP" : "Combat"
  );
}

function parseLane(value?: string): Lane {
  const text = value?.toLowerCase() ?? "";
  if (text.includes("back")) {
    return "Backline";
  }
  if (text.includes("mid")) {
    return "Midline";
  }
  return "Frontline";
}
