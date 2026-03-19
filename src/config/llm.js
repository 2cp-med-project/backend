import { ChatOpenAI } from "@langchain/openai";

// Initialize LLMs

export const fastLLM = new ChatOpenAI({
	modelName: "openai/gpt-oss-20b:nitro",
	configuration: {
		baseURL: "https://openrouter.ai/api/v1",
	},
});

export const powerLLM = new ChatOpenAI({
	modelName: "minimax/minimax-m2.5:nitro",
	configuration: {
		baseURL: "https://openrouter.ai/api/v1",
	},
});
