const BaseRepository = require('./BaseRepository');
const Customer = require('../models/Customer');

class CustomerRepository extends BaseRepository {
  constructor() {
    super(Customer);
  }

  /**
   * Find a customer by email.
   * @param {string} email
   * @param {{ select?: string }} [options]
   */
  async findByEmail(email, options = {}) {
    return this.findOne({ email }, options);
  }

  /**
   * Find a customer by Google OAuth ID.
   * @param {string} googleId
   */
  async findByGoogleId(googleId) {
    return this.findOne({ googleId }, { select: '+googleId' });
  }

  /**
   * Find customers with pagination and search (for admin use).
   * @param {object} query - req.query
   */
  async findCustomers(query) {
    const filter = {};
    if (query.search) {
      filter.$or = [
        { firstName: { $regex: query.search, $options: 'i' } },
        { lastName: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
        { companyName: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    return this.findMany(filter, query);
  }
}

module.exports = new CustomerRepository();
