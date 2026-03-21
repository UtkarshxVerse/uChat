// frontend/Services/socket.js
import { io } from "socket.io-client";

let socket = null;

export const initSocket = () => {
  const token = localStorage.getItem("token"); // get JWT from login
  if (!token) {
    console.error("No JWT token found! Cannot connect socket.");
    return null;
  }

  if (!socket || !socket.connected) {
    socket = io("http://192.168.10.36:8000", {
      auth: {
        token,
        device_type: "web",
      },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    socket.on("reconnect", () => {
      console.log("🔄 Socket reconnected:", socket.id);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export default socket;
