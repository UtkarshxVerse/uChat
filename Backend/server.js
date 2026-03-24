require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { init, getIO } = require("./socket/socketInt");
const { initSocket } = require("./socket/socketUtils");
const authRouter = require("./Routes/authRouter");
const messageRouter = require("./Routes/messageRouter");
const conversationRouter = require("./Routes/conversationRouter");
const { apiLimiter } = require("./middlewares/rateLimiter");
const initDatabase = require("./db-init");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// create HTTP server
const server = http.createServer(app);

// ✅ Step 1: Initialize Socket.io
init(server);

// ✅ Step 2: Initialize socket logic (middleware, event listeners)
initSocket();

// routes
app.use("/api/auth", apiLimiter, authRouter);
app.use("/api/messages", apiLimiter, messageRouter);
app.use("/api/conversations", apiLimiter, conversationRouter);

// start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // Initialize database
  await initDatabase();
});