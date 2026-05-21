import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Tabs from "@radix-ui/react-tabs";
import { Archive, BookOpen, Map, Package, ScrollText, Shield, UsersRound } from "lucide-react";
import { ActivityBoard } from "./ActivityBoard";
import { CanonLibraryPanel } from "./CanonLibraryPanel";
import { CharacterPanel } from "./CharacterPanel";
import { FirstRoadChecklist } from "./FirstRoadChecklist";
import { GuildBoardPanel } from "./GuildBoardPanel";
import { InventoryPanel } from "./InventoryPanel";
import { MapPanel } from "./MapPanel";
import { NoticePanel } from "./NoticePanel";
import { NpcSchedulePanel } from "./NpcSchedulePanel";
import { PartyPanel } from "./PartyPanel";
import { QuestTracker } from "./QuestTracker";
import { SaveTools } from "./SaveTools";
import { SocialLedgerPanel } from "./SocialLedgerPanel";
import { SocialWorldPanel } from "./SocialWorldPanel";
import { WorldStatePanel } from "./WorldStatePanel";
import type { ExportReceipt, GameState } from "../game/types";

interface Props {
  state: GameState;
  exportText: string;
  exportReceipt: ExportReceipt | null;
  importText: string;
  onCommand: (command: string) => void;
  onCopy: () => void;
  onDownload: () => void;
  onImportPasted: () => void;
  onImportTextChange: (value: string) => void;
  onPickFile: () => void;
  onValidate: () => void;
}

const tabs = [
  { id: "map", label: "Map", icon: Map },
  { id: "hero", label: "Hero", icon: Shield },
  { id: "party", label: "Party", icon: UsersRound },
  { id: "quests", label: "Quests", icon: ScrollText },
  { id: "bags", label: "Bags", icon: Package },
  { id: "world", label: "World", icon: BookOpen },
  { id: "archive", label: "Archive", icon: Archive }
];

export function HudPanelTabs({
  state,
  exportText,
  exportReceipt,
  importText,
  onCommand,
  onCopy,
  onDownload,
  onImportPasted,
  onImportTextChange,
  onPickFile,
  onValidate
}: Props) {
  return (
    <Tabs.Root className="hud-tabs" defaultValue="map">
      <Tabs.List className="hud-tab-list" aria-label="BellSpire side panels">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Tabs.Trigger className="hud-tab-trigger" value={tab.id} key={tab.id}>
              <Icon size={15} />
              <span>{tab.label}</span>
            </Tabs.Trigger>
          );
        })}
      </Tabs.List>

      <ScrollArea.Root className="hud-scroll-area">
        <ScrollArea.Viewport className="hud-scroll-viewport">
          <Tabs.Content className="hud-tab-content" value="map">
            <MapPanel state={state} />
          </Tabs.Content>

          <Tabs.Content className="hud-tab-content" value="hero">
            <CharacterPanel state={state} />
            <WorldStatePanel state={state} />
          </Tabs.Content>

          <Tabs.Content className="hud-tab-content" value="party">
            <PartyPanel state={state} />
            <SocialLedgerPanel state={state} onCommand={onCommand} />
            <SocialWorldPanel state={state} onCommand={onCommand} />
          </Tabs.Content>

          <Tabs.Content className="hud-tab-content" value="quests">
            <FirstRoadChecklist state={state} onCommand={onCommand} />
            <QuestTracker state={state} />
            <ActivityBoard state={state} onCommand={onCommand} />
            <GuildBoardPanel state={state} onCommand={onCommand} />
          </Tabs.Content>

          <Tabs.Content className="hud-tab-content" value="bags">
            <InventoryPanel state={state} />
          </Tabs.Content>

          <Tabs.Content className="hud-tab-content" value="world">
            <SocialWorldPanel state={state} onCommand={onCommand} />
            <NoticePanel state={state} />
            <NpcSchedulePanel state={state} />
            <WorldStatePanel state={state} />
          </Tabs.Content>

          <Tabs.Content className="hud-tab-content" value="archive">
            <CanonLibraryPanel />
            <SaveTools
              exportText={exportText}
              exportReceipt={exportReceipt}
              importText={importText}
              onCopy={onCopy}
              onDownload={onDownload}
              onImportPasted={onImportPasted}
              onImportTextChange={onImportTextChange}
              onPickFile={onPickFile}
              onValidate={onValidate}
            />
          </Tabs.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className="hud-scrollbar" orientation="vertical">
          <ScrollArea.Thumb className="hud-scroll-thumb" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </Tabs.Root>
  );
}
