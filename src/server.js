// server.js
import http from "http";
import app from "./app.js";
import { initSocket } from "./modules/notifications/channels/socket.js"; // your socket logic

const server = http.createServer(app);

// initialize socket
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});