import Doctor from "../users/doctor.model.js";
import Message from "./message.model.js";
import AuthMiddleware from "../../middleware/auth.js";

const tag = () => `[${new Date().toLocaleTimeString()}]`;

function handleSockets(io) {
	io.use(AuthMiddleware.socketAuthenticate);

	io.on("connection", (socket) => {
		console.log(`${tag()} 🔌 connection: User connected [${socket.id}]`);

		socket.on("join", async ({ roomId }) => {
			try {
				await Doctor.findByIdAndUpdate(socket.user.id, {
					socketId: socket.id,
				});
				socket.join(roomId);

				console.log(
					`${tag()} 🚪 join: User [${socket.user.id}] joined chat room [${roomId}]`,
				);
			} catch (error) {
				console.warn(`${tag()} ⚠️  join failed: ${error.message}`);
			}
		});

		socket.on("message", async ({ roomId, payload }) => {
			try {
				const message = await Message.create({
					roomId,
					senderId: socket.user.id,
					senderName: "placeholder",
					payload,
				});

				socket.to(roomId).emit("message", message);
				console.log(
					`${tag()} ✉️  message: Broadcasted message from [${socket.user.id}] to room [${roomId}]`,
				);
			} catch (error) {
				console.warn(
					`${tag()} ⚠️  message save failed: ${error.message}`,
				);
			}
		});

		socket.on("disconnect", async () => {
			try {
				await Doctor.findOneAndUpdate(
					{ socketId: socket.id },
					{ socketId: null },
				);
				console.log(
					`${tag()} 🔴 disconnect: User disconnected [${socket.id}]`,
				);
			} catch (error) {
				console.warn(
					`${tag()} ⚠️  disconnect failed: ${error.message}`,
				);
			}
		});
	});
}

export default handleSockets;
