/**
 * Parse pagination query params and return mongoose-ready options
 */
const paginate = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;

  let sort = {};
  if (query.sortBy) {
    const sortField = query.sortBy.startsWith('-') ? query.sortBy.slice(1) : query.sortBy;
    const sortOrder = query.sortBy.startsWith('-') ? -1 : 1;
    sort[sortField] = sortOrder;
  } else {
    sort = { createdAt: -1 };
  }

  return { page, limit, skip, sort };
};

/**
 * Build text search filter
 */
const buildSearchFilter = (searchTerm, fields) => {
  if (!searchTerm) return {};
  const regex = { $regex: searchTerm, $options: 'i' };
  return { $or: fields.map((f) => ({ [f]: regex })) };
};

module.exports = { paginate, buildSearchFilter };
