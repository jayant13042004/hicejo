import { OpenAI } from "openai";

export function getAIClient() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;

  // 1. If Gemini API Key is configured, use the OpenAI compatibility endpoint
  if (geminiKey && !geminiKey.startsWith("placeholder")) {
    return {
      openai: new OpenAI({
        apiKey: geminiKey,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
      }),
      modelMini: "gemini-3.6-flash",
      modelPro: "gemini-3.6-flash",
      isConfigured: true
    };
  }

  // 2. If OpenAI Key is configured, use standard OpenAI host
  if (openAIKey && !openAIKey.startsWith("placeholder")) {
    return {
      openai: new OpenAI({
        apiKey: openAIKey
      }),
      modelMini: "gpt-4o-mini",
      modelPro: "gpt-4o",
      isConfigured: true
    };
  }

  // 3. Fallback for offline mock mode
  return {
    openai: new OpenAI({
      apiKey: "placeholder-key"
    }),
    modelMini: "gpt-4o-mini",
    modelPro: "gpt-4o",
    isConfigured: false
  };
}
