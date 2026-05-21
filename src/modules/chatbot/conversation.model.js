import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
	{
		userId: { type: String, required: true, index: true },
		title: { type: String, default: "New Conversation" },
	},
	{
		timestamps: true,
		minimize: true,
	},
);

export default mongoose.model("Conversation", ConversationSchema);
