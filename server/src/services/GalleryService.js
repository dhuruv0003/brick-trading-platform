const galleryRepository = require('../repositories/GalleryRepository');
const AppError = require('../utils/AppError');

class GalleryService {
  async listPublic(query) {
    return galleryRepository.findPublic(query);
  }

  async listAdmin(query) {
    return galleryRepository.findAdminItems(query);
  }

  async create(payload) {
    return galleryRepository.create(payload);
  }

  async update(id, payload) {
    const item = await galleryRepository.updateById(id, payload);
    if (!item) throw new AppError('Gallery item not found.', 404);
    return item;
  }

  async delete(id) {
    const item = await galleryRepository.deleteById(id);
    if (!item) throw new AppError('Gallery item not found.', 404);
    return item;
  }
}

module.exports = new GalleryService();
