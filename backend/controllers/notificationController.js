const db = require('../config/db');

exports.getNotifications = async (req, res) => {
    try {
        const [notifications] = await db.query(`
      SELECT notification_id, notification_type, title, body, order_id,
             seller_order_id, seller_id, conversation_id, is_read, created_at
      FROM customer_notifications
      WHERE customer_id = ?
      ORDER BY created_at DESC, notification_id DESC
      LIMIT 30
    `, [req.user.id]);
        const [[count]] = await db.query(`
      SELECT COUNT(*) AS unread_count
      FROM customer_notifications
      WHERE customer_id = ? AND is_read = FALSE
    `, [req.user.id]);

        res.json({ success: true, data: notifications, unread_count: Number(count.unread_count) });
    } catch (error) {
        console.error('Get Customer Notifications Error:', error);
        res.status(500).json({ success: false, message: 'Could not load notifications' });
    }
};

exports.markNotificationRead = async (req, res) => {
    try {
        await db.query(`
      UPDATE customer_notifications
      SET is_read = TRUE, read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
      WHERE notification_id = ? AND customer_id = ?
    `, [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Mark Customer Notification Read Error:', error);
        res.status(500).json({ success: false, message: 'Could not update notification' });
    }
};

exports.markAllNotificationsRead = async (req, res) => {
    try {
        await db.query(`
      UPDATE customer_notifications
      SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE customer_id = ? AND is_read = FALSE
    `, [req.user.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Mark All Customer Notifications Read Error:', error);
        res.status(500).json({ success: false, message: 'Could not update notifications' });
    }
};