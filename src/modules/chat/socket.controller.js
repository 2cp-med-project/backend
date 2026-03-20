import { createMessage } from "./message.service.js";
import { connectUser, disconnectUser } from "./user.service.js";

export const handleSocketConnection = (io) => {
	io.on("connection", (socket) => {
		console.log(`User connected: ${socket.id}`);

		socket.on("join", async ({ user, roomId }) => {
			await connectUser(user.id, socket.id);
			socket.join(roomId);

			console.log(`${user.userName} joined chat room: ${roomId}`);
		});

		socket.on("message", async ({ roomId, senderId, senderName, text }) => {
			try {
				const message = await createMessage(
					roomId,
					senderId,
					senderName,
					text,
				);

				socket.to(roomId).emit("message", message);
			} catch (error) {
				console.error("Socket Message Save Error:", error);
			}
		});

		socket.on("disconnect", async () => {
			await disconnectUser(socket.id);

			console.log(`Doctor disconnected: ${socket.id}`);
		});
	});
};
