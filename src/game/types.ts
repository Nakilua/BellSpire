export type Lane = "Frontline" | "Midline" | "Backline";
export type FeedType = "system" | "scene" | "command" | "dialogue" | "social" | "combat" | "loot" | "recap" | "warning";
export type CharacterOrigin = "Saint Veyra Ward" | "Hearthmere Farmstead" | "Roadwarden Foundling";
export type CharacterVow = "Hold the Line" | "Guard the Small Flame" | "Break No Oath";

export interface FeedEntry {
  id: string;
  type: FeedType;
  title: string;
  body: string;
  meta?: string;
}

export interface ExportReceipt {
  filename: string;
  byteCount: number;
  checksum: string;
  generatedAt: string;
  action: "validate" | "copy" | "download";
}

export interface CharacterState {
  name: string;
  className: "Bulwark";
  origin: CharacterOrigin;
  vow: CharacterVow;
  level: number;
  hp: number;
  maxHp: number;
  oath: number;
  lane: Lane;
  guardStance: boolean;
  condition?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  kind: string;
  quantity: number;
  slot?: string;
  armorType?: string;
  binding?: string;
  itemLevel?: number;
  rarity?: string;
  classTags?: string[];
  sourceType?: string;
  sourceId?: string;
  zoneId?: string;
  dungeonId?: string;
  source: string;
  sourceStatus: string;
  description?: string;
}

export interface QuestProgress {
  status: "inactive" | "active" | "complete";
  stepIndex: number;
}

export interface CombatEnemyState {
  instanceId: string;
  enemyId: string;
  name: string;
  maxHp: number;
  hp: number;
  threatSealed: boolean;
}

export interface EncounterState {
  id: string;
  name: string;
  round: number;
  enemies: CombatEnemyState[];
  currentIntentId: string;
  currentIntentName: string;
  currentTelegraph: string;
  log: string[];
  roadSealPrimed: boolean;
  lastFailureTag?: string;
}

export interface DungeonState {
  dungeonId: string;
  roomIndex: number;
  mode: "Training";
  clearedEncounterIds: string[];
  completed: boolean;
}

export interface SessionRecap {
  visited: string[];
  quests: string[];
  narrative: string[];
  loot: string[];
  lootRolls: string[];
  wipes: string[];
  reputation: string[];
  sourcePity: string[];
  flags: string[];
  npcReactions: string[];
  social: string[];
}

export type ContactMemoryKind = "helped" | "ignored" | "wiped" | "cleared" | "thanked" | "protected" | "abandoned" | "contract" | "ready" | "reported";
export type PartyReadinessStatus = "not-invited" | "invited" | "joined" | "ready" | "worried" | "post-wipe" | "post-clear";

export interface SocialContactState {
  id: string;
  name: string;
  role: string;
  kind: "npc" | "simulated-player" | "guild";
  trust: number;
  availability: "online" | "away" | "busy";
  relationshipTag: string;
  lastSeen: string;
  notes: string[];
  voice?: string;
}

export interface SocialMemoryEvent {
  id: string;
  contactId: string;
  contactName: string;
  kind: ContactMemoryKind;
  summary: string;
  source: string;
  tick: number;
}

export interface PartyReadinessEntry {
  contactId: string;
  status: PartyReadinessStatus;
  updatedAtTick: number;
}

export interface NoticeState {
  id: string;
  title: string;
  body: string;
  source: string;
  createdAtTick: number;
  read: boolean;
}

export interface TutorialState {
  hintsSeen: string[];
  checklistCompleteIds: string[];
}

export interface ActivityRecommendationState {
  lastAcceptedId?: string;
  cooldowns: Record<string, number>;
}

export interface GuildContractState {
  id: string;
  name: string;
  status: "available" | "accepted" | "complete" | "reported";
  progress: number;
  requirement: string;
  reward: string;
}

export interface GroupListingState {
  id: string;
  name: string;
  status: "open" | "joined" | "complete";
  rolesNeeded: string[];
  members: string[];
  routeNote: string;
}

export interface DirectorMemoryState {
  id: string;
  channelId: string;
  topic: string;
  summary: string;
  contacts: string[];
  weight: number;
}

export interface DirectorState {
  mode: "local-sim" | "api-ready";
  qualityMode: "auto" | "mini" | "cinematic" | "local";
  liveModel: string;
  cinematicModel: string;
  lastModel?: string;
  lastProvider?: "local" | "openai";
  lastFallbackReason?: string;
  lastCostUsd: number;
  estimatedSpendUsd: number;
  monthlyBudgetUsd: number;
  warnAtUsd: number;
  strongWarnAtUsd: number;
  stopAtUsd: number;
  budgetStatus: "safe" | "warn" | "strong-warn" | "stopped";
  liveTurnCount: number;
  cinematicTurnCount: number;
  localTurnCount: number;
  lastIntent?: string;
  lastMood?: string;
  storyPressure: number;
  memories: DirectorMemoryState[];
}

export type LootRollChoice = "need" | "greed" | "pass";

export interface LootRollParticipant {
  name: string;
  role: string;
  choice: LootRollChoice;
  roll: number;
  reason: string;
}

export interface PendingLootRoll {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  rarity: string;
  binding: string;
  sourceId: string;
  sourceName: string;
  tableId: string;
  threshold: string;
  canNeed: boolean;
  reason: string;
  sourceNote: string;
  participants: LootRollParticipant[];
}

export interface SocialState {
  contacts: SocialContactState[];
  guildContracts: GuildContractState[];
  groupListings: GroupListingState[];
  socialReputation: Record<string, number>;
  recentParty: string[];
  memoryEvents: SocialMemoryEvent[];
  partyReadiness: PartyReadinessEntry[];
  notices: NoticeState[];
  activityRecommendations: ActivityRecommendationState;
  director: DirectorState;
}

export interface LivingWorldState {
  tick: number;
  ambientCursor: Record<string, number>;
  schedulerCursor: Record<string, number>;
  rhythmCooldowns: Record<string, number>;
  lastProactiveTick?: number;
  lastPulseReason?: string;
}

export interface NarrativeState {
  arcId: string;
  stageId: string;
  tension: number;
  sceneCount: number;
  seenBeatIds: string[];
  vignetteCursor: Record<string, number>;
  lastBeatId?: string;
  lastVignetteId?: string;
  lastTrigger?: string;
}

export interface GameState {
  saveVersion: 1;
  profileCreated: boolean;
  activeChannelId: string;
  locationPoiId: string;
  character: CharacterState;
  inventory: InventoryItem[];
  equipment: Record<string, string>;
  quests: Record<string, QuestProgress>;
  reputation: Record<string, number>;
  sourcePity: Record<string, number>;
  flags: Record<string, boolean | number | string>;
  feed: FeedEntry[];
  social: SocialState;
  livingWorld: LivingWorldState;
  narrative: NarrativeState;
  tutorial: TutorialState;
  pendingLootRoll?: PendingLootRoll;
  dungeon?: DungeonState;
  encounter?: EncounterState;
  sessionRecap: SessionRecap;
}

export interface ActionButton {
  label: string;
  command: string;
  tone?: "primary" | "danger" | "quiet";
}

export interface CharacterCreationInput {
  name: string;
  origin: CharacterOrigin;
  vow: CharacterVow;
}
