import { FormEvent, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import { motion } from "motion/react";
import { Check, ChevronDown, HeartPulse, MapPin, Shield, Swords, UserRound, X } from "lucide-react";
import type { CharacterCreationInput, CharacterOrigin, CharacterState, CharacterVow } from "../game/types";

const origins: CharacterOrigin[] = ["Saint Veyra Ward", "Hearthmere Farmstead", "Roadwarden Foundling"];
const vows: CharacterVow[] = ["Hold the Line", "Guard the Small Flame", "Break No Oath"];
const originNotes: Record<CharacterOrigin, string> = {
  "Saint Veyra Ward": "Cathedral streets, civic bells, and a watchful first oath.",
  "Hearthmere Farmstead": "Field roads, pilgrim wax, shrine patience, and stubborn kindness.",
  "Roadwarden Foundling": "Raised by mile-markers, warning bells, and people who stand guard anyway."
};
const vowNotes: Record<CharacterVow, string> = {
  "Hold the Line": "Classic Bulwark promise: keep the danger facing you.",
  "Guard the Small Flame": "Protect the fragile thing first, even when the room turns cruel.",
  "Break No Oath": "A harder road: every promise becomes weight on the shield arm."
};

interface Props {
  hasProfile: boolean;
  savedCharacter: CharacterState;
  onContinue: () => void;
  onCreate: (input: CharacterCreationInput) => void;
}

export function LoginView({ hasProfile, savedCharacter, onContinue, onCreate }: Props) {
  const [name, setName] = useState(savedCharacter.name || "Naki");
  const [origin, setOrigin] = useState<CharacterOrigin>(savedCharacter.origin);
  const [vow, setVow] = useState<CharacterVow>(savedCharacter.vow);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const draft = useMemo(
    () => ({
      name: name.trim(),
      origin,
      vow
    }),
    [name, origin, vow]
  );
  const canCreate = draft.name.length >= 2;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!canCreate) {
      return;
    }

    if (hasProfile) {
      setConfirmOpen(true);
      return;
    }

    onCreate(draft);
  }

  function confirmCreate() {
    if (!canCreate) {
      return;
    }
    setConfirmOpen(false);
    onCreate(draft);
  }

  return (
    <main className="login-root">
      <motion.section className="login-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, ease: "easeOut" }}>
        <div className="login-copy">
          <div className="login-realm-chip">
            <span>Local Realm</span>
            <strong>First Bell</strong>
          </div>
          <div className="login-mark">
            <Shield size={28} />
          </div>
          <h1>Bellspire</h1>
          <p>
            Make your first traveler and step onto the Saint Veyra road. Your save stays local until you export it.
          </p>
          <div className="login-scene-tags" aria-label="First playable route">
            <span>Saint Veyra</span>
            <span>Hearthmere Fields</span>
            <span>Little Dawn</span>
            <span>Cryptlet</span>
          </div>
        </div>

        <form className="creator-panel" onSubmit={submit}>
          <div className="creator-header">
            <UserRound size={18} />
            <span>Character Creation</span>
          </div>

          {hasProfile ? (
            <button className="continue-card" type="button" onClick={onContinue}>
              <span>Continue as {savedCharacter.name}</span>
              <small>
                {savedCharacter.origin} / {savedCharacter.className} level {savedCharacter.level}
              </small>
            </button>
          ) : null}

          <label className="field-label" htmlFor="character-name">
            Character name
          </label>
          <input
            id="character-name"
            className="text-field"
            value={name}
            maxLength={24}
            onChange={(event) => setName(event.target.value)}
            placeholder="Naki"
          />

          <div className="field-grid">
            <div>
              <span className="field-label">
                <MapPin size={13} />
                Origin
              </span>
              <SimpleSelect value={origin} options={origins} onChange={(value) => setOrigin(value as CharacterOrigin)} />
              <p className="field-hint">{originNotes[origin]}</p>
            </div>
            <div>
              <span className="field-label">
                <HeartPulse size={13} />
                First vow
              </span>
              <SimpleSelect value={vow} options={vows} onChange={(value) => setVow(value as CharacterVow)} />
              <p className="field-hint">{vowNotes[vow]}</p>
            </div>
          </div>

          <div className="class-lock">
            <div className="class-lock-icon">
              <Swords size={20} />
            </div>
            <div>
              <span>Starter class</span>
              <strong>Bulwark</strong>
              <small>Shield, lanes, Guard Stance, Shield Oath, and oath-based protection.</small>
            </div>
          </div>

          <button className="action-button primary full-width" type="submit" disabled={!canCreate}>
            {hasProfile ? "Create New Save" : "Enter Bellspire"}
          </button>

          {!canCreate ? <p className="form-note">Use at least two letters for the character name.</p> : null}
        </form>
      </motion.section>

      <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content">
            <Dialog.Title className="dialog-title">Create a new save?</Dialog.Title>
            <Dialog.Description className="dialog-description">
              This replaces the current local character with {draft.name}. Export your current save first if you want to keep it.
            </Dialog.Description>
            <div className="dialog-actions">
              <Dialog.Close asChild>
                <button className="icon-button" type="button">
                  <X size={15} />
                  <span>Cancel</span>
                </button>
              </Dialog.Close>
              <button className="action-button primary" type="button" onClick={confirmCreate}>
                Create Save
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}

interface SelectProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function SimpleSelect({ value, options, onChange }: SelectProps) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className="select-trigger" aria-label={value}>
        <Select.Value />
        <Select.Icon>
          <ChevronDown size={15} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="select-content" position="popper" sideOffset={6}>
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item className="select-item" value={option} key={option}>
                <Select.ItemText>{option}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check size={14} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
