USE loge_achi_db;

CREATE TABLE IF NOT EXISTS seller_applications (
    application_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    application_ref CHAR(64) NOT NULL,
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
    CONSTRAINT uq_seller_applications_ref UNIQUE (application_ref),
    CONSTRAINT fk_seller_applications_category FOREIGN KEY (category_id)
        REFERENCES categories(category_id),
    CONSTRAINT fk_seller_applications_seller FOREIGN KEY (seller_id)
        REFERENCES sellers(seller_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_seller_applications_status
        CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')),
    INDEX idx_seller_applications_status_created (status, created_at),
    INDEX idx_seller_applications_email (email)
);