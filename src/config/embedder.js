import { OpenAIEmbeddings } from "@langchain/openai";

export const embedder = new OpenAIEmbeddings({
	modelName: "qwen/qwen3-embedding-8b:nitro",
	configuration: {
		baseURL: "https://openrouter.ai/api/v1",
		defaultHeaders: {
			"X-Title": "Medical AI Agent",
		},
	},
});
