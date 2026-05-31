// server.js
import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";

// 🔥 MUST initialize Firebase BEFORE anything else uses it
import "./modules/notifications/channels/push.js";

import { initSocket } from "./modules/notifications/channels/socket.js";
import startScheduler from "./modules/notifications/channels/scheduler.js";

const server = http.createServer(app);

// initialize socket
initSocket(server);

// start cron scheduler (after Firebase is ready)
startScheduler();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});