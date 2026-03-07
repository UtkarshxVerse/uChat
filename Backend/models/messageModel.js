const db = require("../db");

const Message = {
  sendMessage: async (senderId, receiverId, message) => {
    try {
      const sendMessageQuery = `INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)`;
      const [resSendMessageQuery] = await db.query(sendMessageQuery, [
        senderId,
        receiverId,
        message,
      ]);
      return resSendMessageQuery;
    } catch (error) {
      console.log("Error in sendMessage messageModel", error);
      return {
        status: "error",
        message: "Something went wrong",
        error: error.message,
      };
    }
  },

  getMessages: async (user1, user2) => {
    try {
      const sql = `SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC`;

      const values = [user1, user2, user2, user1];

      // console.log("SQL:", sql);
      // console.log("Values:", values);

      const [rows] = await db.execute(sql, values);

      return rows;
    } catch (error) {
      console.log("Error in getMessages messageModel", error);
      return {
        status: "error",
        message: "Something went wrong",
        error: error.message,
      };
    }
  },
};

module.exports = Message;
