const { paginate, buildSearchFilter } = require('../utils/paginate');

/**
 * BaseRepository
 * ----------------
 * Encapsulates common Mongoose data-access patterns (CRUD, pagination,
 * filtering, text search) so controllers stay thin and business-logic-free.
 *
 * Extend this class per-model and override/add methods for anything
 * model-specific (e.g. slug generation, related-record lookups).
 *
 * Usage:
 *   class ProductRepository extends BaseRepository {
 *     constructor() { super(Product); }
 *   }
 */
class BaseRepository {
  /**
   * @param {import('mongoose').Model} model
   */
  constructor(model) {
    if (!model) throw new Error('BaseRepository requires a Mongoose model.');
    this.model = model;
  }

  /**
   * Find a single document by its Mongo _id.
   * @param {string} id
   * @param {{ populate?: string|string[], select?: string }} [options]
   */
  async findById(id, options = {}) {
    let query = this.model.findById(id);
    if (options.populate) query = query.populate(options.populate);
    if (options.select) query = query.select(options.select);
    return query.exec();
  }

  /**
   * Find a single document matching an arbitrary filter.
   * @param {object} filter
   * @param {{ populate?: string|string[], select?: string }} [options]
   */
  async findOne(filter, options = {}) {
    let query = this.model.findOne(filter);
    if (options.populate) query = query.populate(options.populate);
    if (options.select) query = query.select(options.select);
    return query.exec();
  }

  /**
   * Find many documents with pagination, sorting, search and population support.
   * @param {object} filter - base Mongo filter (already resolved by caller)
   * @param {object} query - raw req.query (used to derive page/limit/sort)
   * @param {{ populate?: string|string[], select?: string, searchFields?: string[], searchTerm?: string }} [options]
   * @returns {Promise<{ data: any[], total: number, page: number, limit: number }>}
   */
  async findMany(filter = {}, query = {}, options = {}) {
    const { page, limit, skip, sort: derivedSort } = paginate(query);
    const sort = options.sort || derivedSort;

    const finalFilter = { ...filter };
    if (options.searchTerm && options.searchFields?.length) {
      Object.assign(finalFilter, buildSearchFilter(options.searchTerm, options.searchFields));
    }

    let dataQuery = this.model.find(finalFilter).sort(sort).skip(skip).limit(limit);
    if (options.populate) dataQuery = dataQuery.populate(options.populate);
    if (options.select) dataQuery = dataQuery.select(options.select);

    const [data, total] = await Promise.all([
      dataQuery.exec(),
      this.model.countDocuments(finalFilter),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Find all documents matching a filter with no pagination (use sparingly).
   */
  async findAll(filter = {}, options = {}) {
    let query = this.model.find(filter);
    if (options.sort) query = query.sort(options.sort);
    if (options.populate) query = query.populate(options.populate);
    if (options.select) query = query.select(options.select);
    if (options.limit) query = query.limit(options.limit);
    return query.exec();
  }

  async create(payload) {
    return this.model.create(payload);
  }

  async updateById(id, payload, options = { new: true, runValidators: true }) {
    return this.model.findByIdAndUpdate(id, payload, options).exec();
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id).exec();
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  async exists(filter = {}) {
    return this.model.exists(filter);
  }
}

module.exports = BaseRepository;
