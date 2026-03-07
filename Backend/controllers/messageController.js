const Message = require("../models/messageModel");
const jwt = require("jsonwebtoken");
// const messageModel = require("../models/messageModel");

const sendMessage = async (req, res) => {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;
    console.log("s fbskjf", req.body);
    try {
        const result = await Message.sendMessage(senderId, receiverId, message);
        res.send({ status: "success", message: "Message sent successfully" });
    } catch (error) {
        console.error("Error in sendMessage controller", error);
        res.status(500).send({ status: "error", message: "Internal server error", error: error.message });
    }
}

const getMessage = async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user1 = decode.user_id;
    const user2 = req.params.id;

    const messages = await Message.getMessages(user1, user2);
    res.send({ status: "success", messages: messages });
}

module.exports = {
    sendMessage,
    getMessage
}