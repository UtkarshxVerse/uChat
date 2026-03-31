const express = require('express');
const createConversation = require('../controllers/conversationController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
const conversationController = require("../controllers/conversationController");
const { uploadGroup } = require("../config/multerConfig");
// const getConversationById = require('../controllers/getConversationByIdController');
// const Conversation = require('../controllers/conversationCon');

// POST /api/conversations/create
router.post('/create', authMiddleware, conversationController.createConversation);

// GET /api/conversations/groups
router.get('/groups', authMiddleware, conversationController.getUserGroups);
router.delete('/groups/:id', authMiddleware, conversationController.deleteGroup);
router.get('/groups/:id/members', authMiddleware, conversationController.getGroupMembers);

// PUT /api/conversations/groups/:id/picture - Upload group picture
router.put('/groups/:id/picture', authMiddleware, uploadGroup.single('groupPic'), conversationController.updateGroupPic);

router.get('/:id', authMiddleware, conversationController.getConversation);
// router.get('/',authMiddleware, conversationController.getConversation);

module.exports = router;