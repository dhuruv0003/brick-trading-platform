const BaseRepository = require('./BaseRepository');
const Quote = require('../models/Quote');

class QuoteRepository extends BaseRepository {
  constructor() {
    super(Quote);
  }

  async findAdminQuotes(query) {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { quoteNumber: { $regex: query.search, $options: 'i' } },
        { name: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
      ];
    }
    return this.findMany(filter, query, { populate: { path: 'items.product', select: 'name' } });
  }
}

module.exports = new QuoteRepository();
