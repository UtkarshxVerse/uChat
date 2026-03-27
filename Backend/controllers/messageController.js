const Message = require("../models/messageModel");
const jwt = require("jsonwebtoken");
// const messageModel = require("../models/messageModel");

const sendMessage = async (req, res) => {
    const { receiverId, message, isGroup } = req.body;
    const senderId = req.user.id;

    console.log("\n🔵 [API] sendMessage endpoint called");
    console.log(`   From: ${senderId}, To (Group? ${isGroup}): ${receiverId}`);
    console.log(`   Message: "${message}"`);

    try {
        console.log("⏳ [DB] Saving message via API...");
        const result = await Message.sendMessage(senderId, receiverId, message, isGroup);
        console.log("✅ [API] Message saved and response sent\n");

        res.send({ status: "success", message: "Message sent successfully" });
    } catch (error) {
        console.error("❌ [ERROR] Error in sendMessage controller:", error.message);
        res.status(500).send({ status: "error", message: "Internal server error", error: error.message });
    }
}

const getMessage = async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user1 = decode.user_id;
    const user2 = req.params.id; // User ID or Group ID
    
    // We can pass isGroup as a query param e.g. /api/messages/123?isGroup=true
    const isGroup = req.query.isGroup === 'true';

    const messages = await Message.getMessages(user1, user2, isGroup);
    res.send({ status: "success", messages: messages });
}

module.exports = {
    sendMessage,
    getMessage
}