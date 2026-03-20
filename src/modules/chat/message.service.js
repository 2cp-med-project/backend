import { Message } from "./message.model.js";

export const createMessage = async (roomId, senderId, senderName, text) => {
	const message = new Message({ roomId, senderId, senderName, text });
	return await message.save();
};

export const getMessagesByRoomId = async (roomId) => {
	return await Message.find({ roomId });
};
