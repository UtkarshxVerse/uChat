const socketModule = require("./socketInt");
const jwt = require("jsonwebtoken");
const db = require("../db");

// Track online users
const onlineUsers = new Map();

// Global unread counts storage (keyed by recipient_id_from_sender_id)
const globalUnreadCounts = new Map();

function initSocket() {
  const io = socketModule.getIO();

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.user_id;

    // Mark user as online
    onlineUsers.set(userId, {
      socketId: socket.id,
      userId: userId,
      timestamp: new Date()
    });

    socket.join(`user_${userId}`);

    // Broadcast user came online
    io.emit("user_status", {
      userId: userId,
      status: "online"
    });
    // console.log(`✅ User ${userId} came online`);

    socket.on("send_message", async ({ toUserId, message, timestamp, isGroup }) => {
      try {
        console.log("Preparing real-time delivery to recipient(s)...");

        if (isGroup) {
          // Fetch members of the group
          const [rows] = await db.query(`SELECT members FROM conversations WHERE id = ?`, [toUserId]);
          if (rows.length > 0) {
            let members = rows[0].members;
            if (typeof members === 'string') members = JSON.parse(members);

            members.forEach(memberId => {
              if (memberId !== userId) {
                const room = `user_${memberId}`;
                io.to(room).emit("receive_message", {
                  from: toUserId, // Group ID
                  realSenderId: userId,
                  message,
                  timestamp: timestamp || new Date().toISOString(),
                  isGroup: true
                });

                // Update unread count for group
                const unreadKey = `${toUserId}_from_${toUserId}`; // Using group as the sender for badge aggregation
                const currentUnread = globalUnreadCounts.get(unreadKey) || 0;
                globalUnreadCounts.set(unreadKey, currentUnread + 1);

                io.to(room).emit("unread_count_update", {
                  from: toUserId,
                  unreadCount: currentUnread + 1
                });
              }
            });
          }
        } else {
          const room = `user_${toUserId}`;
          console.log(`Broadcasting to room: ${room}`);
          io.to(room).emit("receive_message", {
            from: userId,
            message,
            timestamp: timestamp || new Date().toISOString()
          });

          // Increment unread count for recipient and broadcast it
          const unreadKey = `${toUserId}_from_${userId}`;
          const currentUnread = globalUnreadCounts.get(unreadKey) || 0;
          globalUnreadCounts.set(unreadKey, currentUnread + 1);

          io.to(room).emit("unread_count_update", {
            from: userId,
            unreadCount: currentUnread + 1
          });
        }
        // console.log(`Unread count updated: ${unreadKey} = ${currentUnread + 1}\n`);

      } catch (error) {
        console.error("Failed to broadcast message:", error.message);
        socket.emit("message_error", { error: "Failed to broadcast message" });
      }
    });

    // Reset unread count when user opens conversation
    socket.on("mark_as_read", ({ fromUserId }) => {
      const unreadKey = `${userId}_from_${fromUserId}`;
      globalUnreadCounts.set(unreadKey, 0);
      // console.log(`Marked as read: ${unreadKey}`);

      // Broadcast to all sockets in user's room to update all connected clients
      io.to(`user_${userId}`).emit("unread_count_update", {
        from: fromUserId,
        unreadCount: 0
      });
    });

    // Get online users
    socket.on("get_online_users", () => {
      const onlineUsersList = Array.from(onlineUsers.values()).map(u => u.userId);
      socket.emit("online_users", { users: onlineUsersList });
      // console.log(`Sent online users list to ${userId}:`, onlineUsersList);
    });

    socket.on("disconnect", () => {
      // Mark user as offline
      onlineUsers.delete(userId);

      // Broadcast user went offline
      io.emit("user_status", {
        userId: userId,
        status: "offline"
      });
      // console.log(`❌ User ${userId} went offline`);
    });
  });
}

module.exports = { initSocket, onlineUsers };