import { Server } from "socket.io";

export let io;
export const onlineUsers = {}; // userId -> socketId

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*", // allow frontend (change later in production)
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // 🔑 Register user (VERY IMPORTANT)
    socket.on("register", ({ userId }) => {
      onlineUsers[userId] = socket.id;
      console.log("User registered:", userId);
    });

    //  Disconnect
    socket.on("disconnect", () => {
      for (const userId in onlineUsers) {
        if (onlineUsers[userId] === socket.id) {
          delete onlineUsers[userId];
          console.log("User disconnected:", userId);
          break;
        }
      }
    });
  });
}
export default {
   io,
   onlineUsers,
   initSocket
}