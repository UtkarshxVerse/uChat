const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization; // "Bearer <token>"

  if (!authHeader) {
    return res.status(401).json({ message: "Invalid request! User not authenticated." });
  }

  // Extract token
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) {
    return res.status(401).json({ message: "Invalid request! User not authenticated." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.user = { id: decoded.user_id }; // Attach user info
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid request! User not authenticated.", error: error.message });
  }
};

module.exports = authMiddleware;