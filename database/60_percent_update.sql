
USE loge_achi_db;

-- Token blacklist for secure logout
CREATE TABLE IF NOT EXISTS token_blacklist (
    token VARCHAR(500) PRIMARY KEY,
    expires_at DATETIME NOT NULL
);

-- Admin table for ADMIN role
CREATE TABLE IF NOT EXISTS admins (
    admin_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_image VARCHAR(500) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SEED DATA: Test Admin Account
-- Email: admin@loge.com  |  Password: admin123
-- =============================================
-- Password hash for 'admin123' generated with bcrypt(10 rounds):
-- You can also run:  node -e "require('bcryptjs').hash('admin123',10).then(h=>console.log(h))"
-- and paste the result here. For now, use the migrate.js script.
