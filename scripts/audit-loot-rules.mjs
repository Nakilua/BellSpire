import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const items = readJson("src/data/items.json");
const rules = readJson("src/data/firstRoadLootRules.json");
const rarityConfig = readJson("src/data/rarityConfig.json");
const bindingRules = readJson("src/data/bindingRules.json");
const lootSources = readJson("src/data/lootSources.json");
const lootTables = readJson("src/data/lootTables.json");
const rarityRank = new Map(rarityConfig.map((entry) => [String(entry.rarity).toLowerCase(), Number(entry.rank)]));
const bindingIds = new Set(bindingRules.map((entry) => normalizeBinding(entry.label)));
const safeSourceStatuses = [
  "canonical material",
  "canonical source row",
  "curated-canon",
  "source checked",
  "source-governed",
  "staged source reward",
  "prototype reward",
  "prototype material row",
  "prototype container row",
  "locked-preview"
];
const permanentKinds = new Set(["gear", "weapon", "armor", "shield", "trinket", "relic", "class relic"]);
const violations = [];

auditRarityConfig();
auditBindingRules();
auditLootSources();
auditLootTables();

for (const rule of rules) {
  requireField(rule, "id", "loot rule");
  requireField(rule, "sourceId", rule.id);
  requireField(rule, "sourceName", rule.id);
  requireField(rule, "ruleType", rule.id);
  requireField(rule, "rarityFloor", rule.id);
  requireField(rule, "sourceStatus", rule.id);
  requireField(rule, "sourceNote", rule.id);

  if (!Array.isArray(rule.items) || rule.items.length === 0) {
    violations.push(`${rule.id} must include at least one item id.`);
    continue;
  }

  const floor = rarityRank.get(String(rule.rarityFloor).toLowerCase());
  if (!floor) {
    violations.push(`${rule.id} uses unknown rarity floor "${rule.rarityFloor}".`);
  }

  for (const itemId of rule.items) {
    const item = items.find((entry) => entry.id === itemId);
    if (!item) {
      violations.push(`${rule.id} references missing item "${itemId}".`);
      continue;
    }

    auditItemForRule(rule, item, floor);
  }
}

if (violations.length) {
  console.error("Loot audit failed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(
  `Loot audit passed: ${rules.length} first-road rules / ${lootTables.length} loot tables / ${lootSources.length} sources / ${new Set(rules.flatMap((rule) => rule.items)).size} legacy-rule items checked.`
);

function auditRarityConfig() {
  const seen = new Set();
  for (const rarity of rarityConfig) {
    requireField(rarity, "rarity", "rarity config");
    requireField(rarity, "rank", rarity.rarity);
    requireField(rarity, "colorHex", rarity.rarity);
    requireField(rarity, "designMeaning", rarity.rarity);
    const key = String(rarity.rarity).toLowerCase();
    if (seen.has(key)) {
      violations.push(`Duplicate rarity config "${rarity.rarity}".`);
    }
    seen.add(key);
  }
}

function auditBindingRules() {
  const seen = new Set();
  for (const binding of bindingRules) {
    requireField(binding, "id", "binding rule");
    requireField(binding, "label", binding.id);
    requireField(binding, "classicMeaning", binding.id);
    requireField(binding, "runtimeMeaning", binding.id);
    const key = normalizeBinding(binding.label);
    if (seen.has(key)) {
      violations.push(`Duplicate binding rule "${binding.label}".`);
    }
    seen.add(key);
  }
}

function auditLootSources() {
  const seen = new Set();
  for (const source of lootSources) {
    for (const field of ["id", "name", "sourceType", "zoneId", "playableStatus", "defaultLootMode", "defaultThreshold", "sourceStatus", "sourceNote"]) {
      requireField(source, field, source.id ?? "loot source");
    }

    if (seen.has(source.id)) {
      violations.push(`Duplicate loot source "${source.id}".`);
    }
    seen.add(source.id);

    if (!["playable", "preview-locked"].includes(source.playableStatus)) {
      violations.push(`${source.id} has invalid playableStatus "${source.playableStatus}".`);
    }

    if (!rarityRank.has(String(source.defaultThreshold).toLowerCase())) {
      violations.push(`${source.id} has unknown defaultThreshold "${source.defaultThreshold}".`);
    }

    if (!safeSourceStatuses.some((status) => String(source.sourceStatus).toLowerCase().includes(status))) {
      violations.push(`${source.id} has unsafe sourceStatus "${source.sourceStatus}".`);
    }
  }
}

function auditLootTables() {
  const sourceById = new Map(lootSources.map((source) => [source.id, source]));
  for (const table of lootTables) {
    for (const field of ["id", "sourceId", "name", "playableStatus", "lootMode", "threshold"]) {
      requireField(table, field, table.id ?? "loot table");
    }

    const source = sourceById.get(table.sourceId);
    if (!source) {
      violations.push(`${table.id} references missing loot source "${table.sourceId}".`);
    }

    if (!Array.isArray(table.entries) || table.entries.length === 0) {
      violations.push(`${table.id} must include entries.`);
      continue;
    }

    if (!rarityRank.has(String(table.threshold).toLowerCase())) {
      violations.push(`${table.id} has unknown threshold "${table.threshold}".`);
    }

    if (table.playableStatus === "playable" && source?.playableStatus === "preview-locked") {
      violations.push(`${table.id} is playable but its source ${source.id} is preview-locked.`);
    }

    for (const entry of table.entries) {
      auditLootTableEntry(table, source, entry);
    }
  }
}

function auditLootTableEntry(table, source, entry) {
  for (const field of ["id", "entryType", "distribution", "weight", "sourceNote"]) {
    requireField(entry, field, `${table.id}/${entry.id ?? "entry"}`);
  }

  if (Number(entry.weight) < 0) {
    violations.push(`${table.id}/${entry.id} has negative weight.`);
  }

  if (!entry.itemId) {
    if (!["no-drop", "quest-required"].includes(entry.entryType)) {
      violations.push(`${table.id}/${entry.id} has no itemId but is not no-drop or quest-required.`);
    }
    return;
  }

  const item = items.find((candidate) => candidate.id === entry.itemId);
  if (!item) {
    violations.push(`${table.id}/${entry.id} references missing item "${entry.itemId}".`);
    return;
  }

  auditItemForRule({ id: table.id, rarityFloor: "Common" }, item, 1);

  if (table.playableStatus === "playable" && source?.playableStatus !== "playable") {
    violations.push(`${table.id}/${entry.id} tries to drop ${item.id} from non-playable source ${source?.id ?? table.sourceId}.`);
  }

  if (source?.zoneId && item.zoneId !== source.zoneId) {
    violations.push(`${table.id}/${entry.id} item ${item.id} zone ${item.zoneId} does not match source zone ${source.zoneId}.`);
  }

  if (source?.dungeonId && item.dungeonId && item.dungeonId !== source.dungeonId) {
    violations.push(`${table.id}/${entry.id} item ${item.id} dungeon ${item.dungeonId} does not match source dungeon ${source.dungeonId}.`);
  }
}

function auditItemForRule(rule, item, floor) {
  for (const field of ["id", "name", "kind", "slot", "rarity", "sourceType", "sourceId", "zoneId", "source", "sourceStatus"]) {
    requireField(item, field, item.id ?? rule.id);
  }

  const itemRank = rarityRank.get(String(item.rarity).toLowerCase());
  if (!itemRank) {
    violations.push(`${item.id} uses unknown rarity "${item.rarity}".`);
  } else if (floor && itemRank < floor) {
    violations.push(`${item.id} rarity ${item.rarity} is below ${rule.id} floor ${rule.rarityFloor}.`);
  }

  if (!safeSourceStatuses.some((status) => String(item.sourceStatus).toLowerCase().includes(status))) {
    violations.push(`${item.id} sourceStatus must be canonical, staged, source checked, or prototype-labeled.`);
  }

  if (!item.binding || !bindingIds.has(normalizeBinding(item.binding))) {
    violations.push(`${item.id} must include a known binding label.`);
  }

  if (permanentKinds.has(String(item.kind).toLowerCase()) || permanentKinds.has(String(item.slot).toLowerCase())) {
    if (!item.dungeonId) {
      violations.push(`${item.id} is permanent gear and must include dungeonId for this first-road rule.`);
    }
    if (!Array.isArray(item.classTags) || item.classTags.length === 0) {
      violations.push(`${item.id} is permanent gear and must include classTags.`);
    }
    if (!String(item.sourceStatus).toLowerCase().includes("staged") && !String(item.sourceStatus).toLowerCase().includes("source checked")) {
      violations.push(`${item.id} is permanent gear and must remain staged or source checked.`);
    }
    if (normalizeBinding(item.binding) === "tradable") {
      violations.push(`${item.id} is permanent gear and cannot be Tradable in v1.`);
    }
  }
}

function requireField(record, field, label) {
  if (record[field] === undefined || record[field] === null || String(record[field]).trim() === "") {
    violations.push(`${label} is missing ${field}.`);
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(join(repoRoot, path), "utf8"));
}

function normalizeBinding(value) {
  return String(value).trim().toLowerCase();
}
