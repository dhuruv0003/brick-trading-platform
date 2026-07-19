const axios = require('axios');
const https = require('https');
const FormData = require('form-data');
const crypto = require('crypto');
const path = require('path');

const config = require('./env');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const CLOUDINARY_TIMEOUT_MS = 45000; // generous enough for larger images on a slow connection
const UPLOAD_URL = () => `https://api.cloudinary.com/v1_1/${config.upload.cloudinary.cloudName}/image/upload`;
const DESTROY_URL = () => `https://api.cloudinary.com/v1_1/${config.upload.cloudinary.cloudName}/image/destroy`;

// A dedicated keep-alive HTTPS agent avoids re-negotiating a fresh TLS
// connection for every upload, which on some hosts (Render, other PaaS
// with strict outbound connection handling) can be slow enough to trip a
// client-side or proxy-level timeout — one plausible cause of the 499s
// this integration was previously hitting on the official Cloudinary SDK.
const keepAliveAgent = new https.Agent({ keepAlive: true, maxSockets: 20 });

/**
 * Builds the "string to sign" per Cloudinary's documented algorithm:
 * take every parameter that will be sent to the upload/destroy call
 * EXCEPT file, cloud_name, resource_type, and api_key; sort the remaining
 * keys alphabetically; join as key=value pairs with '&'; append the API
 * secret; SHA-1 hash the result.
 *
 * Building this from an actual params object (rather than a hardcoded
 * string, as the previous implementation did) means adding a new
 * parameter to an upload/destroy call automatically produces a correct
 * signature — the old code required manually rewriting the signature
 * string every time a parameter was added, and would silently produce an
 * invalid signature (401 from Cloudinary) if that step was missed.
 */
function buildSignature(params) {
  const toSign = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto
    .createHash('sha1')
    .update(toSign + config.upload.cloudinary.apiSecret)
    .digest('hex');
}

function assertConfigured() {
  const { cloudName, apiKey, apiSecret } = config.upload.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError(
      'Image upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      500,
    );
  }
}

/** Picks a safe filename/extension for Cloudinary based on the real mimetype, instead of always sending "image.png". */
function filenameForMimeType(mimeType, originalName) {
  const extFromMime = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };
  const ext = extFromMime[mimeType] || path.extname(originalName || '') || '.jpg';
  return `upload${ext}`;
}

/**
 * Uploads a buffer to Cloudinary using a signed request.
 *
 * @param {Buffer} buffer - raw file bytes (from multer memoryStorage)
 * @param {object} options
 * @param {string} [options.folder] - Cloudinary folder to upload into
 * @param {string} [options.mimeType] - real mimetype of the file, used to pick a correct filename/extension
 * @param {string} [options.originalName] - original uploaded filename, used as a fallback for extension
 */
async function uploadBuffer(buffer, { folder = 'brickpro/uploads', mimeType, originalName } = {}) {
  assertConfigured();

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = buildSignature({ folder, timestamp });

  const form = new FormData();
  form.append('file', buffer, { filename: filenameForMimeType(mimeType, originalName) });
  form.append('api_key', config.upload.cloudinary.apiKey);
  form.append('timestamp', timestamp);
  form.append('folder', folder);
  form.append('signature', signature);

  try {
    const response = await axios.post(UPLOAD_URL(), form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: CLOUDINARY_TIMEOUT_MS,
      httpsAgent: keepAliveAgent,
    });

    return response.data; // includes secure_url, public_id, etc.
  } catch (err) {
    logger.error(`Cloudinary upload failed: ${err.response?.data?.error?.message || err.message}`);
    throw new AppError(
      err.response?.data?.error?.message || 'Image upload failed. Please try again.',
      err.response ? 502 : 504, // 502 = Cloudinary responded with an error; 504 = we never got a response (timeout/network)
    );
  }
}

/**
 * Deletes an asset from Cloudinary by its public_id. Used whenever a
 * product image or gallery item is removed, so files don't accumulate
 * as orphaned storage in the Cloudinary account indefinitely.
 *
 * Deliberately does NOT throw on a "not found" response from Cloudinary
 * (result: 'not found') — that just means the asset was already gone,
 * which is a fine outcome for a delete operation, not an error.
 */
async function deleteAsset(publicId) {
  if (!publicId) return { result: 'skipped', reason: 'no publicId provided' };

  assertConfigured();

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = buildSignature({ public_id: publicId, timestamp });

  const form = new FormData();
  form.append('public_id', publicId);
  form.append('api_key', config.upload.cloudinary.apiKey);
  form.append('timestamp', timestamp);
  form.append('signature', signature);

  try {
    const response = await axios.post(DESTROY_URL(), form, {
      headers: form.getHeaders(),
      timeout: CLOUDINARY_TIMEOUT_MS,
      httpsAgent: keepAliveAgent,
    });

    if (response.data?.result && response.data.result !== 'ok' && response.data.result !== 'not found') {
      logger.warn(`Cloudinary destroy for ${publicId} returned unexpected result: ${response.data.result}`);
    }

    return response.data;
  } catch (err) {
    logger.error(`Cloudinary delete failed for ${publicId}: ${err.response?.data?.error?.message || err.message}`);
    throw new AppError(
      err.response?.data?.error?.message || 'Failed to delete image from storage.',
      err.response ? 502 : 504,
    );
  }
}

module.exports = {
  uploadBuffer,
  deleteAsset,
  buildSignature, // exported for unit testing
};
