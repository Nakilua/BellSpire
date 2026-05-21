import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const mapsRoot = join(process.cwd(), "src", "assets", "maps");
const maxSingleMb = 5.25;
const maxTotalMb = 32;
const files = readdirSync(mapsRoot).filter((file) => /\.(png|jpe?g|webp)$/i.test(file));
const sizes = files.map((file) => {
  const sizeMb = statSync(join(mapsRoot, file)).size / 1024 / 1024;
  return { file, sizeMb };
});
const totalMb = sizes.reduce((total, entry) => total + entry.sizeMb, 0);
const violations = [];

for (const entry of sizes) {
  if (entry.sizeMb > maxSingleMb) {
    violations.push(`${entry.file} is ${entry.sizeMb.toFixed(2)} MB; keep individual map assets at or below ${maxSingleMb} MB.`);
  }
}

if (totalMb > maxTotalMb) {
  violations.push(`Map asset total is ${totalMb.toFixed(2)} MB; keep total at or below ${maxTotalMb} MB for this local MVP.`);
}

if (violations.length) {
  console.error("Map asset audit failed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(`Map asset audit passed: ${files.length} files / ${totalMb.toFixed(2)} MB total.`);
