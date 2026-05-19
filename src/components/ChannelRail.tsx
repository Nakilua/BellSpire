import { Activity, Castle, Hash, MessageCircle, ScrollText, Shield, Swords } from "lucide-react";
import channels from "../data/channels.json";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
  onCommand: (command: string) => void;
}

const icons = {
  zone: Castle,
  social: MessageCircle,
  board: ScrollText,
  combat: Swords
};

export function ChannelRail({ state, onCommand }: Props) {
  const onlineCount = state.social.contacts.filter((contact) => contact.availability === "online").length;
  const activeChannel = channels.find((channel) => channel.id === state.activeChannelId);

  return (
    <nav className="channel-rail">
      <div className="profile-card">
        <div className="profile-icon">
          <Shield size={20} />
        </div>
        <div className="profile-copy">
          <p>{state.character.name}</p>
          <small>
            Bulwark / {onlineCount} contacts online / local save v1
          </small>
        </div>
      </div>

      <div className="server-card">
        <span>Current Channel</span>
        <strong>{activeChannel?.label ?? "#unknown"}</strong>
        <small>{activeChannel?.description ?? "The channel rail is listening."}</small>
      </div>

      <div className="rail-section-title">
        <Activity size={13} />
        <span>Channels</span>
      </div>

      <div className="channel-list">
        {channels.map((channel) => {
          const Icon = icons[channel.kind as keyof typeof icons] ?? Hash;
          const active = channel.id === state.activeChannelId;
          return (
            <button
              className={`channel-button ${active ? "active" : ""}`}
              key={channel.id}
              type="button"
              onClick={() => onCommand(`channel ${channel.id}`)}
            >
              <Icon size={16} />
              <span>{channel.label}</span>
            </button>
          );
        })}
      </div>

      <div className="law-card">
        <p>MVP law</p>
        <p>No ghost loot. Local world first. The first road opens one slice at a time.</p>
      </div>
    </nav>
  );
}
