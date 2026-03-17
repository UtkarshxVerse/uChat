const jwt = require("jsonwebtoken");

function authMiddleware(socket, next) {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = decoded;

    next();
  } catch (err) {
    console.log("❌ Auth error:", err.message);
    next(new Error("Unauthorized"));
  }
}

module.exports = authMiddleware;
