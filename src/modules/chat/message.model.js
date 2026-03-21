import { Schema, model } from "mongoose";

const MessageSchema = new Schema(
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

export const Message = model("Message", MessageSchema);
