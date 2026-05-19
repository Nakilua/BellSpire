import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const env = loadEnvFile(resolve(process.cwd(), ".env.local"));
const apiKey = env.OPENAI_API_KEY || "";
const port = Number(env.BELLSPIRE_AI_PORT || 8787);
const defaultMode = env.BELLSPIRE_AI_MODE || "auto";
const liveModel = env.BELLSPIRE_AI_LIVE_MODEL || "gpt-5.4-mini";
const cinematicModel = env.BELLSPIRE_AI_CINEMATIC_MODEL || "gpt-5.4";
const modelPrices = {
  "gpt-5.4-mini": { input: 0.75, output: 4.5 },
  "gpt-5.4": { input: 2.5, output: 15 }
};

const server = createServer(async (request, response) => {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);

    if (request.method === "GET" && url.pathname === "/api/ai/status") {
      sendJson(response, 200, {
        ok: true,
        hasKey: Boolean(apiKey),
        mode: defaultMode,
        liveModel,
        cinematicModel
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/ai/director") {
      const payload = await readJsonBody(request);
      const result = await createDirectorResponse(payload);
      sendJson(response, result.ok ? 200 : result.status, result.body);
      return;
    }

    sendJson(response, 404, { ok: false, error: "not_found" });
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      error: "server_error",
      message: error instanceof Error ? error.message : "Unknown server error"
    });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`BellSpire AI bridge listening on http://127.0.0.1:${port}`);
  console.log(`AI mode=${defaultMode} live=${liveModel} cinematic=${cinematicModel} key=${apiKey ? "present" : "missing"}`);
});

async function createDirectorResponse(payload) {
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      body: {
        ok: false,
        error: "missing_api_key",
        fallbackReason: "OPENAI_API_KEY is not set in .env.local"
      }
    };
  }

  if (payload?.qualityMode === "local") {
    return {
      ok: false,
      status: 409,
      body: {
        ok: false,
        error: "local_only_mode",
        fallbackReason: "Quality mode is Local Only"
      }
    };
  }

  const budget = payload?.budget ?? {};
  if (Number(budget.estimatedSpendUsd ?? 0) >= Number(budget.stopAtUsd ?? 9.5)) {
    return {
      ok: false,
      status: 402,
      body: {
        ok: false,
        error: "budget_stopped",
        fallbackReason: "Monthly AI budget stop reached"
      }
    };
  }

  const mode = chooseMode(payload);
  const model = mode === "cinematic" ? cinematicModel : liveModel;
  const prompt = buildDirectorPrompt(payload, mode, model);

  const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      instructions: prompt.instructions,
      input: prompt.input,
      max_output_tokens: mode === "cinematic" ? 900 : 520,
      text: {
        format: {
          type: "json_schema",
          name: "bellspire_director_response",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["intent", "mood", "topic", "replies", "memory"],
            properties: {
              intent: { type: "string" },
              mood: { type: "string" },
              topic: { type: "string" },
              memory: { type: "string" },
              replies: {
                type: "array",
                minItems: 1,
                maxItems: 4,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["speaker", "role", "body"],
                  properties: {
                    speaker: { type: "string" },
                    role: { type: "string" },
                    body: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    })
  });

  const raw = await openaiResponse.text();
  if (!openaiResponse.ok) {
    const fallbackReason = safeOpenAIError(raw);
    if (mode === "cinematic" && model !== liveModel) {
      const retry = await createDirectorResponse({
        ...payload,
        qualityMode: "live",
        _fallbackReason: `Cinematic model failed; used ${liveModel}. ${fallbackReason}`
      });
      if (retry.ok && retry.body?.ok) {
        retry.body.fallbackReason = payload?._fallbackReason || retry.body.fallbackReason;
      }
      return retry;
    }

    return {
      ok: false,
      status: openaiResponse.status,
      body: {
        ok: false,
        error: "openai_request_failed",
        status: openaiResponse.status,
        fallbackReason
      }
    };
  }

  const parsed = JSON.parse(raw);
  const outputText = extractOutputText(parsed);
  const director = JSON.parse(outputText);
  const usage = extractUsage(parsed);
  const estimatedCostUsd = estimateCost(model, usage);
  const nextSpend = Number(budget.estimatedSpendUsd ?? 0) + estimatedCostUsd;

  return {
    ok: true,
    status: 200,
    body: {
      ok: true,
      provider: "openai",
      mode,
      model,
      usage,
      estimatedCostUsd,
      budgetStatus: getBudgetStatus(nextSpend, budget),
      intent: director.intent,
      mood: director.mood,
      topic: director.topic,
      memory: director.memory,
      fallbackReason: payload?._fallbackReason,
      replies: director.replies
    }
  };
}

function chooseMode(payload) {
  const requested = payload?.qualityMode || defaultMode;
  if (requested === "mini") {
    return "live";
  }
  if (requested === "cinematic" || requested === "live") {
    return requested;
  }

  const intent = String(payload?.intent?.id || "").toLowerCase();
  const message = String(payload?.message || "").toLowerCase();
  const pressure = Number(payload?.gameSnapshot?.storyPressure || 0);
  const cinematicTerms = ["cathedral", "canon", "lore", "vow", "boss", "warden", "final toll", "emotional", "cinematic", "major scene"];

  if (pressure >= 6 || ["lore-question", "scene-reading", "dungeon-tactics"].includes(intent) || cinematicTerms.some((term) => message.includes(term))) {
    return "cinematic";
  }

  return "live";
}

function buildDirectorPrompt(payload, mode, model) {
  const snapshot = payload?.gameSnapshot ?? {};
  const contacts = Array.isArray(snapshot.contacts) ? snapshot.contacts : [];
  const memories = Array.isArray(snapshot.memories) ? snapshot.memories : [];
  const canonContext = Array.isArray(snapshot.canonContext) ? snapshot.canonContext : [];

  return {
    instructions: [
      "You are Bellspire's private local AI Director for a gothic text MMO prototype.",
      "Stay inside the supplied Bellspire canon snapshot. Do not invent permanent loot, monetization, accounts, or MMO backend claims.",
      "Reply as believable NPCs or simulated players, not as a generic assistant.",
      "Use short, human-feeling lines. Make each speaker distinct.",
      "Normal social chat should feel like Discord party/guild chat. Cinematic mode may be more atmospheric.",
      "For party-chat, choose recent party members or suitable adventurers. Do not include guild clerks unless the channel is guild-board.",
      "For guild-board, prefer the contract clerk and official guild voices. Do not roleplay the player.",
      "Local simulation owns schedules, social state, rewards, and consequences. You provide dialogue only inside the supplied state.",
      "If rewards are mentioned, call them staged or source-checked only when the snapshot supports them.",
      "Use the canon context packs as authoritative constraints. If a requested fact is outside them, answer with uncertainty in-world instead of inventing.",
      "Honor the source authority ladder: compendium/workbooks first, loot worktables for rewards, focused bibles for locked-preview content, research papers only for system design and MMO feel.",
      "Research references can improve pacing, social behavior, UX, and economy texture, but they cannot create canon names or permanent loot.",
      `Routing mode: ${mode}. Model: ${model}.`
    ].join("\n"),
    input: JSON.stringify(
      {
        channelId: payload?.channelId,
        playerMessage: payload?.message,
        localIntent: payload?.intent,
        location: snapshot.location,
        room: snapshot.room,
        character: snapshot.character,
        recentParty: snapshot.recentParty,
        contacts,
        memories,
        canonContext,
        canonRegistrySummary: snapshot.canonRegistrySummary,
        quests: snapshot.quests,
        flags: snapshot.flags
      },
      null,
      2
    )
  };
}

function extractUsage(response) {
  const usage = response.usage ?? {};
  const inputTokens = Number(usage.input_tokens ?? usage.prompt_tokens ?? 0);
  const outputTokens = Number(usage.output_tokens ?? usage.completion_tokens ?? 0);
  const totalTokens = Number(usage.total_tokens ?? inputTokens + outputTokens);
  return {
    inputTokens,
    outputTokens,
    totalTokens
  };
}

function estimateCost(model, usage) {
  const prices = modelPrices[model] ?? modelPrices[liveModel] ?? modelPrices["gpt-5.4-mini"];
  const inputCost = (usage.inputTokens / 1_000_000) * prices.input;
  const outputCost = (usage.outputTokens / 1_000_000) * prices.output;
  return Math.round((inputCost + outputCost) * 10000) / 10000;
}

function getBudgetStatus(nextSpend, budget) {
  const warnAt = Number(budget.warnAtUsd ?? 7);
  const strongWarnAt = Number(budget.strongWarnAtUsd ?? 9);
  const stopAt = Number(budget.stopAtUsd ?? 9.5);
  if (nextSpend >= stopAt) {
    return "stopped";
  }
  if (nextSpend >= strongWarnAt) {
    return "strong-warn";
  }
  if (nextSpend >= warnAt) {
    return "warn";
  }
  return "safe";
}

function loadEnvFile(path) {
  try {
    const text = readFileSync(path, "utf8");
    const result = {};
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      const index = trimmed.indexOf("=");
      if (index === -1) {
        continue;
      }
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
      result[key] = value;
    }
    return { ...result, ...process.env };
  } catch {
    return { ...process.env };
  }
}

function readJsonBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        rejectBody(new Error("Request body too large"));
      }
    });
    request.on("end", () => {
      try {
        resolveBody(body ? JSON.parse(body) : {});
      } catch {
        rejectBody(new Error("Invalid JSON body"));
      }
    });
    request.on("error", rejectBody);
  });
}

function extractOutputText(response) {
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text;
  }

  const chunks = [];
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === "string") {
        chunks.push(content.text);
      }
    }
  }
  return chunks.join("\n").trim();
}

function safeOpenAIError(raw) {
  try {
    const parsed = JSON.parse(raw);
    return parsed?.error?.message || "OpenAI request failed";
  } catch {
    return "OpenAI request failed";
  }
}

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}
