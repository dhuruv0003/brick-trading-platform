const BaseRepository = require('./BaseRepository');
const Order = require('../models/Order');

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  /**
   * Find orders for a specific customer with pagination.
   * @param {string} customerId
   * @param {object} query - req.query
   */
  async findByCustomer(customerId, query = {}) {
    const filter = { customer: customerId };
    if (query.status) filter.status = query.status;
    return this.findMany(filter, query, {
      populate: { path: 'items.product', select: 'name slug images' },
      sort: { createdAt: -1 },
    });
  }

  /**
   * Find a single order by order number.
   * @param {string} orderNumber
   */
  async findByOrderNumber(orderNumber) {
    return this.findOne({ orderNumber }, {
      populate: [
        { path: 'customer', select: 'firstName lastName email phone' },
        { path: 'items.product', select: 'name slug images pricing' },
      ],
    });
  }

  /**
   * Find all orders for admin with pagination, search, and status filter.
   * @param {object} query - req.query
   */
  async findAdminOrders(query = {}) {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
    if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
    if (query.search) {
      filter.$or = [
        { orderNumber: { $regex: query.search, $options: 'i' } },
      ];
    }
    return this.findMany(filter, query, {
      populate: { path: 'customer', select: 'firstName lastName email phone' },
      sort: { createdAt: -1 },
    });
  }

  /**
   * Generate a unique sequential order number like BRK-202407-00001.
   */
  async generateOrderNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `BRK-${year}${month}-`;

    // Count existing orders this month and increment
    const startOfMonth = new Date(year, now.getMonth(), 1);
    const count = await this.count({ createdAt: { $gte: startOfMonth } });
    const sequence = String(count + 1).padStart(5, '0');

    return `${prefix}${sequence}`;
  }
}

module.exports = new OrderRepository();
