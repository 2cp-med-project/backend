import Message from "./message.model.js";

async function createMessage(roomId, senderId, senderName, text) {
	const message = new Message({ roomId, senderId, senderName, text });
	return await message.save();
}

async function getMessagesByRoomId(roomId) {
	return await Message.find({ roomId });
}

export default { createMessage, getMessagesByRoomId };
