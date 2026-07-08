const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findAdminUsers(query) {
    const filter = {};
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.role) filter.role = query.role;
    return this.findMany(filter, query, { });
  }

  async findByEmail(email, options = {}) {
    return this.findOne({ email }, options);
  }
}

module.exports = new UserRepository();
