const BaseRepository = require('./BaseRepository');
const Order = require('../models/Order');

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  /**
   * Orders belonging to a single customer, with search/status/date filters —
   * used by the customer-facing Order History page.
   */
  async findCustomerOrders(customerId, query) {
    const filter = { customer: customerId };
    this._applyStatusAndDateFilters(filter, query);

    if (query.search) {
      filter.$or = [
        { orderNumber: { $regex: query.search, $options: 'i' } },
        { 'items.productName': { $regex: query.search, $options: 'i' } },
      ];
    }

    return this.findMany(filter, query, { populate: { path: 'items.product', select: 'name images' } });
  }

  async findByIdForCustomer(orderId, customerId) {
    return this.model.findOne({ _id: orderId, customer: customerId }).populate('items.product', 'name images');
  }

  /** Admin-facing list — all customers, same filters, plus customer name/phone search. */
  async findAdminOrders(query) {
    const filter = {};
    this._applyStatusAndDateFilters(filter, query);

    if (query.search) {
      filter.$or = [
        { orderNumber: { $regex: query.search, $options: 'i' } },
        { customerName: { $regex: query.search, $options: 'i' } },
        { customerPhone: { $regex: query.search, $options: 'i' } },
      ];
    }

    return this.findMany(filter, query, { populate: { path: 'customer', select: 'name email phone' } });
  }

  /** Appends a status change + history entry — mirrors InquiryRepository.appendStatusUpdate. */
  async appendStatusUpdate(id, { status, note }, userId) {
    const order = await this.model.findById(id);
    if (!order) return null;

    if (status) {
      order.status = status;
      order.statusHistory.push({ status, note, changedBy: userId || null });
    }

    await order.save();
    await order.populate('items.product', 'name images');
    return order;
  }

  _applyStatusAndDateFilters(filter, query) {
    if (query.status) filter.status = query.status;
    if (query.dateFrom || query.dateTo) {
      filter.createdAt = {};
      if (query.dateFrom) filter.createdAt.$gte = new Date(query.dateFrom);
      if (query.dateTo) {
        // Include the entire end date, not just its midnight instant.
        const end = new Date(query.dateTo);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
  }

  /** Counts grouped by status for a single customer — powers the dashboard cards. */
  async countByStatusForCustomer(customerId) {
    const rows = await this.model.aggregate([
      { $match: { customer: customerId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const counts = rows.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {});
    const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
    return { total, counts };
  }
}

module.exports = new OrderRepository();