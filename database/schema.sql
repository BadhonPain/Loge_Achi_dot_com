-- =============================================
-- LogeAchi E-Commerce Database
-- =============================================

CREATE DATABASE IF NOT EXISTS loge_achi_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

USE loge_achi_db;

-- =============================================
-- 1. SELLERS
-- =============================================

CREATE TABLE sellers (
    seller_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    seller_name VARCHAR(100) NOT NULL,
    shop_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NULL,
    password_hash VARCHAR(255) NOT NULL,
    address VARCHAR(255) NULL,
    profile_image VARCHAR(500) NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_sellers_shop_name UNIQUE (shop_name),
    CONSTRAINT uq_sellers_email UNIQUE (email),
    CONSTRAINT uq_sellers_phone UNIQUE (phone),

    CONSTRAINT chk_sellers_status
        CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE'))
);

-- =============================================
-- 2. CUSTOMERS
-- =============================================

CREATE TABLE customers (
    customer_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NULL,
    password_hash VARCHAR(255) NOT NULL,
    date_of_birth DATE NULL,
    profile_image VARCHAR(500) NULL,

    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_customers_email UNIQUE (email),
    CONSTRAINT uq_customers_phone UNIQUE (phone),

    CONSTRAINT chk_customers_status
        CHECK (account_status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);

-- =============================================
-- 3. CUSTOMER ADDRESSES
-- =============================================

CREATE TABLE customer_addresses (
    address_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    customer_id BIGINT UNSIGNED NOT NULL,

    label VARCHAR(50) NULL,
    recipient_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,

    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255) NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Bangladesh',

    is_default BOOLEAN NOT NULL DEFAULT FALSE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_customer_addresses_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =============================================
-- 4. CATEGORIES
-- =============================================

CREATE TABLE categories (
    category_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    parent_category_id BIGINT UNSIGNED NULL,

    category_name VARCHAR(100) NOT NULL,
    description VARCHAR(500) NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_categories_name UNIQUE (category_name),

    CONSTRAINT fk_categories_parent
        FOREIGN KEY (parent_category_id)
        REFERENCES categories(category_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT chk_categories_status
        CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- =============================================
-- 5. SELLER APPLICATIONS
-- =============================================

CREATE TABLE seller_applications (
    application_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    application_ref CHAR(64) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    store_name VARCHAR(100) NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    business_description TEXT NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT NULL,
    reviewed_by BIGINT UNSIGNED NULL,
    reviewed_at DATETIME NULL,
    seller_id BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_seller_applications_category FOREIGN KEY (category_id)
        REFERENCES categories(category_id),
    CONSTRAINT fk_seller_applications_seller FOREIGN KEY (seller_id)
        REFERENCES sellers(seller_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_seller_applications_status
        CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')),
    INDEX idx_seller_applications_status_created (status, created_at),
    INDEX idx_seller_applications_email (email)
);

-- =============================================
-- 6. PRODUCTS
-- =============================================

CREATE TABLE products (
    product_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    seller_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,

    sku VARCHAR(100) NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    description TEXT NULL,

    price DECIMAL(12,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_products_seller_sku
        UNIQUE (seller_id, sku),

    CONSTRAINT fk_products_seller
        FOREIGN KEY (seller_id)
        REFERENCES sellers(seller_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_products_price
        CHECK (price >= 0),

    CONSTRAINT chk_products_stock
        CHECK (stock_quantity >= 0),

    CONSTRAINT chk_products_status
        CHECK (status IN (
            'ACTIVE',
            'INACTIVE',
            'OUT_OF_STOCK',
            'ARCHIVED'
        ))
);

-- =============================================
-- 6. PRODUCT IMAGES
-- =============================================

CREATE TABLE product_images (
    image_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    product_id BIGINT UNSIGNED NOT NULL,

    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 1,
    alt_text VARCHAR(255) NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_product_images_order
        UNIQUE (product_id, display_order),

    CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_product_images_display_order
        CHECK (display_order > 0)
);

-- =============================================
-- 7. OFFERS
-- =============================================

CREATE TABLE offers (
    offer_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    seller_id BIGINT UNSIGNED NOT NULL,

    offer_name VARCHAR(150) NOT NULL,

    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(12,2) NOT NULL,

    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_offers_seller
        FOREIGN KEY (seller_id)
        REFERENCES sellers(seller_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_offers_discount_type
        CHECK (discount_type IN ('PERCENT', 'FIXED')),

    CONSTRAINT chk_offers_discount_value
        CHECK (
            discount_value >= 0
            AND
            (
                discount_type = 'FIXED'
                OR
                (
                    discount_type = 'PERCENT'
                    AND discount_value <= 100
                )
            )
        ),

    CONSTRAINT chk_offers_dates
        CHECK (end_at > start_at),

    CONSTRAINT chk_offers_status
        CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- =============================================
-- 8. OFFER PRODUCTS
-- =============================================

CREATE TABLE offer_products (
    offer_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (offer_id, product_id),

    CONSTRAINT fk_offer_products_offer
        FOREIGN KEY (offer_id)
        REFERENCES offers(offer_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_offer_products_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =============================================
-- 9. CARTS
-- =============================================

CREATE TABLE carts (
    cart_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    customer_id BIGINT UNSIGNED NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_carts_customer
        UNIQUE (customer_id),

    CONSTRAINT fk_carts_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =============================================
-- 10. CART ITEMS
-- =============================================

CREATE TABLE cart_items (
    cart_item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    cart_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,

    quantity INT NOT NULL,

    added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_cart_items_product
        UNIQUE (cart_id, product_id),

    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id)
        REFERENCES carts(cart_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_cart_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_cart_items_quantity
        CHECK (quantity > 0)
);

-- =============================================
-- 11. ORDERS
-- =============================================

CREATE TABLE orders (
    order_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    customer_id BIGINT UNSIGNED NOT NULL,

    items_subtotal DECIMAL(12,2) NOT NULL,
    discount_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    shipping_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
    grand_total DECIMAL(12,2) NOT NULL,

    order_status VARCHAR(30) NOT NULL DEFAULT 'PENDING_PAYMENT',

    -- Shipping address snapshot
    shipping_name VARCHAR(100) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_address_line1 VARCHAR(255) NOT NULL,
    shipping_address_line2 VARCHAR(255) NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(20) NULL,
    shipping_country VARCHAR(100) NOT NULL DEFAULT 'Bangladesh',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_orders_items_subtotal
        CHECK (items_subtotal >= 0),

    CONSTRAINT chk_orders_discount_total
        CHECK (
            discount_total >= 0
            AND discount_total <= items_subtotal
        ),

    CONSTRAINT chk_orders_shipping_fee
        CHECK (shipping_fee >= 0),

    CONSTRAINT chk_orders_grand_total
        CHECK (
            grand_total =
            items_subtotal - discount_total + shipping_fee
        ),

    CONSTRAINT chk_orders_status
        CHECK (
            order_status IN (
                'PENDING_PAYMENT',
                'CONFIRMED',
                'PREPARING',
                'READY_TO_SHIP',
                'SHIPPED',
                'DELIVERED',
                'CANCELLED'
            )
        )
);

-- =============================================
-- 12. SELLER ORDERS
-- =============================================

CREATE TABLE seller_orders (
    seller_order_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    order_id BIGINT UNSIGNED NOT NULL,
    seller_id BIGINT UNSIGNED NOT NULL,

    items_subtotal DECIMAL(12,2) NOT NULL,
    discount_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    seller_total DECIMAL(12,2) NOT NULL,

    preparation_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_seller_orders_order_seller
        UNIQUE (order_id, seller_id),

    CONSTRAINT fk_seller_orders_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_seller_orders_seller
        FOREIGN KEY (seller_id)
        REFERENCES sellers(seller_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_seller_orders_subtotal
        CHECK (items_subtotal >= 0),

    CONSTRAINT chk_seller_orders_discount
        CHECK (
            discount_total >= 0
            AND discount_total <= items_subtotal
        ),

    CONSTRAINT chk_seller_orders_total
        CHECK (
            seller_total =
            items_subtotal - discount_total
        ),

    CONSTRAINT chk_seller_orders_status
        CHECK (
            preparation_status IN (
                'PENDING',
                'ACCEPTED',
                'PREPARING',
                'READY',
                'SHIPPED',
                'DELIVERED',
                'CANCELLED'
            )
        )
);

-- =============================================
-- 13. ORDER ITEMS
-- =============================================

CREATE TABLE order_items (
    order_item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    seller_order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    applied_offer_id BIGINT UNSIGNED NULL,

    -- Historical product snapshot
    product_name_snapshot VARCHAR(150) NOT NULL,
    sku_snapshot VARCHAR(100) NOT NULL,

    quantity INT NOT NULL,

    unit_price DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    line_total DECIMAL(12,2) NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_order_items_product
        UNIQUE (seller_order_id, product_id),

    CONSTRAINT fk_order_items_seller_order
        FOREIGN KEY (seller_order_id)
        REFERENCES seller_orders(seller_order_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_order_items_offer
        FOREIGN KEY (applied_offer_id)
        REFERENCES offers(offer_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT chk_order_items_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_order_items_unit_price
        CHECK (unit_price >= 0),

    CONSTRAINT chk_order_items_discount
        CHECK (
            discount_amount >= 0
            AND discount_amount <= (unit_price * quantity)
        ),

    CONSTRAINT chk_order_items_line_total
        CHECK (
            line_total =
            (unit_price * quantity) - discount_amount
        )
);

-- =============================================
-- 14. PAYMENTS
-- =============================================

CREATE TABLE payments (
    payment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    order_id BIGINT UNSIGNED NOT NULL,

    transaction_id VARCHAR(150) NULL,

    payment_method VARCHAR(30) NOT NULL,
    payment_provider VARCHAR(50) NULL,

    amount DECIMAL(12,2) NOT NULL,

    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    failure_reason VARCHAR(255) NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME NULL,

    CONSTRAINT uq_payments_transaction
        UNIQUE (transaction_id),

    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_payments_amount
        CHECK (amount >= 0),

    CONSTRAINT chk_payments_method
        CHECK (
            payment_method IN (
                'CARD',
                'MOBILE_BANKING',
                'BANK_TRANSFER',
                'CASH_ON_DELIVERY'
            )
        ),

    CONSTRAINT chk_payments_status
        CHECK (
            payment_status IN (
                'PENDING',
                'PROCESSING',
                'SUCCESS',
                'FAILED',
                'CANCELLED',
                'REFUNDED',
                'PARTIALLY_REFUNDED'
            )
        )
);

-- =============================================
-- 15. SHIPMENTS
-- =============================================

CREATE TABLE shipments (
    shipment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    order_id BIGINT UNSIGNED NOT NULL,

    courier_name VARCHAR(100) NULL,
    tracking_number VARCHAR(150) NULL,

    shipment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    shipped_at DATETIME NULL,
    delivered_at DATETIME NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_shipments_order
        UNIQUE (order_id),

    CONSTRAINT uq_shipments_tracking
        UNIQUE (tracking_number),

    CONSTRAINT fk_shipments_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_shipments_status
        CHECK (
            shipment_status IN (
                'PENDING',
                'PACKED',
                'SHIPPED',
                'OUT_FOR_DELIVERY',
                'DELIVERED',
                'FAILED',
                'RETURNED'
            )
        )
);

-- =============================================
-- 16. REVIEWS
-- =============================================

CREATE TABLE reviews (
    review_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    order_item_id BIGINT UNSIGNED NOT NULL,

    rating TINYINT UNSIGNED NOT NULL,
    comment VARCHAR(1000) NULL,

    review_status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',

    reviewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_reviews_order_item
        UNIQUE (order_item_id),

    CONSTRAINT fk_reviews_order_item
        FOREIGN KEY (order_item_id)
        REFERENCES order_items(order_item_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_reviews_rating
        CHECK (rating BETWEEN 1 AND 5),

    CONSTRAINT chk_reviews_status
        CHECK (
            review_status IN (
                'PUBLISHED',
                'HIDDEN',
                'REMOVED'
            )
        )
);

-- =============================================
-- 17. WISHLIST ITEMS
-- =============================================

CREATE TABLE wishlist_items (
    customer_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (customer_id, product_id),

    CONSTRAINT fk_wishlist_items_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_wishlist_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =============================================
-- 18. SELLER CONVERSATIONS AND MESSAGES
-- =============================================

CREATE TABLE seller_conversations (
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

CREATE TABLE seller_messages (
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
