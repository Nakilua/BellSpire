import { Clipboard, Download, FileCheck, Upload } from "lucide-react";
import type { ExportReceipt } from "../game/types";

interface Props {
  exportText: string;
  exportReceipt: ExportReceipt | null;
  importText: string;
  onCopy: () => void;
  onDownload: () => void;
  onImportPasted: () => void;
  onImportTextChange: (value: string) => void;
  onPickFile: () => void;
  onValidate: () => void;
}

export function SaveTools({
  exportText,
  exportReceipt,
  importText,
  onCopy,
  onDownload,
  onImportPasted,
  onImportTextChange,
  onPickFile,
  onValidate
}: Props) {
  return (
    <section className="panel save-tools">
      <div className="panel-title">
        <FileCheck size={15} />
        <span>Save Tools</span>
      </div>

      <div className="save-button-grid">
        <button className="icon-button" type="button" onClick={onValidate}>
          <FileCheck size={15} />
          <span>Validate</span>
        </button>
        <button className="icon-button" type="button" onClick={onCopy}>
          <Clipboard size={15} />
          <span>Copy JSON</span>
        </button>
        <button className="icon-button" type="button" onClick={onDownload}>
          <Download size={15} />
          <span>Download</span>
        </button>
        <button className="icon-button" type="button" onClick={onPickFile}>
          <Upload size={15} />
          <span>File Import</span>
        </button>
      </div>

      <label className="save-label" htmlFor="save-export-preview">
        Export preview
      </label>
      {exportReceipt ? (
        <div className="export-receipt" data-testid="export-receipt">
          <div>
            <span>File</span>
            <strong>{exportReceipt.filename}</strong>
          </div>
          <div>
            <span>Bytes</span>
            <strong>{exportReceipt.byteCount}</strong>
          </div>
          <div>
            <span>Action</span>
            <strong>{exportReceipt.action}</strong>
          </div>
          <div>
            <span>SHA-256</span>
            <code>{exportReceipt.checksum}</code>
          </div>
          <small>{exportReceipt.generatedAt}</small>
        </div>
      ) : null}
      <textarea
        id="save-export-preview"
        className="save-textarea"
        readOnly
        value={exportText}
        placeholder="Use Validate or Copy JSON to show the current save here."
      />

      <label className="save-label" htmlFor="save-import-paste">
        Paste import
      </label>
      <textarea
        id="save-import-paste"
        className="save-textarea"
        value={importText}
        onChange={(event) => onImportTextChange(event.target.value)}
        placeholder="Paste a Bellspire save JSON here, then press Import Pasted."
      />
      <button className="action-button primary full-width" type="button" onClick={onImportPasted}>
        Import Pasted
      </button>
    </section>
  );
}
