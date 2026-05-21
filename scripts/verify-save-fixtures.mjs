import { readFileSync } from "node:fs";
import { join } from "node:path";

const fixtures = readJson("src/data/saveFixtures.json");
const allowedExact = new Set(["look", "listen", "world pulse", "talk Shrinekeeper Olla", "accept quest", "enter dungeon", "recap"]);
const allowedPrefixes = ["travel ", "party ", "guild ", "invite ", "join ", "ready", "report contract"];
const violations = [];
const ids = new Set();

for (const fixture of fixtures) {
  if (!fixture.id || ids.has(fixture.id)) {
    violations.push(`Fixture id is missing or duplicated: ${fixture.id ?? "(missing)"}.`);
  }
  ids.add(fixture.id);

  for (const field of ["label", "description"]) {
    if (!fixture[field] || typeof fixture[field] !== "string") {
      violations.push(`${fixture.id} is missing ${field}.`);
    }
  }

  if (!Array.isArray(fixture.commands)) {
    violations.push(`${fixture.id} commands must be an array.`);
    continue;
  }

  for (const command of fixture.commands) {
    if (!allowedExact.has(command) && !allowedPrefixes.some((prefix) => command.startsWith(prefix))) {
      violations.push(`${fixture.id} uses unsupported fixture command "${command}".`);
    }
  }
}

if (violations.length) {
  console.error("Fixture audit failed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(`Fixture audit passed: ${fixtures.length} save fixture descriptors checked.`);

function readJson(path) {
  return JSON.parse(readFileSync(join(process.cwd(), path), "utf8"));
}
