const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const multer = require('multer');

const uploadDirectory = path.join(__dirname, '..', 'uploads', 'profile-pictures');
const extensionsByMimeType = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
};

fs.mkdirSync(uploadDirectory, { recursive: true });

const upload = multer({
    storage: multer.diskStorage({
        destination: uploadDirectory,
        filename: (req, file, callback) => {
            callback(null, `${randomUUID()}${extensionsByMimeType[file.mimetype]}`);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (!extensionsByMimeType[file.mimetype]) {
            return callback(new Error('Profile images must be JPEG, PNG, or WebP'));
        }
        callback(null, true);
    },
}).single('profile_image');

const uploadProfileImage = (req, res, next) => {
    upload(req, res, (error) => {
        if (!error) return next();
        const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        res.status(status).json({ message: error.message });
    });
};

module.exports = uploadProfileImage;