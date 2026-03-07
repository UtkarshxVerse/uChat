const Conversation = require("../models/conversationModel");

// CREATE CONVERSATION
const createConversation = async (req, res) => {
  try {
    const created_by = req.user?.id;

    if (!created_by) {
      return res.status(401).json({ message: "Unauthorized: user not logged in" });
    }

    const { type, name, second_user_id, members } = req.body;

    if (!type) {
      return res.status(400).json({ message: "Type is required" });
    }

    if (!["private", "group"].includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }

    if (type === "group" && (!name || !members || members.length < 2)) {
      return res.status(400).json({
        message: "Group chat requires a name and at least 2 members",
      });
    }

    if (type === "private" && !second_user_id) {
      return res.status(400).json({
        message: "Second user ID is required for private chat",
      });
    }

    const conversationId = await Conversation.createConversation({
      type,
      name,
      created_by,
      second_user_id,
      members,
    });

    if (!conversationId || conversationId.status === "error") {
      return res.status(500).json({
        message: conversationId.message || "Server error",
      });
    }

    res.status(201).json({
      message: "Conversation created successfully",
      conversation_id: conversationId,
      created_by: created_by,
      type: type,
      name: name,
      second_user_id: second_user_id,
      members: members,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// GET CONVERSATION
const getConversation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Conversation ID is required",
      });
    }

    const conversation = await Conversation.getConversationById(id);

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    res.status(200).json({
      message: "Conversation fetched successfully",
      data: conversation,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  createConversation,
  getConversation,
};