const AppError = require('../utils/AppError');

class UploadService {
  handleSingle(file) {
    if (!file) throw new AppError('No file uploaded.', 400);
    return { url: `/uploads/${file.filename}`, filename: file.filename, size: file.size };
  }

  handleMultiple(files) {
    if (!files || files.length === 0) throw new AppError('No files uploaded.', 400);
    return files.map((f) => ({
      url: `/uploads/${f.filename}`,
      filename: f.filename,
      size: f.size,
    }));
  }
}

module.exports = new UploadService();
