import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		roomId: { type: String, required: true },
		senderId: { type: String, required: true },
		senderName: { type: String, required: true, trim: true },
		payload: { type: String, required: true, trim: true },
	},
	{ timestamps: true },
);

export default mongoose.model("Message", messageSchema);
