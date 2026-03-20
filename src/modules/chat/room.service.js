import { Room } from "./room.model.js";

export const findRoomByParticipants = async (userId1, userId2) => {
	return await Room.findOne({
		participants: { $all: [userId1, userId2], $size: 2 },
	});
};

export const createRoom = async (participants) => {
	const room = new Room({ participants });
	return await room.save();
};

export const getAllRooms = async (userId) => {
	return await Room.find({ participants: userId });
};

export const addUserToRoom = async (roomId, userId) => {
	const room = await Room.findById(roomId);

	if (room) {
		if (
			room.participants.length >= 2 &&
			!room.participants.includes(userId)
		) {
			throw new Error("A room cannot have more than 2 participants.");
		}

		if (!room.participants.includes(userId)) {
			room.participants.push(userId);
			await room.save();
		}
	}
};
