const express = require('express');
const createConversation = require('../controllers/conversationController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
const conversationController = require("../controllers/conversationController");
// const getConversationById = require('../controllers/getConversationByIdController');
// const Conversation = require('../controllers/conversationCon');

// POST /api/conversations
router.post('/create',authMiddleware, conversationController.createConversation);
router.get('/:id',authMiddleware, conversationController.getConversation);
// router.get('/',authMiddleware, conversationController.getConversation);

module.exports = router;