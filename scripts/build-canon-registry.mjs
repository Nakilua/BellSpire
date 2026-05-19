import { DOMParser } from "@xmldom/xmldom";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import unzipper from "unzipper";

const repoRoot = process.cwd();
const sourceRoot = process.env.BELLSPIRE_SOURCE_DIR || "C:\\Users\\steph\\Downloads";
const auditIndexPath = join(repoRoot, "docs", "source_audit", "source_reading_index.json");
const registryPath = join(repoRoot, "src", "data", "canonRegistry.json");
const reportPath = join(repoRoot, "docs", "source_audit", "CANON_REGISTRY_AUDIT.md");
const runtimeDataRoot = join(repoRoot, "src", "data");
const sourceGovernancePath = join(runtimeDataRoot, "sourceGovernance.json");
const runtimeItemsPath = join(repoRoot, "src", "data", "items.json");
const runtimeRegionsPath = join(repoRoot, "src", "data", "regionTopography.json");

const launchClasses = ["Bulwark", "Dawn Priest", "Arcanist", "Nightblade", "Ranger", "Oathwarden", "Hexbinder", "Wildheart"];
const stagedStatuses = ["Prototype reward", "Staged source reward", "Staged source reward - final Master_Loot_DB item ID pending"];
const canonicalStatuses = ["Canonical material", "Canonical source row", "Source checked"];

const sourceFiles = discoverSourceFiles(sourceRoot);
const sourcePackEntries = await inspectSourcePackEntries(sourceFiles);
const workbookFiles = sourceFiles.filter((file) => file.type === ".xlsx");
const workbookSheets = [];

for (const sourceFile of workbookFiles) {
  workbookSheets.push(await readWorkbook(sourceFile));
}

const existingIndex = readJsonIfExists(auditIndexPath);
const runtimeItems = readJsonIfExists(runtimeItemsPath) ?? [];
const runtimeRegions = readJsonIfExists(runtimeRegionsPath) ?? [];
const sourceGovernance = readJsonIfExists(sourceGovernancePath) ?? { files: {} };
const runtimeDataFiles = readRuntimeDataFiles(runtimeDataRoot);
const extracted = extractCanonCollections(workbookSheets);
const researchReferences = extractResearchReferences(sourceFiles, sourcePackEntries);
const sourceAuthority = buildSourceAuthority(sourceFiles, researchReferences);
const runtimeGovernance = summarizeRuntimeGovernance(runtimeDataFiles, sourceGovernance);
const audit = auditCanon({ extracted, runtimeItems, runtimeRegions, runtimeDataFiles, sourceGovernance, sourceFiles, sourcePackEntries });

const registry = {
  generatedAt: new Date().toISOString(),
  sourceRoot,
  summary: {
    sourceFiles: sourceFiles.length,
    sourcePackEntries: sourcePackEntries.length,
    researchReferences: researchReferences.length,
    workbooks: workbookFiles.length,
    workbookSheets: workbookSheets.reduce((total, workbook) => total + workbook.sheets.length, 0),
    workbookRows: workbookSheets.reduce((total, workbook) => total + workbook.sheets.reduce((sheetTotal, sheet) => sheetTotal + sheet.rows.length, 0), 0),
    pdfFiles: sourceFiles.filter((file) => file.type === ".pdf").length,
    markdownFiles: sourceFiles.filter((file) => file.type === ".md").length,
    runtimeDataFiles: runtimeDataFiles.length,
    runtimeRecords: runtimeGovernance.records,
    runtimeGovernedFiles: runtimeGovernance.governedFiles,
    runtimeGovernedRecords: runtimeGovernance.governedRecords,
    zones: extracted.zones.length,
    pois: extracted.pois.length,
    dungeons: extracted.dungeons.length,
    bosses: extracted.bosses.length,
    publicEvents: extracted.publicEvents.length,
    materials: extracted.materials.length,
    lootSources: extracted.lootSources.length,
    lootItems: extracted.lootItems.length,
    rarityRows: extracted.rarityConfig.length,
    classHooks: extracted.classHooks.length,
    hardViolations: audit.hardViolations.length,
    warnings: audit.warnings.length
  },
  sourceFiles,
  sourcePackEntries,
  sourceAuthority,
  researchReferences,
  runtimeGovernance,
  pdfIndex: summarizePdfIndex(existingIndex),
  launchClasses,
  collections: extracted,
  audit,
  workbooks: workbookSheets
};

mkdirSync(resolve(repoRoot, "src", "data"), { recursive: true });
mkdirSync(resolve(repoRoot, "docs", "source_audit"), { recursive: true });
writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
writeFileSync(reportPath, renderReport(registry));

console.log(`Canon registry written: ${registryPath}`);
console.log(`Canon audit report written: ${reportPath}`);
console.log(`Hard violations: ${audit.hardViolations.length}`);
console.log(`Warnings: ${audit.warnings.length}`);

if (process.argv.includes("--audit") && audit.hardViolations.length > 0) {
  process.exitCode = 1;
}

function discoverSourceFiles(root) {
  if (!existsSync(root)) {
    return [];
  }

  return readdirSync(root)
    .filter((name) => /bellspire/i.test(name) || /project_bellspire/i.test(name) || name.toLowerCase() === "deep-research-report.md")
    .map((name) => {
      const path = join(root, name);
      const stats = statSync(path);
      return {
        name,
        path,
        type: extname(name).toLowerCase(),
        sizeMb: Math.round((stats.size / 1024 / 1024) * 100) / 100,
        lastModified: stats.mtime.toISOString()
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

async function inspectSourcePackEntries(files) {
  const zipFiles = files.filter((file) => file.type === ".zip");
  const entries = [];
  for (const zipFile of zipFiles) {
    try {
      const zip = await unzipper.Open.file(zipFile.path);
      entries.push(
        ...zip.files
          .filter((entry) => !entry.path.endsWith("/"))
          .map((entry) => ({
            sourcePack: zipFile.name,
            path: entry.path,
            name: basename(entry.path),
            type: extname(entry.path).toLowerCase(),
            sizeMb: Math.round(((entry.uncompressedSize ?? entry.compressedSize ?? 0) / 1024 / 1024) * 100) / 100,
            role: inferSourcePackRole(entry.path)
          }))
      );
    } catch (error) {
      entries.push({
        sourcePack: zipFile.name,
        path: zipFile.path,
        name: zipFile.name,
        type: ".zip",
        sizeMb: zipFile.sizeMb,
        role: "source-pack-error",
        error: error instanceof Error ? error.message : "Unknown zip read error"
      });
    }
  }
  return entries.sort((left, right) => left.path.localeCompare(right.path));
}

function inferSourcePackRole(path) {
  const lower = path.toLowerCase();
  if (lower.includes("research_and_source_notes")) return "research-reference";
  if (lower.includes("core_system_bibles")) return "system-bible";
  if (lower.includes("zone") || lower.includes("dungeon")) return "content-bible";
  if (lower.includes("loot") || lower.includes("item")) return "loot-source";
  if (lower.includes("manifest") || lower.includes("checksum")) return "archive-manifest";
  return "archive-source";
}

async function readWorkbook(sourceFile) {
  try {
    const zip = await unzipper.Open.file(sourceFile.path);
    const sheetDefs = await readWorkbookSheetDefs(zip);
    const sharedStrings = await readSharedStrings(zip);
    const sheets = [];
    for (const sheetDef of sheetDefs) {
      const entry = zip.files.find((file) => file.path === sheetDef.path);
      if (!entry) {
        sheets.push({
          name: sheetDef.name,
          headers: [],
          rowCount: 0,
          rows: [],
          error: `Worksheet XML missing: ${sheetDef.path}`
        });
        continue;
      }
      const rows = parseWorksheetXml((await entry.buffer()).toString("utf8"), sharedStrings);
      sheets.push(readWorksheetRows(sheetDef.name, rows));
    }

    return {
      name: sourceFile.name,
      path: sourceFile.path,
      sheets
    };
  } catch (error) {
    return {
      name: sourceFile.name,
      path: sourceFile.path,
      error: error instanceof Error ? error.message : "Unknown workbook read error",
      sheets: []
    };
  }
}

async function readWorkbookSheetDefs(zip) {
  const workbookEntry = zip.files.find((file) => file.path === "xl/workbook.xml");
  const relsEntry = zip.files.find((file) => file.path === "xl/_rels/workbook.xml.rels");
  if (!workbookEntry) {
    throw new Error("xl/workbook.xml missing");
  }
  if (!relsEntry) {
    throw new Error("xl/_rels/workbook.xml.rels missing");
  }

  const xml = (await workbookEntry.buffer()).toString("utf8");
  const document = new DOMParser().parseFromString(xml, "text/xml");
  const relsXml = (await relsEntry.buffer()).toString("utf8").replace(/^\uFEFF/, "");
  const relsDocument = new DOMParser().parseFromString(relsXml, "text/xml");
  const rels = new Map(
    nodesByLocalName(relsDocument, "Relationship").map((node) => [node.getAttribute("Id"), normalizeWorkbookTarget(node.getAttribute("Target") ?? "")])
  );
  const sheetNodes = [
    ...Array.from(document.getElementsByTagName("sheet")),
    ...Array.from(document.getElementsByTagName("x:sheet"))
  ];
  return sheetNodes
    .map((sheet) => {
      const relationshipId = sheet.getAttribute("r:id");
      return {
        name: sheet.getAttribute("name") ?? "Sheet",
        path: rels.get(relationshipId) ?? ""
      };
    })
    .filter((sheet) => sheet.path);
}

async function readSharedStrings(zip) {
  const entry = zip.files.find((file) => file.path === "xl/sharedStrings.xml");
  if (!entry) {
    return [];
  }
  const document = new DOMParser().parseFromString((await entry.buffer()).toString("utf8"), "text/xml");
  return nodesByLocalName(document, "si").map((node) => textFromNode(node));
}

function parseWorksheetXml(xml, sharedStrings) {
  const document = new DOMParser().parseFromString(xml, "text/xml");
  return nodesByLocalName(document, "row").map((rowNode) => {
    const values = [];
    for (const cell of childElementsByLocalName(rowNode, "c")) {
      const ref = cell.getAttribute("r") ?? "";
      const columnIndex = columnNameToIndex(ref.replace(/\d+/g, ""));
      values[columnIndex] = readCell(cell, sharedStrings);
    }
    return values.map((value) => value ?? "");
  });
}

function readCell(cell, sharedStrings) {
  const type = cell.getAttribute("t");
  if (type === "inlineStr") {
    const inlineString = childElementsByLocalName(cell, "is")[0];
    return inlineString ? textFromNode(inlineString) : "";
  }
  const valueNode = childElementsByLocalName(cell, "v")[0];
  const value = valueNode ? textFromNode(valueNode) : "";
  if (type === "s") {
    return sharedStrings[Number(value)] ?? "";
  }
  return value;
}

function nodesByLocalName(document, localName) {
  return Array.from(document.getElementsByTagName("*")).filter((node) => node.localName === localName || node.nodeName === localName || node.nodeName.endsWith(`:${localName}`));
}

function childElementsByLocalName(node, localName) {
  return Array.from(node.childNodes ?? []).filter((child) => child.nodeType === 1 && (child.localName === localName || child.nodeName === localName || child.nodeName.endsWith(`:${localName}`)));
}

function textFromNode(node) {
  return Array.from(node.childNodes ?? [])
    .map((child) => (child.nodeType === 3 || child.nodeType === 4 ? child.nodeValue ?? "" : textFromNode(child)))
    .join("");
}

function normalizeWorkbookTarget(target) {
  if (target.startsWith("/")) {
    return target.slice(1);
  }
  if (target.startsWith("xl/")) {
    return target;
  }
  return `xl/${target.replace(/^\.\.\//, "")}`;
}

function columnNameToIndex(columnName) {
  let index = 0;
  for (const char of columnName.toUpperCase()) {
    index = index * 26 + (char.charCodeAt(0) - 64);
  }
  return Math.max(0, index - 1);
}

function readWorksheetRows(name, rawRows) {
  const rows = [];
  let headers = [];

  rawRows.forEach((rawRow, rowIndex) => {
    const values = rawRow.map(cellToValue);
    if (!values.some((value) => value !== "")) {
      return;
    }

    if (!headers.length) {
      headers = values.map((value, index) => normalizeHeader(value, index));
      return;
    }

    const record = { __row: rowIndex + 1 };
    headers.forEach((header, index) => {
      record[header] = values[index] ?? "";
    });
    rows.push(record);
  });

  return {
    name,
    headers,
    rowCount: rows.length,
    rows
  };
}

function cellToValue(cell) {
  if (cell === null || cell === undefined) {
    return "";
  }
  if (cell instanceof Date) {
    return cell.toISOString();
  }
  if (typeof cell === "object") {
    if ("text" in cell) {
      return String(cell.text ?? "").trim();
    }
    if ("result" in cell) {
      return cellToValue(cell.result);
    }
    if ("richText" in cell && Array.isArray(cell.richText)) {
      return cell.richText.map((part) => part.text ?? "").join("").trim();
    }
    if ("hyperlink" in cell && "text" in cell) {
      return String(cell.text ?? "").trim();
    }
    return JSON.stringify(cell);
  }
  return String(cell).trim();
}

function normalizeHeader(value, index) {
  const normalized = String(value || `Column_${index + 1}`)
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || `Column_${index + 1}`;
}

function extractCanonCollections(workbooks) {
  const collections = {
    zones: [],
    pois: [],
    dungeons: [],
    rooms: [],
    bosses: [],
    publicEvents: [],
    materials: [],
    lootSources: [],
    lootItems: [],
    rarityConfig: [],
    dropRules: [],
    classHooks: []
  };

  for (const workbook of workbooks) {
    for (const sheet of workbook.sheets) {
      const source = { sourceWorkbook: workbook.name, sourceSheet: sheet.name };
      const namedRows = sheet.rows.map((row) => ({ ...row, ...source }));
      const sheetName = sheet.name.toLowerCase();

      if (sheetName === "zone_db") collections.zones.push(...namedRows);
      if (sheetName.includes("zone_poi") || sheetName.includes("sublocation") || sheetName.includes("hub_service")) collections.pois.push(...namedRows);
      if (sheetName.includes("instance_db") || sheetName.includes("dungeon_db") || sheetName.includes("dungeon_lead")) collections.dungeons.push(...namedRows);
      if (sheetName.includes("instance_rooms") || sheetName.includes("dungeon_room")) collections.rooms.push(...namedRows);
      if (sheetName.includes("boss")) collections.bosses.push(...namedRows);
      if (sheetName.includes("public_event")) collections.publicEvents.push(...namedRows);
      if (sheetName.includes("material") || sheetName.includes("currency")) collections.materials.push(...namedRows);
      if (sheetName.includes("loot_source") || sheetName.includes("source_tables")) collections.lootSources.push(...namedRows);
      if (sheetName.includes("item_master")) collections.lootItems.push(...namedRows);
      if (sheetName.includes("rarity_config")) collections.rarityConfig.push(...namedRows);
      if (sheetName.includes("drop_rules")) collections.dropRules.push(...namedRows);
      if (sheetName.includes("class_hook")) collections.classHooks.push(...namedRows);
    }
  }

  return collections;
}

function extractResearchReferences(files, packEntries) {
  const directResearch = files
    .filter((file) => file.name.toLowerCase() === "deep-research-report.md")
    .map((file) => ({
      name: file.name,
      path: file.path,
      type: file.type,
      source: "local-downloads",
      role: "research-reference",
      authority: "Systems and production guidance only; does not override canon names, story facts, or loot rows."
    }));

  const packedResearch = packEntries
    .filter((entry) => entry.role === "research-reference" || /research|source_notes|loot_tiers|worldbuilding|mmorpg/i.test(entry.path))
    .map((entry) => ({
      name: entry.name,
      path: entry.path,
      type: entry.type,
      source: entry.sourcePack,
      role: entry.role,
      authority: "Design reference for MMO structure, pacing, UX, economy, reward cadence, and living-world behavior."
    }));

  return [...directResearch, ...packedResearch].sort((left, right) => left.name.localeCompare(right.name));
}

function buildSourceAuthority(files, researchReferences) {
  return [
    {
      tier: 1,
      label: "Primary canon archive",
      authority: "Defines Bellspire world facts, names, tone, launch scope, and content boundaries.",
      sources: files
        .filter((file) => /Complete_Canon_Compendium_v1_1\.pdf$/i.test(file.name) || /Complete_Data_Workbook_v1_1\.xlsx$/i.test(file.name))
        .map(sourceSummary)
    },
    {
      tier: 2,
      label: "Loot and reward worktables",
      authority: "Defines permanent item rows, rarity, loot-source law, staged rewards, source pity, and reward safety.",
      sources: files
        .filter((file) => /loot|workbook|db_patch_rows/i.test(file.name) && file.type === ".xlsx")
        .map(sourceSummary)
    },
    {
      tier: 3,
      label: "Focused content bibles and patch artifacts",
      authority: "Defines focused zones, dungeons, events, bosses, activities, and future locked-preview content.",
      sources: files
        .filter((file) => file.type === ".pdf" && !/Complete_Canon_Compendium_v1_1\.pdf$/i.test(file.name))
        .map(sourceSummary)
    },
    {
      tier: 4,
      label: "Discord/map playstyle and Codex handoff prompts",
      authority: "Defines the playable app style: Discord-like text MMO, map-first navigation, local-first MVP guardrails.",
      sources: files
        .filter((file) => /Discord_Map_Playstyle|Codex_Handoff/i.test(file.name))
        .map(sourceSummary)
    },
    {
      tier: 5,
      label: "Research and production references",
      authority: "Inform system quality, MMO feel, economy, progression, UX, and social design. They cannot rename canon or create permanent loot.",
      sources: researchReferences.map((entry) => ({
        name: entry.name,
        path: entry.path,
        type: entry.type,
        source: entry.source
      }))
    }
  ];
}

function sourceSummary(file) {
  return {
    name: file.name,
    path: file.path,
    type: file.type,
    lastModified: file.lastModified
  };
}

function readRuntimeDataFiles(root) {
  return readdirSync(root)
    .filter((name) => name.endsWith(".json") && !["canonRegistry.json", "sourceGovernance.json"].includes(name))
    .map((name) => {
      const path = join(root, name);
      const data = readJsonIfExists(path);
      return {
        name,
        path,
        records: enumerateRuntimeRecords(name, data)
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

function enumerateRuntimeRecords(fileName, data) {
  const records = [];
  if (Array.isArray(data)) {
    data.forEach((record, index) => {
      const id = record?.id ?? `${fileName}[${index}]`;
      records.push({ id: String(id), path: `${fileName}:${id}` });

      if (fileName === "dungeons.json" && Array.isArray(record.rooms)) {
        for (const room of record.rooms) {
          const roomId = room.id ?? `room-${records.length}`;
          records.push({ id: `${id}.rooms.${roomId}`, path: `${fileName}:${id}.rooms.${roomId}` });
        }
      }

      if (fileName === "encounters.json" && Array.isArray(record.intents)) {
        for (const intent of record.intents) {
          const intentId = intent.id ?? `intent-${records.length}`;
          records.push({ id: `${id}.intents.${intentId}`, path: `${fileName}:${id}.intents.${intentId}` });
        }
      }
    });
    return records;
  }

  if (data && typeof data === "object") {
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        value.forEach((record, index) => {
          const id = record?.id ?? record?.reason ?? `${key}[${index}]`;
          records.push({ id: String(id), path: `${fileName}:${key}.${id}` });
        });
      }
    }
  }
  return records;
}

function summarizeRuntimeGovernance(runtimeDataFiles, sourceGovernance) {
  const governanceFiles = sourceGovernance.files ?? {};
  return runtimeDataFiles.reduce(
    (summary, file) => {
      const hasDefault = Boolean(governanceFiles[file.name]?.default);
      summary.records += file.records.length;
      if (hasDefault) {
        summary.governedFiles += 1;
        summary.governedRecords += file.records.length;
      }
      return summary;
    },
    { files: runtimeDataFiles.length, records: 0, governedFiles: 0, governedRecords: 0 }
  );
}

function auditCanon({ extracted, runtimeItems, runtimeRegions, runtimeDataFiles, sourceGovernance, sourceFiles, sourcePackEntries }) {
  const hardViolations = [];
  const warnings = [];
  for (const workbook of workbookSheets) {
    if (workbook.error) {
      warnings.push(`Workbook could not be read by the canon registry parser: ${workbook.name} (${workbook.error})`);
    }
  }
  const rarityNames = new Set(extracted.rarityConfig.map((row) => valueOf(row, ["Rarity"]).toLowerCase()).filter(Boolean));
  const allowedRarities = new Set(["common", "uncommon", "rare", "epic", "mythic", "legendary", "artifact", ...rarityNames]);

  for (const item of extracted.lootItems) {
    const id = valueOf(item, ["ItemID", "Item_ID", "id"]);
    const name = valueOf(item, ["ItemName", "Item_Name", "Name"]);
    const rarity = valueOf(item, ["Rarity"]);
    if (!id || !name) {
      hardViolations.push(`Source item row missing ItemID or ItemName in ${item.sourceWorkbook}/${item.sourceSheet} row ${item.__row}.`);
    }
    if (!rarity) {
      hardViolations.push(`Source item ${id || name || "(unknown)"} is missing rarity.`);
    } else if (!allowedRarities.has(rarity.toLowerCase())) {
      hardViolations.push(`Source item ${id || name} uses unknown rarity "${rarity}".`);
    }
  }

  for (const item of runtimeItems) {
    if (!item.id || !item.name) {
      hardViolations.push(`Runtime item is missing id or name: ${JSON.stringify(item)}`);
    }
    if (!item.rarity) {
      hardViolations.push(`Runtime item ${item.id || item.name} is missing rarity.`);
    } else if (!allowedRarities.has(String(item.rarity).toLowerCase())) {
      hardViolations.push(`Runtime item ${item.id || item.name} uses unknown rarity "${item.rarity}".`);
    }
    if (!item.sourceStatus) {
      hardViolations.push(`Runtime item ${item.id || item.name} is missing sourceStatus.`);
    }
    if (isPermanentGear(item) && !isSourceSafe(item.sourceStatus)) {
      hardViolations.push(`Permanent gear ${item.id || item.name} must be source-checked, staged, or prototype-labeled.`);
    }
  }

  const classCoverage = new Set(
    extracted.classHooks
      .map((row) => valueOf(row, ["Class", "RoleClass", "Role_Class"]))
      .flatMap((value) => launchClasses.filter((className) => value.toLowerCase().includes(className.toLowerCase())))
  );
  for (const className of launchClasses) {
    if (!classCoverage.has(className) && className !== "Bulwark") {
      warnings.push(`No explicit class hook row found for ${className}; keep it preview-only until sourced.`);
    }
  }

  const regionIds = new Set(runtimeRegions.map((region) => region.id));
  for (const region of runtimeRegions) {
    for (const connection of region.connections ?? []) {
      if (!regionIds.has(connection)) {
        hardViolations.push(`Region ${region.id} connects to unknown region ${connection}.`);
      }
    }
  }

  auditRuntimeGovernance({ hardViolations, warnings, runtimeDataFiles, sourceGovernance, sourceFiles, sourcePackEntries });

  if (!extracted.lootSources.length) {
    warnings.push("No loot source rows were extracted from workbooks.");
  }
  if (!extracted.dropRules.length) {
    warnings.push("No drop rule rows were extracted from workbooks.");
  }
  if (!extracted.lootItems.length) {
    warnings.push("No item master rows were extracted from workbooks.");
  }

  return {
    hardViolations,
    warnings,
    status: hardViolations.length ? "failed" : "passed"
  };
}

function auditRuntimeGovernance({ hardViolations, warnings, runtimeDataFiles, sourceGovernance, sourceFiles, sourcePackEntries }) {
  const governanceFiles = sourceGovernance.files ?? {};
  const knownSourceNames = new Set([
    ...sourceFiles.map((file) => file.name),
    ...sourcePackEntries.map((entry) => entry.name),
    ...sourcePackEntries.map((entry) => entry.sourcePack)
  ]);

  for (const file of runtimeDataFiles) {
    const governance = governanceFiles[file.name];
    if (!governance?.default) {
      hardViolations.push(`Runtime data file ${file.name} is missing sourceGovernance coverage.`);
      continue;
    }

    validateGovernanceEntry(`${file.name} default`, governance.default, knownSourceNames, hardViolations);
    if (!file.records.length) {
      warnings.push(`Runtime data file ${file.name} has no enumerable records.`);
    }
  }
}

function validateGovernanceEntry(label, entry, knownSourceNames, hardViolations) {
  const tier = Number(entry.sourceTier);
  if (!Number.isInteger(tier) || tier < 1 || tier > 5) {
    hardViolations.push(`${label} must declare sourceTier 1-5.`);
  }
  if (!entry.sourceStatus || typeof entry.sourceStatus !== "string") {
    hardViolations.push(`${label} must declare sourceStatus.`);
  }
  if (!Array.isArray(entry.sourceRefs) || entry.sourceRefs.length === 0) {
    hardViolations.push(`${label} must declare sourceRefs.`);
    return;
  }
  for (const ref of entry.sourceRefs) {
    if (!knownSourceNames.has(ref)) {
      hardViolations.push(`${label} references unknown source "${ref}".`);
    }
  }
}

function isPermanentGear(item) {
  return ["gear", "weapon", "armor", "shield", "trinket", "relic", "class relic"].includes(String(item.kind ?? item.slot ?? "").toLowerCase());
}

function isSourceSafe(sourceStatus = "") {
  return [...stagedStatuses, ...canonicalStatuses].some((status) => sourceStatus.toLowerCase().includes(status.toLowerCase()));
}

function valueOf(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
      return String(row[key]).trim();
    }
  }
  return "";
}

function summarizePdfIndex(index) {
  if (!index) {
    return {
      available: false,
      note: "No PDF reading index found."
    };
  }

  return {
    available: true,
    generatedOn: index.generated_on,
    inventoryCount: index.inventory?.length ?? 0,
    pdfAudits: index.pdf_audits?.map((entry) => ({
      name: entry.name,
      pages: entry.pages,
      headings: entry.headings?.slice?.(0, 8) ?? []
    })) ?? [],
    compendiumPagesIndexed: index.compendium_page_index?.length ?? 0,
    currentAppCoverage: index.current_app_coverage ?? {}
  };
}

function renderReport(registry) {
  const audit = registry.audit;
  return [
    "# Bellspire Canon Registry Audit",
    "",
    `Generated: ${registry.generatedAt}`,
    "",
    "## Summary",
    "",
    `- Source files discovered: ${registry.summary.sourceFiles}`,
    `- Source-pack entries indexed: ${registry.summary.sourcePackEntries}`,
    `- Research references indexed: ${registry.summary.researchReferences}`,
    `- Workbooks scanned: ${registry.summary.workbooks}`,
    `- Workbook sheets scanned: ${registry.summary.workbookSheets}`,
    `- Workbook rows normalized: ${registry.summary.workbookRows}`,
    `- PDF files represented by reading index: ${registry.summary.pdfFiles}`,
    `- Runtime data files governed: ${registry.summary.runtimeGovernedFiles}/${registry.summary.runtimeDataFiles}`,
    `- Runtime records governed: ${registry.summary.runtimeGovernedRecords}/${registry.summary.runtimeRecords}`,
    `- Zones extracted: ${registry.summary.zones}`,
    `- Dungeons/instances extracted: ${registry.summary.dungeons}`,
    `- Boss rows extracted: ${registry.summary.bosses}`,
    `- Loot source rows extracted: ${registry.summary.lootSources}`,
    `- Item master rows extracted: ${registry.summary.lootItems}`,
    `- Runtime audit status: ${audit.status}`,
    "",
    "## Hard Violations",
    "",
    ...(audit.hardViolations.length ? audit.hardViolations.map((line) => `- ${line}`) : ["- None."]),
    "",
    "## Warnings / Preview Gaps",
    "",
    ...(audit.warnings.length ? audit.warnings.map((line) => `- ${line}`) : ["- None."]),
    "",
    "## Runtime Source Governance",
    "",
    `- Runtime data files governed: ${registry.summary.runtimeGovernedFiles}/${registry.summary.runtimeDataFiles}`,
    `- Runtime records governed: ${registry.summary.runtimeGovernedRecords}/${registry.summary.runtimeRecords}`,
    "- Governance map: src/data/sourceGovernance.json",
    "",
    "## Source Authority Ladder",
    "",
    ...registry.sourceAuthority.flatMap((tier) => [
      `### Tier ${tier.tier}: ${tier.label}`,
      "",
      tier.authority,
      "",
      ...(tier.sources.length ? tier.sources.map((source) => `- ${source.name}`) : ["- No matching local source files found."]),
      ""
    ]),
    "## Source Workbooks",
    "",
    ...registry.workbooks.map((workbook) => `- ${basename(workbook.path)}: ${workbook.sheets.length} sheets / ${workbook.sheets.reduce((total, sheet) => total + sheet.rows.length, 0)} rows`),
    "",
    "## Research References",
    "",
    ...(registry.researchReferences.length ? registry.researchReferences.map((entry) => `- ${entry.name} (${entry.source})`) : ["- None indexed."]),
    ""
  ].join("\n");
}

function readJsonIfExists(path) {
  if (!existsSync(path)) {
    return null;
  }
  return JSON.parse(readFileSync(path, "utf8"));
}
