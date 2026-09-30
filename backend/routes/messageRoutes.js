const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('CUSTOMER', 'SELLER'));
router.post('/conversations', authorize('CUSTOMER'), messageController.startConversation);
router.get('/conversations', messageController.getConversations);
router.get('/conversations/:id/messages', messageController.getMessages);
router.post('/conversations/:id/messages', messageController.sendMessage);

module.exports = router;