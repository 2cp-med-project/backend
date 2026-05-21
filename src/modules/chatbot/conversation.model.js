import { Schema, model } from "mongoose";

const ConversationSchema = new Schema(
	{
		userId: { type: String, required: true, index: true },
		title: { type: String, default: "New Conversation" },
	},
	{
		timestamps: true,
		minimize: true,
	},
);

export const Conversation = model("Conversation", ConversationSchema);
