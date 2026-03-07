const express = require("express");
const router = express.Router();
const { signup, login, getAllUsers } = require("../controllers/userController");
const { authLimiter, apiLimiter } = require("../middlewares/rateLimiter");

// create
router.post('/signup', authLimiter ,signup);
router.post('/login',apiLimiter,login);
router.get('/users/recipient-list',apiLimiter, getAllUsers);

module.exports = router;
