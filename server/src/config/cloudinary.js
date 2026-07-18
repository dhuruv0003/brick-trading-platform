const cloudinary = require('cloudinary').v2;
const config = require('./env');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const { cloudName, apiKey, apiSecret } = config.upload.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      500,
    );
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  configured = true;
}

/**
 * Uploads a Buffer to Cloudinary and returns the result (incl. secure_url).
 * Used for invoice PDFs — resource_type 'raw' since PDFs aren't images.
 */
const uploadBuffer = (buffer, { folder, publicId, resourceType = 'raw' } = {}) => {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: resourceType },
      (error, result) => {
        if (error) {
          logger.error(`Cloudinary upload error: ${error.message}`);
          return reject(error);
        }
        resolve(result);
      },
    );
    stream.end(buffer);
  });
};

module.exports = { uploadBuffer };
