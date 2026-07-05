import { useRef, useState } from "react";
import { Paintbrush, Trash2, Upload } from "lucide-react";
import defaultPortrait from "../assets/portraits/bulwark-default.png";
import { requestPortrait } from "../game/aiBridge";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
  onSetPortrait: (uri?: string) => void;
}

// The character's face: the forged default painting, an uploaded image, or an
// AI-commissioned portrait via the local bellspire-ai-server (needs the
// owner's key in .env.local; the button reports honestly when it's offline).
export function PortraitPlate({ state, onSetPortrait }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const custom = state.character.portraitUri;

  function importFile(file: File | undefined) {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 192;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d")!;
        const scale = Math.max(size / img.width, size / img.height);
        context.drawImage(img, (size - img.width * scale) / 2, (size - img.height * scale) / 2, img.width * scale, img.height * scale);
        onSetPortrait(canvas.toDataURL("image/jpeg", 0.85));
        setStatus("Portrait imported");
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function commission() {
    setBusy(true);
    setStatus("Commissioning from the live bridge…");
    try {
      const result = await requestPortrait(state.character);
      if (result.ok && result.dataUri) {
        onSetPortrait(result.dataUri);
        setStatus(`Portrait commissioned${typeof result.estimatedCostUsd === "number" ? ` (~$${result.estimatedCostUsd.toFixed(2)})` : ""}`);
      } else {
        setStatus(result.error ?? "The AI bridge is offline; run `npm run ai` with your key at home.");
      }
    } catch {
      setStatus("The AI bridge is offline; run `npm run ai` with your key at home.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="portrait-plate-block">
      <div className="portrait-plate">
        <img src={custom ?? defaultPortrait} alt={`${state.character.name} portrait`} />
      </div>
      <div className="portrait-actions">
        <button className="action-button quiet" type="button" onClick={() => fileRef.current?.click()}>
          <Upload size={13} />
          <span>Import</span>
        </button>
        <button className="action-button quiet" type="button" disabled={busy} onClick={commission}>
          <Paintbrush size={13} />
          <span>Commission</span>
        </button>
        {custom ? (
          <button
            className="action-button quiet"
            type="button"
            onClick={() => {
              onSetPortrait(undefined);
              setStatus("Back to the forged portrait");
            }}
          >
            <Trash2 size={13} />
            <span>Remove</span>
          </button>
        ) : null}
      </div>
      {status ? <p className="panel-note">{status}</p> : null}
      <input ref={fileRef} className="visually-hidden" type="file" accept="image/*" onChange={(event) => importFile(event.target.files?.[0])} />
    </div>
  );
}
