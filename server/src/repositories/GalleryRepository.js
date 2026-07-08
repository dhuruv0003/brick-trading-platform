const BaseRepository = require('./BaseRepository');
const Gallery = require('../models/Gallery');

class GalleryRepository extends BaseRepository {
  constructor() {
    super(Gallery);
  }

  async findPublic(query) {
    const filter = { isActive: true };
    if (query.category) filter.category = query.category;
    return this.findAll(filter, { sort: { sortOrder: 1, createdAt: -1 }, limit: parseInt(query.limit) || 50 });
  }

  async findAdminItems(query) {
    const filter = {};
    if (query.category) filter.category = query.category;
    if (query.search) filter.title = { $regex: query.search, $options: 'i' };
    return this.findMany(filter, query, { });
  }
}

module.exports = new GalleryRepository();
