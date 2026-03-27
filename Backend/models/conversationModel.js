const db = require("../db"); // your mysql2/promise pool

const Conversation = {
  createConversation: async (data) => {
    const { type, name, created_by, second_user_id, members } = data;

    try {
      const sqlBase = `INSERT INTO conversations (type, name, created_by`;
      let sql, values;

      if (type === "private") {
        sql = `${sqlBase}, second_user_id) VALUES (?, ?, ?, ?)`;
        values = [
          type,
          name || null,
          created_by !== undefined ? created_by : null,
          second_user_id !== undefined ? second_user_id : null,
        ];
      } else if (type === "group") {
        sql = `${sqlBase}, members) VALUES (?, ?, ?, ?)`;
        values = [
          type,
          name || null,
          created_by !== undefined ? created_by : null,
          members ? JSON.stringify(members) : null,
        ];
      } else {
        throw new Error("Invalid conversation type");
      }

      //   console.log("SQL Query:", sql);
      //   console.log("With Values:", values);

      const [result] = await db.query(sql, values);

      console.log("Conversation created with ID:", result.insertId);
      return result.insertId;
    } catch (error) {
      console.error("Error creating conversation:", error);
      return { status: "error", message: error.message };
    }
  },

  getConversationById: async (id) => {
    try {
      const sql = `SELECT * FROM conversations WHERE id = ?`;
      const [rows] = await db.query(sql, [id]);
      if (!rows.length) return null;

      const conversation = rows[0];

      if (conversation.type === "group" && conversation.members) {
        if (typeof conversation.members === "string") {
          try {
            conversation.members = JSON.parse(conversation.members);
          } catch (err) {
            console.warn("Invalid JSON in members:", conversation.members);
            conversation.members = [];
          }
        }
      }

      return conversation;
    } catch (error) {
      console.error("Error fetching conversation:", error);
      return { status: "error", message: error.message };
    }
  },

  getUserGroups: async (userId) => {
    try {
      const sql = `SELECT * FROM conversations WHERE type = 'group' AND JSON_CONTAINS(members, CAST(? AS JSON), '$')`;
      const [rows] = await db.query(sql, [userId]);
      return rows.map(conv => {
        if (conv.members) {
          if (typeof conv.members === "string") {
            try {
              conv.members = JSON.parse(conv.members);
            } catch (err) {
              conv.members = [];
            }
          }
        }
        return {
          ...conv,
          isGroup: true,
          profile_pic: null
        };
      });
    } catch (error) {
      console.error("Error fetching user groups:", error);
      return { status: "error", message: error.message };
    }
  },

  deleteGroup: async (groupId) => {
    try {
      const sql = `DELETE FROM conversations WHERE id = ? AND type = 'group'`;
      const [result] = await db.query(sql, [groupId]);
      return result;
    } catch (error) {
      console.error("Error deleting group:", error);
      return { status: "error", message: error.message };
    }
  },
};

module.exports = Conversation;
