const BaseRepository = require('./BaseRepository');
const Blog = require('../models/Blog');

class BlogRepository extends BaseRepository {
  constructor() {
    super(Blog);
  }

  async findPublished(query) {
    const { search, category, tag } = query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (tag) filter.tags = tag;

    return this.findMany(filter, query, {
      populate: { path: 'author', select: 'name avatar' },
      select: '-content',
      searchTerm: search,
      searchFields: ['title', 'excerpt', 'tags'],
    });
  }

  async findBySlugAndIncrementViews(slug) {
    return this.model
      .findOneAndUpdate({ slug, isPublished: true }, { $inc: { views: 1 } }, { new: true })
      .populate('author', 'name avatar');
  }

  async findRelated(post, limit = 3) {
    return this.findAll(
      {
        _id: { $ne: post._id },
        isPublished: true,
        $or: [{ category: post.category }, { tags: { $in: post.tags } }],
      },
      { select: 'title slug excerpt coverImage publishedAt readTime', limit }
    );
  }

  async findAdminPosts(query) {
    const filter = {};
    if (query.isPublished !== undefined) filter.isPublished = query.isPublished === 'true';
    if (query.search) filter.title = { $regex: query.search, $options: 'i' };

    return this.findMany(filter, query, {
      populate: { path: 'author', select: 'name' },
      select: '-content',
    });
  }

  async getDistinctCategories() {
    return this.model.distinct('category', { isPublished: true });
  }
}

module.exports = new BlogRepository();
