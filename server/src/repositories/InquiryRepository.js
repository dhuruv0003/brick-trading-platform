const BaseRepository = require('./BaseRepository');
const Inquiry = require('../models/Inquiry');

class InquiryRepository extends BaseRepository {
  constructor() {
    super(Inquiry);
  }

  async findAdminInquiries(query) {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.customerType) filter.customerType = query.customerType;
    if (query.assignedTo) filter.assignedTo = query.assignedTo;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    return this.findMany(filter, query, {
      populate: [{ path: 'assignedTo', select: 'name email' }, { path: 'product', select: 'name' }],
    });
  }

  async appendStatusUpdate(id, { status, priority, assignedTo, note, followUpDate }, userId) {
    const inquiry = await this.model.findById(id);
    if (!inquiry) return null;

    if (status) inquiry.status = status;
    if (priority) inquiry.priority = priority;
    if (assignedTo) inquiry.assignedTo = assignedTo;
    if (followUpDate) inquiry.followUpDate = followUpDate;
    if (note) inquiry.notes.push({ text: note, addedBy: userId });

    await inquiry.save();
    await inquiry.populate('assignedTo', 'name email');
    return inquiry;
  }
}

module.exports = new InquiryRepository();
