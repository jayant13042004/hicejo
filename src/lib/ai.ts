import { OpenAI } from "openai";
import fs from "fs";
import path from "path";

let cachedGeminiClient: OpenAI | null = null;
let cachedOpenAIClient: OpenAI | null = null;
let cachedMockClient: OpenAI | null = null;

function resolveEnvKey(varName: string): string | undefined {
  if (process.env[varName]) {
    return process.env[varName];
  }
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      const match = content.match(new RegExp(`(?:^|\\n)\\s*${varName}\\s*=\\s*([^\\r\\n]+)`));
      if (match && match[1]) {
        const val = match[1].trim();
        process.env[varName] = val;
        return val;
      }
    }
  } catch {
    // ignore filesystem errors
  }
  return undefined;
}

const GEMINI_FALLBACK_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview",
  "gemini-flash-latest",
  "gemini-flash-lite-latest"
];

function wrapClientWithFailover(client: OpenAI, defaultFallbacks: string[]) {
  const originalCreate = client.chat.completions.create.bind(client.chat.completions);

  client.chat.completions.create = (async function (params: any, options?: any) {
    const modelsToTry = [
      params.model,
      ...defaultFallbacks
    ].filter((m, i, arr) => Boolean(m) && arr.indexOf(m) === i);

    let lastError: any = null;

    for (let i = 0; i < modelsToTry.length; i++) {
      const currentModel = modelsToTry[i];
      try {
        const response = await originalCreate({ ...params, model: currentModel }, options);
        return response;
      } catch (err: any) {
        lastError = err;
        const status = err.status || err.statusCode || (typeof err.message === "string" && err.message.includes("503") ? 503 : null);
        const errMsg = String(err.message || "");

        const isRetryable =
          status === 503 ||
          status === 429 ||
          status === 404 ||
          status === 500 ||
          status === 502 ||
          status === 504 ||
          errMsg.includes("503") ||
          errMsg.includes("demand") ||
          errMsg.includes("overloaded") ||
          errMsg.includes("quota") ||
          errMsg.includes("rate limit") ||
          errMsg.includes("no longer available") ||
          errMsg.includes("fetch failed") ||
          errMsg.includes("timeout");

        if (isRetryable && i < modelsToTry.length - 1) {
          console.warn(`[AI Failover] Model ${currentModel} returned ${errMsg || status}. Auto-rotating to ${modelsToTry[i + 1]}...`);
          await new Promise((r) => setTimeout(r, 450 * (i + 1)));
          continue;
        }

        throw err;
      }
    }

    throw lastError;
  }) as any;

  return client;
}

export function getAIClient() {
  const geminiKey = resolveEnvKey("GEMINI_API_KEY");
  const openAIKey = resolveEnvKey("OPENAI_API_KEY");

  // 1. If Gemini API Key is configured, use high-speed active Gemini 3.5 Flash models via OpenAI compat with auto failover
  if (geminiKey && !geminiKey.startsWith("placeholder")) {
    if (!cachedGeminiClient) {
      const rawClient = new OpenAI({
        apiKey: geminiKey,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        timeout: 45000,
        maxRetries: 1
      });
      cachedGeminiClient = wrapClientWithFailover(rawClient, GEMINI_FALLBACK_MODELS);
    }

    return {
      openai: cachedGeminiClient,
      modelMini: "gemini-3.1-flash-lite",
      modelFast: "gemini-3.5-flash",
      modelPro: "gemini-3.5-flash",
      modelQuality: "gemini-3.5-flash",
      fallbackModels: GEMINI_FALLBACK_MODELS,
      isConfigured: true
    };
  }

  // 2. If OpenAI Key is configured, use standard OpenAI host with timeouts
  if (openAIKey && !openAIKey.startsWith("placeholder")) {
    if (!cachedOpenAIClient) {
      const rawClient = new OpenAI({
        apiKey: openAIKey,
        timeout: 40000,
        maxRetries: 2
      });
      cachedOpenAIClient = wrapClientWithFailover(rawClient, ["gpt-4o-mini", "gpt-4o"]);
    }

    return {
      openai: cachedOpenAIClient,
      modelMini: "gpt-4o-mini",
      modelFast: "gpt-4o-mini",
      modelPro: "gpt-4o-mini",
      modelQuality: "gpt-4o",
      fallbackModels: ["gpt-4o-mini", "gpt-4o"],
      isConfigured: true
    };
  }

  // 3. Fallback for offline mock mode
  if (!cachedMockClient) {
    cachedMockClient = new OpenAI({
      apiKey: "placeholder-key",
      timeout: 5000,
      maxRetries: 0
    });
  }

  return {
    openai: cachedMockClient,
    modelMini: "gpt-4o-mini",
    modelFast: "gpt-4o-mini",
    modelPro: "gpt-4o-mini",
    modelQuality: "gpt-4o",
    fallbackModels: ["gpt-4o-mini"],
    isConfigured: false
  };
}
