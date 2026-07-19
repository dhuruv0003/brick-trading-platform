const AppError = require('../utils/AppError');
const { uploadBuffer, deleteAsset } = require('../config/cloudinary');

class UploadService {
  async handleSingle(file) {
    if (!file) {
      throw new AppError('No file uploaded.', 400);
    }

    const result = await uploadBuffer(file.buffer, {
      folder: 'brickpro/uploads',
      mimeType: file.mimetype,
      originalName: file.originalname,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      // "filename" kept for backward compatibility with any existing
      // callers that read this field, but publicId is the field that
      // must actually be stored if this asset should be deletable later.
      filename: result.public_id,
      size: file.size,
    };
  }

  async handleMultiple(files) {
    if (!files || files.length === 0) {
      throw new AppError('No files uploaded.', 400);
    }

    return Promise.all(
      files.map(async (file) => {
        const result = await uploadBuffer(file.buffer, {
          folder: 'brickpro/uploads',
          mimeType: file.mimetype,
          originalName: file.originalname,
        });

        return {
          url: result.secure_url,
          publicId: result.public_id,
          filename: result.public_id,
          size: file.size,
        };
      }),
    );
  }

  /**
   * Deletes an uploaded asset from Cloudinary by its public_id. Exposed
   * as its own service method (rather than folded into a specific
   * resource's delete) so both the generic upload-management endpoint and
   * resource-specific deletes (Product images, Gallery items) can reuse
   * the exact same cleanup path.
   */
  async deleteByPublicId(publicId) {
    if (!publicId) {
      throw new AppError('publicId is required to delete an image.', 400);
    }
    return deleteAsset(publicId);
  }
}

module.exports = new UploadService();
