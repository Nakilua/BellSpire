import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const items = readJson("src/data/items.json");
const rules = readJson("src/data/firstRoadLootRules.json");
const rarityRank = new Map([
  ["common", 1],
  ["uncommon", 2],
  ["rare", 3],
  ["epic", 4],
  ["mythic", 5],
  ["legendary", 6],
  ["artifact", 7]
]);
const safeSourceStatuses = ["canonical material", "canonical source row", "source checked", "staged source reward", "prototype reward", "prototype material row"];
const permanentKinds = new Set(["gear", "weapon", "armor", "shield", "trinket", "relic", "class relic"]);
const violations = [];

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

console.log(`Loot audit passed: ${rules.length} first-road rules / ${new Set(rules.flatMap((rule) => rule.items)).size} items checked.`);

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
