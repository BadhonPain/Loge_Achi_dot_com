const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('CUSTOMER'));
router.get('/', notificationController.getNotifications);
router.post('/read-all', notificationController.markAllNotificationsRead);
router.post('/:id/read', notificationController.markNotificationRead);

module.exports = router;