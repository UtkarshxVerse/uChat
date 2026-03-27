const userModel = require("../models/userModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { get } = require("../Routes/authRouter.js");


const signup = async (req, res) => {
  const { name, email, password } = req.body;
  const data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };

  const allowedDomains = ["@gmail.com", "@yahoo.com"];
  const isValidDomain = allowedDomains.some(domain => email.endsWith(domain));
  if (!isValidDomain) {
    return res.status(400).send({ message: "Only @gmail.com or @yahoo.com emails are allowed" });
  }

  try {
    const ExistingUser = await userModel.findUser(email);
    if (ExistingUser) {
      return res.send({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create(name, email, hashedPassword);

    res.send({
      status: "success",
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const allowedDomains = ["@gmail.com", "@yahoo.com"];
  const isValidDomain = allowedDomains.some(domain => email.endsWith(domain));
  if (!isValidDomain) {
    return res.status(400).send({ message: "Only @gmail.com or @yahoo.com emails are allowed" });
  }

  try {
    const user = await userModel.findUser(email);

    if (!user) {
      return res.send({ message: "User not found" });
    }
    const passMatch = await bcrypt.compare(password, user.password);
    if (!passMatch) {
      return res.send({ message: "Invalid password" });
    }

    const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.send({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, profile_pic: user.profile_pic },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.send({ message: "Internal server error" }, error);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("authHeader:", authHeader);

    // 1️⃣ Check if token exists
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // 2️⃣ Extract token from "Bearer <token>"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    // 3️⃣ Verify token (secure way)
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const dataForUser={
     user_id: decodedToken.user_id
    } 
    
    // 4️⃣ Fetch users from model
    const users = await userModel.getAllUsers(dataForUser);
    // 5️⃣ Send response
    return res.status(200).json({
      status: "success",
      users: users,
    });

  } catch (error) {
    console.log("Error in getAllUsers:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const uploadProfilePic = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    // Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.user_id;

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get the file info
    const profilePicUrl = `/uploads/profile-pics/${req.file.filename}`;

    // Update user profile picture in database
    const result = await userModel.updateProfilePic(userId, profilePicUrl);

    if (result.status === "error") {
      return res.status(500).json(result);
    }

    // Get updated user data
    const updatedUser = await userModel.getUserById(userId);

    return res.status(200).json({
      status: "success",
      message: "Profile picture uploaded successfully",
      profilePicUrl: profilePicUrl,
      user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, profile_pic: updatedUser.profile_pic }
    });

  } catch (error) {
    console.error("Error uploading profile pic:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to upload profile picture",
      error: error.message,
    });
  }
};

const updateProfileName = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.user_id;

    const { newName } = req.body;
    if (!newName || newName.trim() === "") {
      return res.status(400).json({ message: "Name cannot be empty" });
    }

    const result = await userModel.updateName(userId, newName.trim());

    if (result.status === "error") {
      return res.status(500).json(result);
    }

    const updatedUser = await userModel.getUserById(userId);

    return res.status(200).json({
      status: "success",
      message: "Name updated successfully",
      user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, profile_pic: updatedUser.profile_pic }
    });

  } catch (error) {
    console.error("Error updating name:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update name",
      error: error.message,
    });
  }
};

module.exports = { signup, login, getAllUsers, uploadProfilePic, updateProfileName };
