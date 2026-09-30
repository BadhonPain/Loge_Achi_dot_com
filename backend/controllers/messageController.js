const db = require('../config/db');

const getConversationForUser = async (conversationId, user) => {
    const ownerColumn = user.role === 'CUSTOMER' ? 'customer_id' : 'seller_id';
    const [rows] = await db.query(`
    SELECT conversation_id, customer_id, seller_id, product_id
    FROM seller_conversations
    WHERE conversation_id = ? AND ${ownerColumn} = ?
  `, [conversationId, user.id]);
    return rows[0];
};

exports.startConversation = async (req, res) => {
    try {
        const { seller_id, product_id } = req.body;
        if (!seller_id || !product_id) {
            return res.status(400).json({ success: false, message: 'seller_id and product_id are required' });
        }

        const [products] = await db.query(`
      SELECT p.product_id, p.seller_id
      FROM products p
      JOIN sellers s ON s.seller_id = p.seller_id
      WHERE p.product_id = ? AND p.seller_id = ? AND s.status = 'ACTIVE'
    `, [product_id, seller_id]);
        if (!products.length) {
            return res.status(404).json({ success: false, message: 'Active seller product not found' });
        }

        await db.query(`
      INSERT IGNORE INTO seller_conversations (customer_id, seller_id, product_id)
      VALUES (?, ?, ?)
    `, [req.user.id, seller_id, product_id]);
        const [conversations] = await db.query(`
      SELECT conversation_id
      FROM seller_conversations
      WHERE customer_id = ? AND seller_id = ? AND product_id = ?
    `, [req.user.id, seller_id, product_id]);

        res.status(200).json({ success: true, data: conversations[0] });
    } catch (error) {
        console.error('Start Seller Conversation Error:', error);
        res.status(500).json({ success: false, message: 'Could not start a conversation' });
    }
};

exports.getConversations = async (req, res) => {
    try {
        const ownerColumn = req.user.role === 'CUSTOMER' ? 'customer_id' : 'seller_id';
        const [conversations] = await db.query(`
      SELECT c.conversation_id, c.customer_id, c.seller_id, c.product_id,
             c.created_at, c.last_message_at, p.product_name,
             s.shop_name, s.seller_name, customers.name AS customer_name,
             (SELECT message_body FROM seller_messages
              WHERE conversation_id = c.conversation_id
              ORDER BY created_at DESC, message_id DESC LIMIT 1) AS last_message
      FROM seller_conversations c
      JOIN products p ON p.product_id = c.product_id
      JOIN sellers s ON s.seller_id = c.seller_id
      JOIN customers ON customers.customer_id = c.customer_id
      WHERE c.${ownerColumn} = ?
      ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
    `, [req.user.id]);

        res.json({ success: true, data: conversations });
    } catch (error) {
        console.error('Get Conversations Error:', error);
        res.status(500).json({ success: false, message: 'Could not load conversations' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const conversation = await getConversationForUser(req.params.id, req.user);
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        const [messages] = await db.query(`
      SELECT m.message_id, m.sender_role, m.sender_customer_id, m.sender_seller_id,
             m.message_body, m.created_at,
             CASE WHEN m.sender_role = 'CUSTOMER' THEN customers.name ELSE sellers.seller_name END AS sender_name
      FROM seller_messages m
      LEFT JOIN customers ON customers.customer_id = m.sender_customer_id
      LEFT JOIN sellers ON sellers.seller_id = m.sender_seller_id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC, m.message_id ASC
    `, [conversation.conversation_id]);

        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Get Conversation Messages Error:', error);
        res.status(500).json({ success: false, message: 'Could not load messages' });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const messageBody = typeof req.body.message_body === 'string' ? req.body.message_body.trim() : '';
        if (!messageBody || messageBody.length > 2000) {
            return res.status(400).json({ success: false, message: 'Message must be between 1 and 2000 characters' });
        }

        const conversation = await getConversationForUser(req.params.id, req.user);
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        const senderCustomerId = req.user.role === 'CUSTOMER' ? req.user.id : null;
        const senderSellerId = req.user.role === 'SELLER' ? req.user.id : null;
        const [result] = await db.query(`
      INSERT INTO seller_messages (conversation_id, sender_role, sender_customer_id, sender_seller_id, message_body)
      VALUES (?, ?, ?, ?, ?)
    `, [conversation.conversation_id, req.user.role, senderCustomerId, senderSellerId, messageBody]);
        await db.query(
            'UPDATE seller_conversations SET last_message_at = CURRENT_TIMESTAMP WHERE conversation_id = ?',
            [conversation.conversation_id]
        );

        const [messages] = await db.query(`
      SELECT m.message_id, m.sender_role, m.sender_customer_id, m.sender_seller_id,
             m.message_body, m.created_at,
             CASE WHEN m.sender_role = 'CUSTOMER' THEN customers.name ELSE sellers.seller_name END AS sender_name
      FROM seller_messages m
      LEFT JOIN customers ON customers.customer_id = m.sender_customer_id
      LEFT JOIN sellers ON sellers.seller_id = m.sender_seller_id
      WHERE m.message_id = ?
    `, [result.insertId]);

        res.status(201).json({ success: true, data: messages[0] });
    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({ success: false, message: 'Could not send message' });
    }
};