import type { RealmChatMessage } from "./realm";
import type { RealmPlayerPresence } from "./types";

// Client side of the live-realm protocol. The bridge is deliberately thin:
// it never mutates game state itself, it only reports realm events upward so
// the reducers in realm.ts stay the single place where state changes.

export interface RealmHello {
  name: string;
  className: string;
  zoneId: string;
}

export interface RealmHandlers {
  onStatus: (status: "offline" | "connecting" | "connected", realmName?: string, selfSessionId?: string) => void;
  onRoster: (players: RealmPlayerPresence[]) => void;
  onChat: (message: RealmChatMessage) => void;
}

const RETRY_MS = 15000;

function defaultRealmUrl() {
  const host = window.location.hostname || "127.0.0.1";
  return `ws://${host}:8788`;
}

class RealmBridge {
  private socket: WebSocket | null = null;
  private handlers: RealmHandlers | null = null;
  private hello: RealmHello | null = null;
  private retryTimer: number | null = null;
  private enabled = false;

  connect(hello: RealmHello, handlers: RealmHandlers) {
    this.hello = hello;
    this.handlers = handlers;
    this.enabled = true;
    this.open();
  }

  disconnect() {
    this.enabled = false;
    if (this.retryTimer !== null) {
      window.clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.socket?.close();
    this.socket = null;
  }

  sendChat(channelId: "global-chat" | "zone-chat", body: string) {
    this.send({ t: "chat", channelId, body });
  }

  sendMove(zoneId: string) {
    if (this.hello) {
      this.hello = { ...this.hello, zoneId };
    }
    this.send({ t: "move", zoneId });
  }

  get isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  private send(payload: Record<string, unknown>) {
    if (this.isConnected) {
      this.socket!.send(JSON.stringify(payload));
    }
  }

  private open() {
    if (!this.enabled || !this.hello || !this.handlers) {
      return;
    }

    this.handlers.onStatus("connecting");

    let socket: WebSocket;
    try {
      socket = new WebSocket(defaultRealmUrl());
    } catch {
      this.handlers.onStatus("offline");
      this.scheduleRetry();
      return;
    }

    this.socket = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ t: "hello", ...this.hello }));
    };

    socket.onmessage = (event) => {
      let message: Record<string, unknown>;
      try {
        message = JSON.parse(String(event.data));
      } catch {
        return;
      }

      if (message.t === "welcome") {
        this.handlers?.onStatus("connected", String(message.realmName ?? "Live realm"), String(message.sessionId ?? ""));
        if (Array.isArray(message.roster)) {
          this.handlers?.onRoster(message.roster as RealmPlayerPresence[]);
        }
      } else if (message.t === "roster" && Array.isArray(message.players)) {
        this.handlers?.onRoster(message.players as RealmPlayerPresence[]);
      } else if (message.t === "chat") {
        this.handlers?.onChat(message as unknown as RealmChatMessage);
      }
    };

    socket.onclose = () => {
      if (this.socket === socket) {
        this.socket = null;
        this.handlers?.onStatus("offline");
        this.scheduleRetry();
      }
    };

    socket.onerror = () => {
      socket.close();
    };
  }

  private scheduleRetry() {
    if (!this.enabled || this.retryTimer !== null) {
      return;
    }
    this.retryTimer = window.setTimeout(() => {
      this.retryTimer = null;
      this.open();
    }, RETRY_MS);
  }
}

export const realmBridge = new RealmBridge();
