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

export function getAIClient() {
  const geminiKey = resolveEnvKey("GEMINI_API_KEY");
  const openAIKey = resolveEnvKey("OPENAI_API_KEY");

  // 1. If Gemini API Key is configured, use high-speed active gemini-flash-lite-latest models via OpenAI compat
  if (geminiKey && !geminiKey.startsWith("placeholder")) {
    if (!cachedGeminiClient) {
      cachedGeminiClient = new OpenAI({
        apiKey: geminiKey,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        timeout: 30000,
        maxRetries: 3
      });
    }

    return {
      openai: cachedGeminiClient,
      modelMini: "gemini-flash-lite-latest",
      modelFast: "gemini-flash-lite-latest",
      modelPro: "gemini-flash-lite-latest",
      modelQuality: "gemini-flash-lite-latest",
      fallbackModels: ["gemini-flash-lite-latest", "gemini-3.1-flash-lite", "gemini-flash-latest"],
      isConfigured: true
    };
  }

  // 2. If OpenAI Key is configured, use standard OpenAI host with timeouts
  if (openAIKey && !openAIKey.startsWith("placeholder")) {
    if (!cachedOpenAIClient) {
      cachedOpenAIClient = new OpenAI({
        apiKey: openAIKey,
        timeout: 30000,
        maxRetries: 2
      });
    }

    return {
      openai: cachedOpenAIClient,
      modelMini: "gpt-4o-mini",
      modelFast: "gpt-4o-mini",
      modelPro: "gpt-4o-mini",
      modelQuality: "gpt-4o",
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
    isConfigured: false
  };
}
