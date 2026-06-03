import { Server as SocketIOServer } from "socket.io";

export let io;
export const onlineUsers = {};

export function initSocket(httpServer) {
	io = new SocketIOServer(httpServer, {
		cors: { origin: "*", methods: ["GET", "POST"] },
	});

	io.on("connection", (socket) => {
		const userId = socket.user?.id;
		if (userId) {
			onlineUsers[userId] = socket.id;
			console.log("User connected:", userId);
		} else {
			console.log("User connected:", socket.id);
		}

		// Backward-compatible manual registration
		socket.on("register", ({ userId: registeredUserId } = {}) => {
			if (!registeredUserId) return;
			onlineUsers[registeredUserId] = socket.id;
			console.log("User registered:", registeredUserId);
		});

		socket.on("disconnect", () => {
			if (userId && onlineUsers[userId] === socket.id) {
				delete onlineUsers[userId];
				console.log("User disconnected:", userId);
				return;
			}

			for (const id in onlineUsers) {
				if (onlineUsers[id] === socket.id) {
					delete onlineUsers[id];
					console.log("User disconnected:", id);
					break;
				}
			}
		});
	});

	return io;
}

export default initSocket;
