const express = require("express");
const router = express.Router();
const { signup, login, getAllUsers, uploadProfilePic, updateProfileName } = require("../controllers/userController");
const { authLimiter, apiLimiter } = require("../middlewares/rateLimiter");
const upload = require("../config/multerConfig");

// create
router.post('/signup', authLimiter ,signup);
router.post('/login',apiLimiter,login);
router.get('/users/recipient-list',apiLimiter, getAllUsers);
router.post('/upload-profile-pic', apiLimiter, upload.single('profilePic'), uploadProfilePic);
router.put('/update-name', apiLimiter, updateProfileName);

module.exports = router;
