const BaseRepository = require('./BaseRepository');
const Category = require('../models/Category');

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  /** Public: active categories with their subcategory tree populated. */
  async findPublicCategories() {
    return this.findAll({ isActive: true }, { sort: { sortOrder: 1, name: 1 }, populate: 'children' });
  }

  /** Admin: all categories (active + inactive), with parent name for display. */
  async findAdminCategories(query) {
    const filter = {};
    if (query.search) filter.name = { $regex: query.search, $options: 'i' };
    return this.findAll(filter, { sort: { sortOrder: 1, name: 1 }, populate: { path: 'parent', select: 'name' } });
  }
}

module.exports = new CategoryRepository();
