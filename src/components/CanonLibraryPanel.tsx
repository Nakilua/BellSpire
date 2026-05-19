import { BookMarked, ShieldCheck } from "lucide-react";
import canonRegistry from "../data/canonRegistry.json";
import classes from "../data/classes.json";

export function CanonLibraryPanel() {
  const summary = canonRegistry.summary;
  const playable = classes.filter((entry) => entry.status === "playable");
  const preview = classes.filter((entry) => entry.status !== "playable");

  return (
    <section className="panel canon-library-panel">
      <div className="panel-title">
        <BookMarked size={15} />
        <span>Canon Library</span>
      </div>

      <div className="canon-stat-grid">
        <CanonStat label="Zones" value={summary.zones} />
        <CanonStat label="Dungeons" value={summary.dungeons} />
        <CanonStat label="Loot items" value={summary.lootItems} />
        <CanonStat label="Runtime governed" value={`${summary.runtimeGovernedRecords}/${summary.runtimeRecords}`} />
      </div>

      <div className="canon-audit-strip">
        <ShieldCheck size={14} />
        <span>{summary.hardViolations === 0 ? "Loot canon clean" : `${summary.hardViolations} canon issues`}</span>
      </div>

      <div className="canon-source-note">
        <strong>Source law:</strong> compendium and workbooks first; loot tables govern rewards; research shapes systems only.
      </div>

      <div className="class-preview-list">
        {playable.map((entry) => (
          <div className="class-preview-row active" key={entry.id}>
            <strong>{entry.name}</strong>
            <span>{entry.status}</span>
          </div>
        ))}
        {preview.slice(0, 7).map((entry) => (
          <div className="class-preview-row" key={entry.id}>
            <strong>{entry.name}</strong>
            <span>{entry.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CanonStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="canon-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
