const db = require("../db"); // your mysql2 connection

const userModel = {

  create: async (name, email, password) => {
    // Use .promise() so that query returns a Promise
    try {
      const [result] = await db
        .query("INSERT INTO users (name, email, password) VALUES (?,?,?)", [
          name,
          email,
          password,
        ]);
      // Return a clean object with the inserted user's ID
      return { id: result.insertId, name, email };
    } catch (error) {
      console.log("Error in create user model", error);
      return { status: "error", message: "Something went wrong", error: error.message };
    }
  },

  findUser: async (email) => {
    try {
      const [rows] = await db
        .query("SELECT * FROM users WHERE email = ?", [email]);
      // Return the first row or undefined if no user
      return rows[0];
    } catch (error) {
      console.log("Error in findUser userModel", error);
      return {
        status: "error",
        message: "Something went wrong",
        error: error.message,
      };
    }
  },

  getAllUsers: async (data) => {
    try {
      const [rows] = await db
        .query("SELECT id, name, email, profile_pic FROM users where id != ?", [data.user_id]);
      return rows;
    } catch (error) {
      console.log("Error in getAllUsers userModel", error);
      return {
        status: "error",
        message: "Something went wrong",
        error: error.message,
      };
    }
  },

  updateProfilePic: async (userId, profilePicUrl) => {
    try {
      const [result] = await db
        .query("UPDATE users SET profile_pic = ? WHERE id = ?", [profilePicUrl, userId]);
      return { success: true, message: "Profile picture updated successfully" };
    } catch (error) {
      console.log("Error in updateProfilePic userModel", error);
      return {
        status: "error",
        message: "Something went wrong",
        error: error.message,
      };
    }
  },

  updateName: async (userId, newName) => {
    try {
      const [result] = await db.query("UPDATE users SET name = ? WHERE id = ?", [newName, userId]);
      return { success: true, message: "Name updated successfully" };
    } catch (error) {
      console.log("Error in updateName userModel", error);
      return {
        status: "error",
        message: "Something went wrong",
        error: error.message,
      };
    }
  },

  getUserById: async (userId) => {
    try {
      const [rows] = await db
        .query("SELECT * FROM users WHERE id = ?", [userId]);
      return rows[0];
    } catch (error) {
      console.log("Error in getUserById userModel", error);
      return {
        status: "error",
        message: "Something went wrong",
        error: error.message,
      };
    }
  },
};

module.exports = userModel;
