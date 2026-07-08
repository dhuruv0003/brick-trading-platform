const BaseRepository = require('./BaseRepository');
const Product = require('../models/Product');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  /**
   * Public catalog listing — active products only, with category populated.
   */
  async findPublicProducts(query) {
    const { search, category, inStock, isFeatured } = query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (inStock !== undefined) filter.inStock = inStock === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

    return this.findMany(filter, query, {
      populate: { path: 'category', select: 'name slug' },
      select: '-__v',
      searchTerm: search,
      searchFields: ['name', 'description', 'tags'],
    });
  }

  /**
   * Admin listing — all products regardless of active state.
   */
  async findAdminProducts(query) {
    const { search, category, isActive } = query;
    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    return this.findMany(filter, query, {
      populate: { path: 'category', select: 'name' },
      searchTerm: search,
      searchFields: ['name'],
    });
  }

  /**
   * Single active product by slug, with category populated.
   */
  async findBySlug(slug) {
    return this.findOne({ slug, isActive: true }, { populate: { path: 'category', select: 'name slug' } });
  }

  /**
   * Related products in the same category (excludes the product itself).
   */
  async findRelated(categoryId, excludeId, limit = 4) {
    return this.findAll(
      { category: categoryId, _id: { $ne: excludeId }, isActive: true },
      { select: 'name slug images pricing shortDescription', limit }
    );
  }
}

module.exports = new ProductRepository();
