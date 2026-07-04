// Headless First Road replay: bundles the game core for Node, then plays the
// whole tutorial route (login -> travel -> Olla -> Cryptlet -> loot roll) as a
// scripted bot. Asserts the run completes, that no ghost loot appears, and
// that two identical runs produce identical state (determinism guarantee the
// future realm server depends on).
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import rspack from "@rspack/core";

const projectRoot = process.cwd();
const outputDir = resolve(projectRoot, "node_modules/.cache/bellspire-headless");

function bundleHeadlessCore() {
  mkdirSync(outputDir, { recursive: true });
  const compiler = rspack.rspack({
    mode: "production",
    target: "node",
    entry: resolve(projectRoot, "src/headless.ts"),
    devtool: false,
    output: {
      path: outputDir,
      filename: "headless.cjs",
      library: { type: "commonjs2" },
      clean: true
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json"]
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: "builtin:swc-loader",
          options: {
            jsc: {
              parser: { syntax: "typescript", tsx: true },
              target: "es2022"
            }
          },
          type: "javascript/auto"
        }
      ]
    },
    optimization: { minimize: false }
  });

  return new Promise((resolvePromise, rejectPromise) => {
    compiler.run((error, stats) => {
      compiler.close(() => {
        if (error) {
          rejectPromise(error);
          return;
        }
        if (stats?.hasErrors()) {
          rejectPromise(new Error(stats.toString({ errors: true, colors: false })));
          return;
        }
        resolvePromise(undefined);
      });
    });
  });
}

const MAX_STEPS = 500;

function chooseNextCommand(state) {
  if (state.pendingLootRoll) {
    return state.pendingLootRoll.canNeed ? "need" : "greed";
  }

  if (state.encounter) {
    const intent = state.encounter.currentIntentId;
    if (intent === "road-seal-pulse" && !state.encounter.roadSealPrimed) {
      return "use road-seal bell";
    }
    if ((intent === "grave-bell-swing" || intent === "final-toll") && !state.character.guardStance) {
      return "guard frontline";
    }
    return "attack";
  }

  if (state.dungeon) {
    if (state.flags.wardenDefeated && !state.flags.cryptletComplete) {
      return "loot";
    }
    return "continue";
  }

  return null;
}

function playFirstRoad(core, log) {
  core.configureDeterministicIds("first-road-replay");

  let state = core.createInitialState({ name: "Naki", origin: "Saint Veyra Ward", vow: "Hold the Line" });
  const openingCommands = [
    "listen",
    "who",
    "travel Hearthmere Fields",
    "travel Road Shrine of Little Dawn",
    "talk Shrinekeeper Olla",
    "accept quest",
    "enter dungeon"
  ];

  for (const command of openingCommands) {
    state = core.runCommand(state, command);
  }

  let steps = 0;
  while (!state.flags.cryptletComplete && steps < MAX_STEPS) {
    const command = chooseNextCommand(state);
    if (!command) {
      break;
    }
    state = core.runCommand(state, command);
    steps += 1;
  }

  state = core.runCommand(state, "recap");
  log(`  bot finished in ${steps} dungeon steps, ${state.sessionRecap.wipes.length} wipes`);
  return state;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`FAIL ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
  console.log(`  ok ${label}`);
}

function assertTruthy(value, label) {
  if (!value) {
    throw new Error(`FAIL ${label}`);
  }
  console.log(`  ok ${label}`);
}

console.log("[replay] bundling headless core...");
await bundleHeadlessCore();

const require = createRequire(import.meta.url);
const core = require(resolve(outputDir, "headless.cjs"));

console.log("[replay] run 1: playing the First Road...");
const first = playFirstRoad(core, (line) => console.log(line));

console.log("[replay] checking end state...");
assertEqual(first.flags.cryptletComplete, true, "Cryptlet route completed");
assertEqual(first.flags.wardenDefeated, true, "Bellgrave Warden defeated");
assertEqual(first.quests["trial-under-little-dawn"].status, "complete", "Trial Under Little Dawn complete");
assertTruthy(first.inventory.length > 1, "reward items granted");
assertTruthy(
  first.inventory.every((item) => item.sourceStatus && item.source),
  "no ghost loot: every item carries a source"
);
assertTruthy(first.sessionRecap.lootRolls.length > 0, "loot roll was resolved need/greed/pass style");

console.log("[replay] run 2: verifying determinism...");
const second = playFirstRoad(core, () => {});
assertEqual(JSON.stringify(second) === JSON.stringify(first), true, "two identical runs produce identical state");

console.log("[replay] First Road replay passed.");
