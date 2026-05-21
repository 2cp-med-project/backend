import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
	{
		roomId: { type: String, required: true },
		senderId: { type: String, required: true },
		senderName: { type: String, required: true },
		text: { type: String, required: true, trim: true },
	},
	{
		timestamps: true,
		minimize: true,
	},
);

export default mongoose.model("Message", MessageSchema);
