import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clipboard, Download, RotateCcw, Upload, UserRound } from "lucide-react";
import { ActivityBoard } from "./components/ActivityBoard";
import { ChannelRail } from "./components/ChannelRail";
import { CanonLibraryPanel } from "./components/CanonLibraryPanel";
import { CharacterPanel } from "./components/CharacterPanel";
import { CommandBar } from "./components/CommandBar";
import { EncounterBubble } from "./components/EncounterBubble";
import { InventoryPanel } from "./components/InventoryPanel";
import { LoginView } from "./components/LoginView";
import { MapPanel } from "./components/MapPanel";
import { NarrativeFeed } from "./components/NarrativeFeed";
import { PartyPanel } from "./components/PartyPanel";
import { QuestTracker } from "./components/QuestTracker";
import { SaveTools } from "./components/SaveTools";
import { SocialWorldPanel } from "./components/SocialWorldPanel";
import { WorldStatePanel } from "./components/WorldStatePanel";
import { fetchAiStatus, requestLiveDirector } from "./game/aiBridge";
import { shouldUseLocalDirector } from "./game/budget";
import { runCommand } from "./game/commands";
import { applyExternalDirectorChat, markDirectorFallback, runDirectorChat, runDirectorPrompt } from "./game/director";
import { postGuildChat, postPartyChat } from "./game/social";
import { addFeed, createInitialState, sanitizeImportedState, STORAGE_KEY } from "./game/state";
import { getAvailableActions, getCurrentPoi } from "./game/selectors";
import type { CharacterCreationInput, GameState } from "./game/types";

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

export default function App() {
  const [state, setState] = useState<GameState>(loadInitialState);
  const [route, setRoute] = useState<AppRoute>(getRouteFromPath);
  const [saveStatus, setSaveStatus] = useState("Autosaved locally");
  const [exportText, setExportText] = useState("");
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

  const actions = useMemo(() => getAvailableActions(state), [state]);
  const currentPoi = getCurrentPoi(state);
  const currentSaveJson = useMemo(() => JSON.stringify(state, null, 2), [state]);

  function dispatchCommand(command: string) {
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

  function prepareSaveText(status = "Save JSON prepared") {
    setExportText(currentSaveJson);
    setSaveStatus(`${status} (${currentSaveJson.length} chars)`);
    return currentSaveJson;
  }

  function downloadSave() {
    const text = prepareSaveText("Save JSON prepared; download requested");
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "bellspire-save-v1.json";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function copySave() {
    const text = prepareSaveText("Save JSON copied");
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
      setImportText("");
    } catch {
      setSaveStatus("Paste import failed: unreadable JSON");
    }
  }

  function validateCurrentSave() {
    const text = prepareSaveText("Current save validated");
    const imported = sanitizeImportedState(JSON.parse(text));
    setSaveStatus(imported ? `Current save valid (${text.length} chars)` : "Current save failed validation");
  }

  function resetSave() {
    const next = createInitialState();
    stateChangeStatusRef.current = "New session started";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setState(next);
    setExportText("");
    setImportText("");
    navigate("login");
  }

  const showLogin = route === "login" || !state.profileCreated;

  return (
    <div className="app-root">
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
        <header className="app-header">
          <div className="brand-block">
            <h1 className="app-title">Bellspire</h1>
            <p className="app-subtitle">
              {currentPoi.name} / {state.character.className} level {state.character.level}
            </p>
          </div>
          <div className="header-actions">
            <span className="save-status">{saveStatus}</span>
            <button className="icon-button" type="button" onClick={() => navigate("login")} title="Open character screen">
              <UserRound size={16} />
              <span>Character</span>
            </button>
            <button className="icon-button" type="button" onClick={downloadSave} title="Download save JSON">
              <Download size={16} />
              <span>Download</span>
            </button>
            <button className="icon-button" type="button" onClick={copySave} title="Copy save JSON">
              <Clipboard size={16} />
              <span>Copy</span>
            </button>
            <button className="icon-button" type="button" onClick={() => importInputRef.current?.click()} title="Import save JSON">
              <Upload size={16} />
              <span>Import</span>
            </button>
            <button className="icon-button danger" type="button" onClick={resetSave} title="Reset local save">
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
            <input
              ref={importInputRef}
              className="visually-hidden"
              type="file"
              accept="application/json,.json"
              onChange={(event) => importSave(event.target.files?.[0])}
            />
          </div>
        </header>

        <div className="app-layout">
          <ChannelRail state={state} onCommand={dispatchCommand} />

          <main className="main-panel">
            <EncounterBubble state={state} onCommand={dispatchCommand} />
            <NarrativeFeed entries={state.feed} actions={actions} onCommand={dispatchCommand} />
            <CommandBar actions={actions} onCommand={dispatchCommand} />
          </main>

          <aside className="right-panel">
            <SocialWorldPanel state={state} onCommand={dispatchCommand} />
            <MapPanel state={state} />
            <CanonLibraryPanel />
            <CharacterPanel state={state} />
            <PartyPanel state={state} />
            <SaveTools
              exportText={exportText}
              importText={importText}
              onCopy={copySave}
              onDownload={downloadSave}
              onImportPasted={importPastedSave}
              onImportTextChange={setImportText}
              onPickFile={() => importInputRef.current?.click()}
              onValidate={validateCurrentSave}
            />
            <QuestTracker state={state} />
            <InventoryPanel state={state} />
            <WorldStatePanel state={state} />
            <ActivityBoard state={state} onCommand={dispatchCommand} />
          </aside>
        </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getLiveDirectorRequest(state: GameState, command: string): LiveDirectorRequest | null {
  const raw = command.trim();
  const lower = raw.toLowerCase();

  if (!raw) {
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
    "recap",
    "listen",
    "wait",
    "who",
    "nearby",
    "lfg",
    "group finder",
    "groups",
    "party finder",
    "contracts",
    "guild contracts",
    "guild board",
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
