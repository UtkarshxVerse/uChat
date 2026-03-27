const express = require('express');
const createConversation = require('../controllers/conversationController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
const conversationController = require("../controllers/conversationController");
// const getConversationById = require('../controllers/getConversationByIdController');
// const Conversation = require('../controllers/conversationCon');

// POST /api/conversations/create
router.post('/create', authMiddleware, conversationController.createConversation);

// GET /api/conversations/groups
router.get('/groups', authMiddleware, conversationController.getUserGroups);
router.delete('/groups/:id', authMiddleware, conversationController.deleteGroup);
router.get('/groups/:id/members', authMiddleware, conversationController.getGroupMembers);

router.get('/:id', authMiddleware, conversationController.getConversation);
// router.get('/',authMiddleware, conversationController.getConversation);

module.exports = router;