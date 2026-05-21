import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const items = readJson("src/data/items.json");
const lootTables = readJson("src/data/lootTables.json");
const rarityConfig = readJson("src/data/rarityConfig.json");
const trials = Number(process.argv[2] ?? 1000);
const seedInput = Number(process.argv[3] ?? 1935);
let seed = seedInput;

const tableIds = [
  "cryptlet-road-seal-cache-first-clear",
  "cryptlet-broken-bell-niche-bonus",
  "cryptlet-bellgrave-warden-first-clear",
  "cryptlet-trash-materials-repeat"
];
const itemCounts = new Map();
const rarityCounts = new Map();
const blocked = [];
let rollPrompts = 0;
let noDrops = 0;

for (let trial = 0; trial < trials; trial += 1) {
  const brokenBellStabilized = trial % 2 === 0;
  for (const tableId of tableIds) {
    const table = lootTables.find((entry) => entry.id === tableId);
    if (!table) {
      blocked.push(`Missing table ${tableId}`);
      continue;
    }

    const entry = chooseEntry(table.entries);
    if (!entry || entry.entryType === "no-drop") {
      noDrops += 1;
      continue;
    }

    if (entry.conditionFlag === "brokenBellStabilized" && !brokenBellStabilized) {
      blocked.push(`${table.id}/${entry.id}: condition not met`);
      continue;
    }

    if (!entry.itemId) {
      continue;
    }

    const item = items.find((candidate) => candidate.id === entry.itemId);
    if (!item) {
      blocked.push(`${table.id}/${entry.id}: missing item ${entry.itemId}`);
      continue;
    }

    if (entry.distribution === "roll") {
      rollPrompts += 1;
    }

    addCount(itemCounts, item.name, entry.quantity || 1);
    addCount(rarityCounts, item.rarity, 1);
  }
}

console.log("BellSpire loot simulation");
console.log(`Trials: ${trials}`);
console.log(`Seed: ${seedInput}`);
console.log(`Roll prompts: ${rollPrompts}`);
console.log(`No-drop results: ${noDrops}`);
console.log(`Blocked entries: ${blocked.length}`);
console.log("");
console.log("Items:");
for (const [name, count] of [...itemCounts.entries()].sort((left, right) => left[0].localeCompare(right[0]))) {
  console.log(`- ${name}: ${count}`);
}
console.log("");
console.log("Rarity:");
for (const rarity of rarityConfig) {
  console.log(`- ${rarity.rarity}: ${rarityCounts.get(rarity.rarity) ?? 0}`);
}

if (blocked.length) {
  console.log("");
  console.log("Blocked samples:");
  for (const sample of blocked.slice(0, 8)) {
    console.log(`- ${sample}`);
  }
}

function chooseEntry(entries) {
  const weighted = entries.filter((entry) => Number(entry.weight) > 0);
  const total = weighted.reduce((sum, entry) => sum + Number(entry.weight), 0);
  if (!total) {
    return weighted[0];
  }

  let roll = random() * total;
  for (const entry of weighted) {
    roll -= Number(entry.weight);
    if (roll <= 0) {
      return entry;
    }
  }
  return weighted.at(-1);
}

function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0x100000000;
}

function addCount(map, key, amount) {
  map.set(key, (map.get(key) ?? 0) + amount);
}

function readJson(path) {
  return JSON.parse(readFileSync(join(repoRoot, path), "utf8"));
}
