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
      user: { id: user.id, name: user.name, email: user.email },
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

// const getUser=async(req,res)=>{
//   try {
//     // prepare param for model
//       const prepareParamForModel={
//         user_id:req.params.user_id
//       }
//       const responseFromModel = await userModel.getUser(prepareParamForModel);
//        return res.send({
//           status:responseFromModel.status,
//           message:responseFromModel.message,
//           data:responseFromModel.data ??[]
//         })

//   } catch (error) {
//     console.log("getUserError",error);
//     return res.send({
//       status:'error',
//       message:'Something went wrong',
//       error:error.message
//     })
//   }
// }

module.exports = { signup, login, getAllUsers };
