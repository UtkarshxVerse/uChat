const socketModule = require("./socketInt");
const jwt = require("jsonwebtoken");

function initSocket() {
  const io = socketModule.getIO(); // ✅ now safe, because init(server) was called first

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
    console.log("✅ Connected:", socket.id, "User:", socket.user.user_id);

    socket.join(`user_${socket.user.user_id}`);

    socket.on("send_message", ({ toUserId, message }) => {
      const room = `user_${toUserId}`;
      io.to(room).emit("receive_message", {
        from: socket.user.user_id,
        message
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.user.user_id);
    });
  });
}

module.exports = { initSocket };