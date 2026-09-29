const db = require('./backend/config/db');
const fs = require('fs');

async function run() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS token_blacklist (
                token VARCHAR(500) PRIMARY KEY,
                expires_at DATETIME NOT NULL
            )
        `);
        console.log("Created token_blacklist table");

        await db.execute(`
            CREATE TABLE IF NOT EXISTS admins (
                admin_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                profile_image VARCHAR(500) NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Created admins table");

        // Insert a dummy admin for testing
        const bcrypt = require('bcryptjs');
        const hash = await bcrypt.hash('admin123', 10);
        await db.execute(`
            INSERT IGNORE INTO admins (name, email, password_hash) 
            VALUES ('Super Admin', 'admin@loge.com', ?)
        `, [hash]);
        console.log("Inserted test admin");

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
