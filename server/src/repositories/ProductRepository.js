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
    const { search, category, inStock, isFeatured, priceMin, priceMax } = query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (inStock !== undefined) filter.inStock = inStock === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (priceMin !== undefined || priceMax !== undefined) {
      filter['pricing.retail'] = {};
      if (priceMin !== undefined) filter['pricing.retail'].$gte = Number(priceMin);
      if (priceMax !== undefined) filter['pricing.retail'].$lte = Number(priceMax);
    }

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

  /**
   * Atomically decrements stockQuantity by `quantity` when an order is
   * placed. Only applies when the product actually tracks stockQuantity
   * (> 0) — products left at the default 0 (untracked) are skipped
   * entirely, preserving today's boolean-only inStock behavior for them.
   *
   * If stock hits 0 after the decrement, inStock is automatically flipped
   * to false so existing inStock-based filtering/display stays accurate.
   */
  async decrementStock(productId, quantity) {
    const product = await this.model.findById(productId).select('stockQuantity inStock');
    if (!product || !(product.stockQuantity > 0)) return; // untracked — no-op

    const newQty = Math.max(0, product.stockQuantity - quantity);
    const update = { stockQuantity: newQty };
    if (newQty === 0) update.inStock = false;

    await this.model.findByIdAndUpdate(productId, update);
  }

  /**
   * Atomically restores stockQuantity by `quantity` when an order is
   * cancelled. Mirrors decrementStock — only applies to tracked products,
   * and flips inStock back to true if it had been auto-set to false.
   */
  async restoreStock(productId, quantity) {
    const product = await this.model.findById(productId).select('stockQuantity inStock');
    if (!product) return;
    // Only restore for products that were being tracked (had a positive
    // quantity before, or are currently sitting at 0 because we zeroed
    // them out on a previous decrement). If stockQuantity was never
    // tracked at all (default 0 and never touched), there's nothing
    // meaningful to restore to — skip.
    if (product.stockQuantity === 0 && product.inStock) return; // never tracked, already in stock

    const newQty = product.stockQuantity + quantity;
    const update = { stockQuantity: newQty };
    if (newQty > 0) update.inStock = true;

    await this.model.findByIdAndUpdate(productId, update);
  }
}

module.exports = new ProductRepository();
