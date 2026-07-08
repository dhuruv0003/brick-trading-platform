const BaseRepository = require('./BaseRepository');
const Testimonial = require('../models/Testimonial');

class TestimonialRepository extends BaseRepository {
  constructor() {
    super(Testimonial);
  }

  async findPublic(query) {
    const filter = { isApproved: true };
    if (query.featured) filter.isFeatured = true;
    return this.findAll(filter, {
      sort: { isFeatured: -1, sortOrder: 1, rating: -1 },
      limit: parseInt(query.limit) || 20,
    });
  }

  async findAdminTestimonials(query) {
    const filter = {};
    if (query.search) filter.name = { $regex: query.search, $options: 'i' };
    return this.findMany(filter, query, { });
  }
}

module.exports = new TestimonialRepository();
