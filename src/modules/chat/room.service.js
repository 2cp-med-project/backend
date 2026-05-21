import Room from "./room.model.js";

async function findRoomByParticipants(userId1, userId2) {
	return await Room.findOne({
		participants: { $all: [userId1, userId2], $size: 2 },
	});
}

async function createRoom(participants) {
	const room = new Room({ participants });
	return await room.save();
}

async function getAllRooms(userId) {
	return await Room.find({ participants: userId });
}

async function addUserToRoom(roomId, userId) {
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
}

export default {
	findRoomByParticipants,
	createRoom,
	getAllRooms,
	addUserToRoom,
};
