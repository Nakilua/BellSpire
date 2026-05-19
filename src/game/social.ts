import { addFeed } from "./state";
import { runDirectorChat, runDirectorPrompt, showDirectorMemory } from "./director";
import type { GameState, GuildContractState, GroupListingState, SocialContactState } from "./types";

const exactGameCommands = new Set([
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
  "nearby"
]);

const commandPrefixes = ["channel ", "travel ", "talk", "guard", "shield oath", "attack", "move", "use", "inspect", "gather", "rest", "global ", "zone ", "ai mode "];

export function handleSocialCommand(state: GameState, rawCommand: string): GameState | null {
  const raw = rawCommand.trim();
  const command = raw.toLowerCase();

  if (!raw) {
    return null;
  }

  if (command === "director memory" || command === "social memory" || command === "memory") {
    return showDirectorMemory(state);
  }

  if (command.startsWith("ai mode ")) {
    return setAiQualityMode(state, raw.replace(/^ai mode\s*/i, ""));
  }

  if (command.startsWith("director ")) {
    return runDirectorPrompt(state, raw.replace(/^director\s*/i, ""));
  }

  if (command.startsWith("dm ")) {
    return runDirectorPrompt(state, raw.replace(/^dm\s*/i, ""));
  }

  if (command === "lfg" || command === "group finder" || command === "groups" || command === "party finder") {
    return showGroupFinder(state);
  }

  if (command.startsWith("join ")) {
    return joinGroupListing(state, raw.replace(/^join\s*/i, ""));
  }

  if (command.startsWith("invite ")) {
    return inviteContact(state, raw.replace(/^invite\s*/i, ""));
  }

  if (command === "contracts" || command === "guild contracts" || command === "guild board") {
    return showGuildContracts(state);
  }

  if (command.startsWith("accept contract")) {
    return acceptGuildContract(state, raw.replace(/^accept contract\s*/i, ""));
  }

  if (command.startsWith("party ")) {
    return postPartyChat(state, raw.replace(/^party\s*/i, ""));
  }

  if (command.startsWith("p ")) {
    return postPartyChat(state, raw.replace(/^p\s*/i, ""));
  }

  if (command.startsWith("guild ")) {
    return postGuildChat(state, raw.replace(/^guild\s*/i, ""));
  }

  if (command.startsWith("g ")) {
    return postGuildChat(state, raw.replace(/^g\s*/i, ""));
  }

  if (state.activeChannelId === "party-chat" && !isKnownGameCommand(command)) {
    return postPartyChat(state, raw);
  }

  if (state.activeChannelId === "guild-board" && !isKnownGameCommand(command)) {
    return postGuildChat(state, raw);
  }

  return null;
}

function isKnownGameCommand(command: string) {
  return exactGameCommands.has(command) || commandPrefixes.some((prefix) => command.startsWith(prefix));
}

export function postPartyChat(state: GameState, message: string, options: { deferDirector?: boolean } = {}): GameState {
  if (!message.trim()) {
    return addFeed(state, "warning", "Empty party message", "Type something after `party`, or click into #party-chat and speak normally.", "#party-chat");
  }

  let next = withActiveSocialChannel(state, "party-chat");
  next = addFeed(next, "social", `${state.character.name} in #party-chat`, message, "local party chat");

  const responders = choosePartyResponders(next, message);
  if (!options.deferDirector) {
    next = runDirectorChat(next, "party-chat", message);
  }
  for (const contact of responders) {
    next = touchContact(next, contact.id, 2, `Answered party chat about "${shortTopic(message)}".`, "#party-chat");
  }

  next = bumpSocialReputation(next, "Party Reliability", 1);
  return rememberSocial(next, `Party chat: ${shortTopic(message)}`);
}

export function postGuildChat(state: GameState, message: string, options: { deferDirector?: boolean } = {}): GameState {
  if (!message.trim()) {
    return addFeed(state, "warning", "Empty guild post", "Type something after `guild`, or click into #guild-board and post normally.", "#guild-board");
  }

  let next = withActiveSocialChannel(state, "guild-board");
  next = addFeed(next, "social", `${state.character.name} in #guild-board`, message, "local guild board");

  const clerk = findContact(next, "ysabet-cord");
  if (!options.deferDirector) {
    next = runDirectorChat(next, "guild-board", message);
  }
  if (clerk) {
    next = touchContact(next, clerk.id, 2, `Filed a guild-board reply about "${shortTopic(message)}".`, "#guild-board");
  }

  next = bumpSocialReputation(next, "Guild Credit", 1);
  return rememberSocial(next, `Guild board post: ${shortTopic(message)}`);
}

function showGroupFinder(state: GameState): GameState {
  const lines = state.social.groupListings.map(formatListing).join("\n\n");
  return addFeed(
    withActiveSocialChannel(state, "party-chat"),
    "social",
    "Local group finder",
    `${lines}\n\nTry \`join cryptlet group\` or \`invite Edrin\`.`,
    "#party-chat"
  );
}

function joinGroupListing(state: GameState, listingText: string): GameState {
  const listing = findListing(state, listingText) ?? findListing(state, "cryptlet");
  if (!listing) {
    return addFeed(state, "warning", "No matching group", "Try `lfg`, then join one of the listed parties.", "Group finder");
  }

  const partyNames = listing.id === "cryptlet-training-lfg" ? ["Pilgrim Renn", "Edrin Bellhand", "Tallowwick"] : ["Pilgrim Renn", "Mothknife"];
  const characterMember = `${state.character.name} / ${state.character.className}`;
  const nextMembers = unique([...listing.members.filter((member) => !member.toLowerCase().includes("naki / bulwark")), characterMember, ...partyNames]);

  let next: GameState = {
    ...withActiveSocialChannel(state, "party-chat"),
    social: {
      ...state.social,
      groupListings: state.social.groupListings.map((entry) =>
        entry.id === listing.id
          ? {
              ...entry,
              status: "joined",
              members: nextMembers
            }
          : entry
      ),
      recentParty: unique([...state.social.recentParty, ...partyNames])
    }
  };

  next = addFeed(next, "social", `Joined group: ${listing.name}`, `${nextMembers.join(", ")}\n${listing.routeNote}`, "Group finder");
  for (const name of partyNames) {
    const contact = findContactByName(next, name);
    if (contact) {
      next = touchContact(next, contact.id, 5, `Joined ${listing.name} with ${state.character.name}.`, "#party-chat");
    }
  }

  next = bumpSocialReputation(next, "Party Reliability", 5);
  next = rememberSocial(next, `Joined group finder listing: ${listing.name}`);

  return addFeed(
    next,
    "social",
    "Party ready check",
    "Edrin marks healer ready, Tallowwick claims object duty, and Renn says he can guide the shrine prayers. The world now treats them as your staged local party.",
    "#party-chat"
  );
}

function inviteContact(state: GameState, contactText: string): GameState {
  const contact = findContactByName(state, contactText);
  if (!contact) {
    return addFeed(state, "warning", "Contact not found", "Try `invite Renn`, `invite Edrin`, `invite Tallowwick`, or `invite Olla`.", "Social memory");
  }

  let next: GameState = {
    ...withActiveSocialChannel(state, "party-chat"),
    social: {
      ...state.social,
      recentParty: unique([...state.social.recentParty, contact.name])
    }
  };

  next = addFeed(next, "social", `Invite sent: ${contact.name}`, `${contact.name} has been added to your local party memory.`, contact.relationshipTag);
  next = addFeed(next, "social", contact.name, inviteReply(contact), contact.role);
  next = touchContact(next, contact.id, 4, `Accepted a party invite from ${state.character.name}.`, "#party-chat");
  next = bumpSocialReputation(next, "Party Reliability", 2);
  return rememberSocial(next, `Invited ${contact.name}`);
}

function showGuildContracts(state: GameState): GameState {
  const body = state.social.guildContracts.map(formatContract).join("\n\n");
  return addFeed(withActiveSocialChannel(state, "guild-board"), "social", "Guild contracts", `${body}\n\nTry \`accept contract First Road Watch\`.`, "#guild-board");
}

function acceptGuildContract(state: GameState, contractText: string): GameState {
  const contract = findContract(state, contractText) ?? state.social.guildContracts.find((entry) => entry.status === "available");
  if (!contract) {
    return addFeed(state, "warning", "No matching contract", "Open `guild contracts` and choose one by name.", "Guild board");
  }

  if (contract.status === "accepted") {
    return addFeed(state, "social", "Contract already accepted", `${contract.name} is already pinned to your local guild board.`, "#guild-board");
  }

  let next: GameState = {
    ...withActiveSocialChannel(state, "guild-board"),
    social: {
      ...state.social,
      guildContracts: state.social.guildContracts.map((entry) =>
        entry.id === contract.id
          ? {
              ...entry,
              status: "accepted"
            }
          : entry
      )
    }
  };

  next = bumpSocialReputation(next, "Guild Credit", 5);
  next = rememberSocial(next, `Accepted guild contract: ${contract.name}`);

  const clerk = findContact(next, "ysabet-cord");
  if (clerk) {
    next = touchContact(next, clerk.id, 3, `Registered ${contract.name} for ${state.character.name}.`, "#guild-board");
  }

  return addFeed(
    next,
    "social",
    `Contract accepted: ${contract.name}`,
    `${contract.requirement}\nReward: ${contract.reward}`,
    "Guild board"
  );
}

function choosePartyResponders(state: GameState, message: string): SocialContactState[] {
  const lower = message.toLowerCase();
  const ids = new Set<string>();

  if (includesAny(lower, ["lfg", "group", "dungeon", "cryptlet", "healer", "party"])) {
    ids.add("edrin-bellhand");
    ids.add("tallowwick");
    ids.add("pilgrim-renn");
  }

  if (includesAny(lower, ["road", "shrine", "olla", "little dawn", "bell"])) {
    ids.add("pilgrim-renn");
    ids.add("shrinekeeper-olla");
  }

  if (includesAny(lower, ["danger", "scout", "warden", "trap", "hidden"])) {
    ids.add("mothknife");
    ids.add("edrin-bellhand");
  }

  if (ids.size === 0) {
    ids.add("tallowwick");
    ids.add("pilgrim-renn");
  }

  return [...ids].map((id) => findContact(state, id)).filter(Boolean).slice(0, 3) as SocialContactState[];
}

function inviteReply(contact: SocialContactState) {
  if (contact.availability === "away") {
    return "Away right now, but I marked interest. If the route turns dangerous, ping again.";
  }

  if (contact.id === "shrinekeeper-olla") {
    return "I do not leave the shrine for every raised eyebrow, but I will answer road calls while you are under Little Dawn.";
  }

  if (contact.kind === "guild") {
    return "I am not a dungeon companion, darling. But I will track the contract and judge the paperwork.";
  }

  return "Invite accepted. Keep the route clear and I will stay with the party.";
}

function setAiQualityMode(state: GameState, modeText: string): GameState {
  const normalized = modeText.trim().toLowerCase();
  const qualityMode =
    normalized === "mini" || normalized === "mini only" || normalized === "mini-only"
      ? "mini"
      : normalized === "cinematic"
        ? "cinematic"
        : normalized === "local" || normalized === "local only" || normalized === "local-only"
          ? "local"
          : "auto";

  return addFeed(
    {
      ...state,
      social: {
        ...state.social,
        director: {
          ...state.social.director,
          qualityMode
        }
      }
    },
    "system",
    "AI quality mode updated",
    `Quality mode is now ${qualityMode}. Auto uses mini for normal chat and full 5.4 for important scenes.`,
    "AI Director"
  );
}

function findContact(state: GameState, id: string) {
  return state.social.contacts.find((contact) => contact.id === id);
}

function findContactByName(state: GameState, contactText: string) {
  const normalized = normalize(contactText);
  return state.social.contacts.find((contact) => {
    const name = normalize(contact.name);
    return contact.id.includes(normalized) || name.includes(normalized) || normalized.includes(name.split(" ")[0]);
  });
}

function findListing(state: GameState, listingText: string) {
  const normalized = normalize(listingText);
  return state.social.groupListings.find((listing) => {
    const name = normalize(listing.name);
    return listing.id.includes(normalized) || name.includes(normalized) || normalized.includes("cryptlet") && listing.id.includes("cryptlet");
  });
}

function findContract(state: GameState, contractText: string) {
  const normalized = normalize(contractText);
  return state.social.guildContracts.find((contract) => {
    const name = normalize(contract.name);
    return contract.id.includes(normalized) || name.includes(normalized) || normalized.includes(name.split(" ")[0]);
  });
}

function touchContact(state: GameState, contactId: string, trustDelta: number, note: string, lastSeen: string): GameState {
  return {
    ...state,
    social: {
      ...state.social,
      contacts: state.social.contacts.map((contact) =>
        contact.id === contactId
          ? {
              ...contact,
              trust: clamp(contact.trust + trustDelta, 0, 100),
              lastSeen,
              notes: unique([note, ...contact.notes]).slice(0, 5)
            }
          : contact
      )
    }
  };
}

function bumpSocialReputation(state: GameState, key: string, amount: number): GameState {
  const nextValue = (state.social.socialReputation[key] ?? 0) + amount;
  return {
    ...state,
    social: {
      ...state.social,
      socialReputation: {
        ...state.social.socialReputation,
        [key]: nextValue
      }
    }
  };
}

function rememberSocial(state: GameState, memory: string): GameState {
  return {
    ...state,
    sessionRecap: {
      ...state.sessionRecap,
      social: unique([...state.sessionRecap.social, memory]).slice(-12)
    }
  };
}

function withActiveSocialChannel(state: GameState, channelId: "party-chat" | "guild-board"): GameState {
  return {
    ...state,
    activeChannelId: channelId
  };
}

function formatListing(listing: GroupListingState) {
  return `${statusLabel(listing.status)} ${listing.name}\nNeeds: ${listing.rolesNeeded.join(", ")}\nParty: ${listing.members.join(", ")}\n${listing.routeNote}`;
}

function formatContract(contract: GuildContractState) {
  return `${statusLabel(contract.status)} ${contract.name}\nRequirement: ${contract.requirement}\nReward: ${contract.reward}`;
}

function statusLabel(status: string) {
  return `[${status.toUpperCase()}]`;
}

function shortTopic(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 80);
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
