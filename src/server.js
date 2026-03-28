// server.js
import http from "http";
import app from "./app.js";
import { initSocket } from "./modules/notifications/channels/socket.js"; // your socket logic
import startScheduler from "./modules/notifications/channels/scheduler.js"; // your scheduler logic
const server = http.createServer(app);

// initialize socket
initSocket(server);
// scheduler for the server to send notifications at specific times
startScheduler();
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});