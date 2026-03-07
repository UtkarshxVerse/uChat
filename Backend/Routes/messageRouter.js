const express = require("express");
const { sendMessage, getMessage } = require("../controllers/messageController");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/',authMiddleware, sendMessage);

router.get('/:id', authMiddleware, getMessage);

module.exports = router;