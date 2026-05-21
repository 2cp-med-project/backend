import { ChatOpenAI } from "@langchain/openai";

export const LLM = new ChatOpenAI({
  modelName: "google/gemma-4-26b-a4b-it:nitro",
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "X-Title": "HealBot, a Medical AI Agent",
    },
  },
});
