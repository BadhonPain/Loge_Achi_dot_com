USE loge_achi_db;

CREATE TABLE IF NOT EXISTS customer_notifications (
    notification_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    notification_type VARCHAR(30) NOT NULL,
    title VARCHAR(160) NOT NULL,
    body VARCHAR(500) NOT NULL,
    order_id BIGINT UNSIGNED NULL,
    seller_order_id BIGINT UNSIGNED NULL,
    seller_id BIGINT UNSIGNED NULL,
    conversation_id BIGINT UNSIGNED NULL,
    message_id BIGINT UNSIGNED NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME NULL,
    CONSTRAINT fk_customer_notifications_customer FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_customer_notifications_order FOREIGN KEY (order_id)
        REFERENCES orders(order_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_customer_notifications_seller_order FOREIGN KEY (seller_order_id)
        REFERENCES seller_orders(seller_order_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_customer_notifications_seller FOREIGN KEY (seller_id)
        REFERENCES sellers(seller_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_customer_notifications_conversation FOREIGN KEY (conversation_id)
        REFERENCES seller_conversations(conversation_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_customer_notifications_message FOREIGN KEY (message_id)
        REFERENCES seller_messages(message_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_customer_notifications_type
        CHECK (notification_type IN ('ORDER_STATUS', 'SELLER_REPLY')),
    UNIQUE KEY uq_customer_notifications_message (message_id),
    INDEX idx_customer_notifications_unread (customer_id, is_read, created_at)
);