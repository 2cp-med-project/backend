import Room from "./room.model.js";
import Message from "./message.model.js";

const tag = () => `[${new Date().toLocaleTimeString()}]`;

async function initiateChat(req, res) {
	// #swagger.tags = ['Chat']
	// #swagger.security = [{ bearerAuth: [] }]
	// #swagger.summary = 'Initiate the chat with another doctor'
	// #swagger.description = 'Roles: doctor'

	try {
		const { id } = req.user;
		const { targetId } = req.body;

		if (!id || !targetId) {
			console.log(`${tag()} 🚫 initiateChat: Missing user IDs`);
			return res
				.status(400)
				.json({ error: "Both user IDs are required" });
		}

		let room = await Room.findOne({
			participants: { $all: [id, targetId], $size: 2 },
		});

		if (!room) {
			room = await Room.create({
				participants: [id, targetId],
			});
			console.log(
				`${tag()} ✨ initiateChat: Created new room [${room._id}]`,
			);
		} else {
			console.log(
				`${tag()} 🔎 initiateChat: Found existing room [${room._id}]`,
			);
		}

		return res
			.status(200)
			.json({ message: "Room ready", roomId: room._id, room });
	} catch (error) {
		console.warn(`${tag()} ⚠️  initiateChat failed: ${error.message}`);
		return res.status(500).json({ message: "Internal server error" });
	}
}

async function getRoomMessages(req, res) {
	// #swagger.tags = ['Chat']
	// #swagger.security = [{ bearerAuth: [] }]
	// #swagger.summary = 'Retrieve an existing chat with another doctor'
	// #swagger.description = 'Roles: doctor'

	const roomId = req.params.roomId;

	try {
		const { id } = req.user;

		let room = await Room.findById(roomId);

		if (!room) {
			console.log(
				`${tag()} 🚫 getRoomMessages: Room [${roomId}] not found`,
			);
			return res.status(404).json({ error: "Room not found" });
		}

		if (!room.participants.includes(id)) {
			console.warn(
				`${tag()} 🚨 getRoomMessages: Unauthorized access attempt by user [${id}] on room [${roomId}]`,
			);
			return res
				.status(403)
				.json({ error: "Not authorized to view this room" });
		}

		const messages = await Message.find({ roomId });
		console.log(
			`${tag()} 💬 getRoomMessages: Fetched ${messages.length} messages for room [${roomId}]`,
		);
		return res.status(200).json(messages);
	} catch (error) {
		console.warn(
			`${tag()} ⚠️  getRoomMessages failed for room [${roomId}]: ${error.message}`,
		);
		return res.status(500).json({ message: "Internal server error" });
	}
}

async function deleteChat(req, res) {
	// #swagger.tags = ['Chat']
	// #swagger.security = [{ bearerAuth: [] }]
	// #swagger.summary = 'Delete a chat thread with another doctor'
	// #swagger.description = 'Roles: doctor'

	const roomId = req.params.roomId;

	try {
		const { id } = req.user;

		let room = await Room.findById(roomId);

		if (!room) {
			console.log(`${tag()} 🚫 deleteChat: Room [${roomId}] not found`);
			return res.status(404).json({ error: "Room not found" });
		}

		if (!room.participants.includes(id)) {
			console.warn(
				`${tag()} 🚨 deleteChat: Unauthorized delete attempt by user [${id}] on room [${roomId}]`,
			);
			return res
				.status(403)
				.json({ error: "Not authorized to delete this room" });
		}

		await Room.findByIdAndDelete(roomId);
		const deletedMessages = await Message.deleteMany({ roomId });

		const io = req.app.get("io");
		if (io) {
			io.to(roomId).emit("chat_deleted");
		}

		console.log(
			`${tag()} 🗑️  deleteChat: Room [${roomId}] and ${deletedMessages.deletedCount} messages deleted by user [${id}]`,
		);
		return res.status(200).json({ message: `Room ${roomId} was deleted` });
	} catch (error) {
		console.warn(
			`${tag()} ⚠️  deleteChat failed for room [${roomId}]: ${error.message}`,
		);
		return res.status(500).json({ message: "Internal server error" });
	}
}

export default { initiateChat, getRoomMessages, deleteChat };
