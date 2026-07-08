const BaseRepository = require('./BaseRepository');
const FAQ = require('../models/FAQ');

class FAQRepository extends BaseRepository {
  constructor() {
    super(FAQ);
  }

  async findPublished(category) {
    const filter = { isPublished: true };
    if (category) filter.category = category;
    return this.findAll(filter, { sort: { category: 1, sortOrder: 1 } });
  }

  async findAdminFAQs(query) {
    const filter = {};
    if (query.search) filter.question = { $regex: query.search, $options: 'i' };
    return this.findMany(filter, query, { sort: { category: 1, sortOrder: 1 } });
  }
}

module.exports = new FAQRepository();
