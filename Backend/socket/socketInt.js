const { Server } = require("socket.io");

let io = null;

function init(server) {
  if (io) return io;

  io = new Server(server, { cors: { origin: "*" } });
  console.log("✅ Socket.io initialized");

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket not initialized");
  return io;
}

module.exports = { init, getIO };