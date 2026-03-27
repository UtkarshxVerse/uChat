const db = require("../db");

const Message = {
  sendMessage: async (senderId, receiverId, message, isGroup = false) => {
    try {
      let sendMessageQuery;
      let values;
      
      if (isGroup) {
        sendMessageQuery = `INSERT INTO messages (sender_id, group_id, message) VALUES (?, ?, ?)`;
        values = [senderId, receiverId, message];
      } else {
        sendMessageQuery = `INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)`;
        values = [senderId, receiverId, message];
      }
      
      const [resSendMessageQuery] = await db.query(sendMessageQuery, values);
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

  getMessages: async (user1, user2, isGroup = false) => {
    try {
      let sql;
      let values;
      
      if (isGroup) {
         sql = `SELECT * FROM messages WHERE group_id = ? ORDER BY created_at ASC`;
         values = [user2]; // user2 acts as group_id here
      } else {
         sql = `SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC`;
         values = [user1, user2, user2, user1];
      }

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
