// frontend/Services/socket.js
import { io } from "socket.io-client";

let socket = null;

export const initSocket = () => {
  const token = localStorage.getItem("token"); // get JWT from login
  if (!token) {
    console.error("No JWT token found! Cannot connect socket.");
    return null;
  }

  if (!socket) {
    socket = io("http://192.168.10.36:8000", {
      auth: {
        token,
        device_type: "web",
      },
      autoConnect: true, // default
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
  }

  return socket;
};

export default socket;
