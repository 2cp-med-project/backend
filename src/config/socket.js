import { Server as SocketIOServer } from "socket.io";

function createSocketServer(httpServer) {
	return new SocketIOServer(httpServer, {
		cors: { origin: "*", methods: ["GET", "POST"] },
	});
}

export { createSocketServer };
