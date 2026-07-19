const multer = require('multer');
const AppError = require('../utils/AppError');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`, 400), false);
  }
};

// All admin uploads (product/gallery images) go to Cloudinary now — see
// config/cloudinary.js and services/UploadService.js. Files are held in
// memory only long enough to be streamed to Cloudinary; nothing is written
// to local disk, so there's no uploads/ directory dependency anymore.
const memoryStorage = multer.memoryStorage();
const uploadToMemory = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = { uploadToMemory };
