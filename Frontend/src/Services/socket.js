import { io } from "socket.io-client";

let socket;

/**
 * Connects to the Socket.IO server
 * @param {string} userId - The logged-in user ID
 */
export const connectSocket = (userId) => {
  if (socket) return; // prevent multiple connections

  socket = io("http://localhost:8000", {
    auth: { userId }, // use auth instead of query
    transports: ["websocket"], // force websocket, optional
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connect error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });
};

/**
 * Returns the socket instance
 */
export const getSocket = () => socket;