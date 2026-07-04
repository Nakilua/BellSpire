import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Clipboard, Download, HeartPulse, RotateCcw, Shield, Upload, UserRound } from "lucide-react";
import { ChannelRail } from "./components/ChannelRail";
import { CommandBar } from "./components/CommandBar";
import { EncounterBubble } from "./components/EncounterBubble";
import { HudPanelTabs } from "./components/HudPanelTabs";
import { LoginView } from "./components/LoginView";
import { NarrativeFeed } from "./components/NarrativeFeed";
import { fetchAiStatus, requestLiveDirector } from "./game/aiBridge";
import { shouldUseLocalDirector } from "./game/budget";
import { runCommand } from "./game/commands";
import { applyExternalDirectorChat, markDirectorFallback, runDirectorChat, runDirectorPrompt } from "./game/director";
import { applyRealmChat, applyRealmRoster, applyRealmStatus } from "./game/realm";
import { realmBridge } from "./game/realmBridge";
import { postGuildChat, postPartyChat } from "./game/social";
import { addFeed, createInitialState, sanitizeImportedState, STORAGE_KEY } from "./game/state";
import { getAvailableActions, getCurrentPoi, getCurrentZone } from "./game/selectors";
import type { CharacterCreationInput, ExportReceipt, GameState } from "./game/types";

type AppRoute = "game" | "login";
type LiveDirectorRequest = { channelId: "party-chat" | "guild-board" | "director"; message: string };

function loadInitialState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return createInitialState();
    }
    return sanitizeImportedState(JSON.parse(saved)) ?? createInitialState();
  } catch {
    return createInitialState();
  }
}

function getRouteFromPath(): AppRoute {
  return window.location.pathname.toLowerCase() === "/login" ? "login" : "game";
}

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the selection-based copy path for stricter browsers.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

async function buildExportReceipt(text: string, action: ExportReceipt["action"]): Promise<ExportReceipt> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const checksum = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");

  return {
    filename: "bellspire-save-v1.json",
    byteCount: bytes.byteLength,
    checksum,
    generatedAt: new Date().toISOString(),
    action
  };
}

export default function App() {
  const [state, setState] = useState<GameState>(loadInitialState);
  const [route, setRoute] = useState<AppRoute>(getRouteFromPath);
  const [saveStatus, setSaveStatus] = useState("Autosaved locally");
  const [exportText, setExportText] = useState("");
  const [exportReceipt, setExportReceipt] = useState<ExportReceipt | null>(null);
  const [importText, setImportText] = useState("");
  const importInputRef = useRef<HTMLInputElement>(null);
  const stateChangeStatusRef = useRef<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setSaveStatus(stateChangeStatusRef.current ?? "Autosaved locally");
    stateChangeStatusRef.current = null;
  }, [state]);

  useEffect(() => {
    function syncRoute() {
      setRoute(getRouteFromPath());
    }

    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  useEffect(() => {
    fetchAiStatus()
      .then((status) => {
        setState((current) => ({
          ...current,
          social: {
            ...current.social,
            director: {
              ...current.social.director,
              mode: status.hasKey ? "api-ready" : "local-sim",
              liveModel: status.liveModel,
              cinematicModel: status.cinematicModel,
              lastModel: current.social.director.lastProvider === "local" ? undefined : current.social.director.lastModel,
              lastFallbackReason: status.hasKey ? undefined : "AI bridge has no key"
            }
          }
        }));
      })
      .catch(() => {
        setState((current) => ({
          ...current,
          social: {
            ...current.social,
            director: {
              ...current.social.director,
              mode: "local-sim",
              lastFallbackReason: "AI bridge offline"
            }
          }
        }));
      });
  }, []);

  const characterName = state.character.name;
  const currentZoneId = getCurrentZone(state).id;

  useEffect(() => {
    if (!state.profileCreated) {
      return;
    }

    realmBridge.connect(
      { name: characterName, className: state.character.className, zoneId: currentZoneId },
      {
        onStatus: (status, realmName, selfSessionId) => setState((current) => applyRealmStatus(current, status, realmName, selfSessionId)),
        onRoster: (players) => setState((current) => applyRealmRoster(current, players)),
        onChat: (message) => setState((current) => applyRealmChat(current, message))
      }
    );

    return () => realmBridge.disconnect();
    // Reconnect only when the profile or character identity changes, not on
    // every state tick; zone changes are streamed via sendMove below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.profileCreated, characterName]);

  useEffect(() => {
    realmBridge.sendMove(currentZoneId);
  }, [currentZoneId]);

  const actions = useMemo(() => getAvailableActions(state), [state]);
  const currentPoi = getCurrentPoi(state);
  const currentSaveJson = useMemo(() => JSON.stringify(state, null, 2), [state]);
  const sceneKey = getSceneKey(state);

  function dispatchCommand(command: string) {
    const worldChat = getWorldChatMessage(state, command);
    if (worldChat && realmBridge.isConnected) {
      realmBridge.sendChat(worldChat.channelId, worldChat.body);
    }

    const liveRequest = getLiveDirectorRequest(state, command);
    if (!liveRequest) {
      setState((current) => runCommand(current, command));
      return;
    }

    if (shouldUseLocalDirector(state)) {
      setState((current) => runLocalDirectorRequest(current, liveRequest));
      return;
    }

    const optimisticState =
      liveRequest.channelId === "director"
        ? addFeed(state, "social", `${state.character.name} to AI Director`, liveRequest.message, "live director request")
        : liveRequest.channelId === "party-chat"
          ? postPartyChat(state, liveRequest.message, { deferDirector: true })
          : postGuildChat(state, liveRequest.message, { deferDirector: true });

    setState(optimisticState);

    requestLiveDirector(optimisticState, liveRequest.channelId, liveRequest.message)
      .then((result) => {
        setState((current) => {
          if (
            !result.ok ||
            !result.replies?.length ||
            !result.provider ||
            !result.mode ||
            !result.model ||
            typeof result.estimatedCostUsd !== "number" ||
            !result.intent ||
            !result.mood ||
            !result.topic ||
            !result.memory
          ) {
            const fallback = markDirectorFallback(current, result.fallbackReason ?? "AI bridge unavailable");
            if (liveRequest.channelId === "director") {
              return runDirectorPrompt(fallback, liveRequest.message);
            }
            return runDirectorChat(fallback, liveRequest.channelId, liveRequest.message);
          }

          return applyExternalDirectorChat(current, liveRequest.channelId, liveRequest.message, {
            provider: result.provider,
            mode: result.mode,
            model: result.model,
            estimatedCostUsd: result.estimatedCostUsd,
            usage: result.usage,
            budgetStatus: result.budgetStatus,
            fallbackReason: result.fallbackReason,
            intent: result.intent,
            mood: result.mood,
            topic: result.topic,
            memory: result.memory,
            replies: result.replies
          });
        });
      })
      .catch((error) => {
        setState((current) => {
          const fallback = markDirectorFallback(current, error instanceof Error ? error.message : "AI bridge unavailable");
          if (liveRequest.channelId === "director") {
            return runDirectorPrompt(fallback, liveRequest.message);
          }
          return runDirectorChat(fallback, liveRequest.channelId, liveRequest.message);
        });
      });
  }

  function navigate(nextRoute: AppRoute) {
    const path = nextRoute === "login" ? "/login" : "/";
    window.history.pushState({}, "", path);
    setRoute(nextRoute);
  }

  function createCharacter(input: CharacterCreationInput) {
    stateChangeStatusRef.current = "Character created";
    setState(createInitialState(input));
    navigate("game");
  }

  function continueGame() {
    navigate("game");
  }

  async function prepareSaveText(action: ExportReceipt["action"], status = "Save JSON prepared") {
    setExportText(currentSaveJson);
    const receipt = await buildExportReceipt(currentSaveJson, action);
    setExportReceipt(receipt);
    setSaveStatus(`${status} (${receipt.byteCount} bytes / sha256 ${receipt.checksum.slice(0, 12)})`);
    return currentSaveJson;
  }

  async function downloadSave() {
    const text = await prepareSaveText("download", "Download verified locally; browser save requested");
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "bellspire-save-v1.json";
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    window.setTimeout(() => {
      anchor.remove();
      URL.revokeObjectURL(url);
    }, 1000);
  }

  async function copySave() {
    const text = await prepareSaveText("copy", "Save JSON copied");
    const copied = await copyTextToClipboard(text);
    if (!copied) {
      setSaveStatus("Clipboard blocked; save JSON is visible below");
    }
  }

  function importSave(file: File | undefined) {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = sanitizeImportedState(JSON.parse(String(reader.result)));
        if (!imported) {
          setSaveStatus("Import failed: invalid save");
          return;
        }
        stateChangeStatusRef.current = "Save JSON imported";
        setState(imported);
        setExportText("");
        setExportReceipt(null);
        setImportText("");
      } catch {
        setSaveStatus("Import failed: unreadable JSON");
      }
    };
    reader.readAsText(file);
  }

  function importPastedSave() {
    try {
      const imported = sanitizeImportedState(JSON.parse(importText));
      if (!imported) {
        setSaveStatus("Paste import failed: invalid save");
        return;
      }
      stateChangeStatusRef.current = "Pasted save JSON imported";
      setState(imported);
      setExportText("");
      setExportReceipt(null);
      setImportText("");
    } catch {
      setSaveStatus("Paste import failed: unreadable JSON");
    }
  }

  async function validateCurrentSave() {
    const text = await prepareSaveText("validate", "Current save validated");
    const imported = sanitizeImportedState(JSON.parse(text));
    if (!imported) {
      setSaveStatus("Current save failed validation");
    }
  }

  function resetSave() {
    const next = createInitialState();
    stateChangeStatusRef.current = "New session started";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setState(next);
    setExportText("");
    setExportReceipt(null);
    setImportText("");
    navigate("login");
  }

  const showLogin = route === "login" || !state.profileCreated;

  return (
    <div className={`app-root scene-${sceneKey}`}>
      <div className="app-background" />
      <AnimatePresence mode="wait">
        {showLogin ? (
          <LoginView
            key="login"
            hasProfile={state.profileCreated}
            savedCharacter={state.character}
            onContinue={continueGame}
            onCreate={createCharacter}
          />
        ) : (
          <motion.div className="app-shell" key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.24 }}>
        <Tooltip.Provider delayDuration={220}>
          <header className="app-header">
            <div className="brand-block">
              <span className="realm-badge">
                {state.realm.status === "connected"
                  ? `${state.realm.realmName ?? "Live Realm"} / ${state.realm.players.length + 1} online / Save v${state.saveVersion}`
                  : `Local Realm / Save v${state.saveVersion}`}
              </span>
              <h1 className="app-title">BellSpire</h1>
              <p className="app-subtitle">
                {currentPoi.name} / {state.character.className} level {state.character.level}
              </p>
            </div>

            <div className="hud-stat-cluster" aria-label="Character status">
              <HudMeter icon={<HeartPulse size={15} />} label="HP" value={state.character.hp} max={state.character.maxHp} tone="hp" />
              <HudMeter icon={<Shield size={15} />} label="Oath" value={state.character.oath} max={100} tone="oath" />
              <div className="ai-status-chip">
                <span>AI</span>
                <strong>{state.social.director.mode}</strong>
              </div>
            </div>

            <div className="header-actions">
              <span className="save-status">{saveStatus}</span>
              <HeaderActionButton label="Character" icon={<UserRound size={16} />} onClick={() => navigate("login")} />
              <HeaderActionButton label="Download" icon={<Download size={16} />} onClick={downloadSave} />
              <HeaderActionButton label="Copy" icon={<Clipboard size={16} />} onClick={copySave} />
              <HeaderActionButton label="Import" icon={<Upload size={16} />} onClick={() => importInputRef.current?.click()} />
              <HeaderActionButton label="Reset" icon={<RotateCcw size={16} />} onClick={resetSave} danger />
              <input
                ref={importInputRef}
                className="visually-hidden"
                type="file"
                accept="application/json,.json"
                onChange={(event) => importSave(event.target.files?.[0])}
              />
            </div>
          </header>
        </Tooltip.Provider>

        <div className="app-layout">
          <ChannelRail state={state} onCommand={dispatchCommand} />

          <main className="main-panel">
            <EncounterBubble state={state} onCommand={dispatchCommand} />
            <NarrativeFeed entries={state.feed} actions={actions} onCommand={dispatchCommand} />
            <CommandBar actions={actions} onCommand={dispatchCommand} />
          </main>

          <aside className="right-panel">
            <HudPanelTabs
              state={state}
              exportText={exportText}
              exportReceipt={exportReceipt}
              importText={importText}
              onCommand={dispatchCommand}
              onCopy={copySave}
              onDownload={downloadSave}
              onImportPasted={importPastedSave}
              onImportTextChange={setImportText}
              onPickFile={() => importInputRef.current?.click()}
              onValidate={validateCurrentSave}
            />
          </aside>
        </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HudMeter({ icon, label, value, max, tone }: { icon: ReactNode; label: string; value: number; max: number; tone: "hp" | "oath" }) {
  const percent = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className={`hud-meter ${tone}`}>
      <div className="hud-meter-top">
        {icon}
        <span>{label}</span>
        <strong>
          {value}/{max}
        </strong>
      </div>
      <div className="hud-meter-track">
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function HeaderActionButton({ label, icon, onClick, danger = false }: { label: string; icon: ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button className={`icon-button ${danger ? "danger" : ""}`} type="button" onClick={onClick} aria-label={label}>
          {icon}
          <span>{label}</span>
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="tooltip-content" sideOffset={8}>
          {label}
          <Tooltip.Arrow className="tooltip-arrow" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

function getSceneKey(state: GameState) {
  if (state.dungeon || state.locationPoiId === "pilgrim-trial-cryptlet") {
    return "cryptlet";
  }
  if (state.locationPoiId === "road-shrine-little-dawn") {
    return "shrine";
  }
  if (state.locationPoiId.includes("hearthmere")) {
    return "fields";
  }
  return "saint";
}

function getWorldChatMessage(state: GameState, command: string): { channelId: "global-chat" | "zone-chat"; body: string } | null {
  const raw = command.trim();
  const lower = raw.toLowerCase();

  if (lower.startsWith("global ")) {
    return { channelId: "global-chat", body: raw.slice("global ".length).trim() };
  }

  if (lower.startsWith("zone ")) {
    return { channelId: "zone-chat", body: raw.slice("zone ".length).trim() };
  }

  if (!isKnownNonChatCommand(lower) && (state.activeChannelId === "global-chat" || state.activeChannelId === "zone-chat")) {
    return { channelId: state.activeChannelId, body: raw };
  }

  return null;
}

function getLiveDirectorRequest(state: GameState, command: string): LiveDirectorRequest | null {
  const raw = command.trim();
  const lower = raw.toLowerCase();

  if (!raw) {
    return null;
  }

  if (isKnownNonChatCommand(lower)) {
    return null;
  }

  if (lower.startsWith("party ")) {
    return { channelId: "party-chat", message: raw.replace(/^party\s*/i, "") };
  }

  if (lower.startsWith("p ")) {
    return { channelId: "party-chat", message: raw.replace(/^p\s*/i, "") };
  }

  if (lower.startsWith("guild ")) {
    return { channelId: "guild-board", message: raw.replace(/^guild\s*/i, "") };
  }

  if (lower.startsWith("g ")) {
    return { channelId: "guild-board", message: raw.replace(/^g\s*/i, "") };
  }

  if (lower.startsWith("director ")) {
    return { channelId: "director", message: raw.replace(/^director\s*/i, "") };
  }

  if (lower.startsWith("dm ")) {
    return { channelId: "director", message: raw.replace(/^dm\s*/i, "") };
  }

  if (state.activeChannelId === "party-chat" && !isKnownNonChatCommand(lower)) {
    return { channelId: "party-chat", message: raw };
  }

  if (state.activeChannelId === "guild-board" && !isKnownNonChatCommand(lower)) {
    return { channelId: "guild-board", message: raw };
  }

  return null;
}

function isKnownNonChatCommand(command: string) {
  const exact = new Set([
    "look",
    "map",
    "accept quest",
    "inventory",
    "abilities",
    "enter dungeon",
    "continue",
    "continue deeper",
    "retry encounter",
    "loot",
    "need",
    "greed",
    "pass",
    "recap",
    "listen",
    "wait",
    "story",
    "main story",
    "narrative",
    "dm",
    "dm scene",
    "narrate",
    "who",
    "nearby",
    "ready",
    "thanks",
    "thank you",
    "social ledger",
    "ledger",
    "contacts",
    "activity",
    "recommendation",
    "next step",
    "checklist",
    "first road",
    "world pulse",
    "social pulse",
    "pulse",
    "lfg",
    "group finder",
    "groups",
    "party finder",
    "contracts",
    "guild contracts",
    "guild board",
    "report",
    "report contract",
    "director memory",
    "social memory",
    "memory"
  ]);
  const prefixes = [
    "channel ",
    "travel ",
    "talk",
    "guard",
    "shield oath",
    "attack",
    "move",
    "use",
    "inspect",
    "gather",
    "rest",
    "join ",
    "invite ",
    "accept contract",
    "report contract",
    "director ",
    "dm ",
    "ai mode ",
    "global ",
    "zone "
  ];
  return exact.has(command) || prefixes.some((prefix) => command.startsWith(prefix));
}

function runLocalDirectorRequest(state: GameState, request: LiveDirectorRequest) {
  if (request.channelId === "director") {
    return runDirectorPrompt(state, request.message);
  }

  return runCommand(state, `${request.channelId === "party-chat" ? "party" : "guild"} ${request.message}`);
}
