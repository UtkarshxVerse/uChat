// frontend/Services/socket.js
import { io } from "socket.io-client";

let socket = null;
let unreadCountListeners = [];
let userStatusListeners = [];
let onlineUsers = new Set();

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
      // Request online users list on connection
      socket.emit("get_online_users");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    socket.on("reconnect", () => {
      console.log("🔄 Socket reconnected:", socket.id);
      // Request online users list on reconnection
      socket.emit("get_online_users");
    });

    // Listen for unread count updates
    socket.on("unread_count_update", (data) => {
      console.log("📬 Unread count updated:", data);
      // Notify all listeners
      unreadCountListeners.forEach((listener) => listener(data));
    });

    // Listen for user status updates
    socket.on("user_status", (data) => {
      console.log("👤 User status update:", data);
      if (data.status === "online") {
        onlineUsers.add(data.userId);
      } else {
        onlineUsers.delete(data.userId);
      }
      // Notify all listeners
      userStatusListeners.forEach((listener) => listener(data));
    });

    // Receive online users list
    socket.on("online_users", (data) => {
      console.log("📋 Online users:", data.users);
      onlineUsers.clear();
      data.users.forEach(userId => onlineUsers.add(userId));
      // Notify all status listeners
      userStatusListeners.forEach((listener) => listener({ type: "users_list", users: data.users }));
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

// Subscribe to unread count updates
export const onUnreadCountUpdate = (callback) => {
  unreadCountListeners.push(callback);
  
  return () => {
    unreadCountListeners = unreadCountListeners.filter(
      (listener) => listener !== callback
    );
  };
};

// Subscribe to user status updates
export const onUserStatusUpdate = (callback) => {
  userStatusListeners.push(callback);
  
  return () => {
    userStatusListeners = userStatusListeners.filter(
      (listener) => listener !== callback
    );
  };
};

// Check if a user is online
export const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};

// Get all online users
export const getOnlineUsers = () => {
  return Array.from(onlineUsers);
};

// Mark messages as read
export const markAsRead = (fromUserId) => {
  const socket = getSocket();
  if (socket) {
    socket.emit("mark_as_read", { fromUserId });
    console.log("✅ Marked conversation as read from:", fromUserId);
  }
};

export default socket;
