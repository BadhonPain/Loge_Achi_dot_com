USE loge_achi_db;

CREATE TABLE IF NOT EXISTS seller_conversations (
    conversation_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    seller_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_message_at DATETIME NULL,
    CONSTRAINT uq_seller_conversation_context UNIQUE (customer_id, seller_id, product_id),
    CONSTRAINT fk_seller_conversations_customer FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_seller_conversations_seller FOREIGN KEY (seller_id)
        REFERENCES sellers(seller_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_seller_conversations_product FOREIGN KEY (product_id)
        REFERENCES products(product_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_seller_conversations_seller_recent (seller_id, last_message_at),
    INDEX idx_seller_conversations_customer_recent (customer_id, last_message_at)
);

CREATE TABLE IF NOT EXISTS seller_messages (
    message_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT UNSIGNED NOT NULL,
    sender_role VARCHAR(10) NOT NULL,
    sender_customer_id BIGINT UNSIGNED NULL,
    sender_seller_id BIGINT UNSIGNED NULL,
    message_body VARCHAR(2000) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_seller_messages_conversation FOREIGN KEY (conversation_id)
        REFERENCES seller_conversations(conversation_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_seller_messages_customer FOREIGN KEY (sender_customer_id)
        REFERENCES customers(customer_id),
    CONSTRAINT fk_seller_messages_seller FOREIGN KEY (sender_seller_id)
        REFERENCES sellers(seller_id),
    CONSTRAINT chk_seller_messages_sender CHECK (
        (sender_role = 'CUSTOMER' AND sender_customer_id IS NOT NULL AND sender_seller_id IS NULL)
        OR (sender_role = 'SELLER' AND sender_seller_id IS NOT NULL AND sender_customer_id IS NULL)
    ),
    INDEX idx_seller_messages_conversation_time (conversation_id, created_at)
);