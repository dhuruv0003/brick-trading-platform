const blogRepository = require('../repositories/BlogRepository');
const Blog = require('../models/Blog');
const AppError = require('../utils/AppError');
const { createUniqueSlug } = require('../utils/slugify');

class BlogService {
  async listPublished(query) {
    return blogRepository.findPublished(query);
  }

  async getBySlug(slug) {
    const post = await blogRepository.findBySlugAndIncrementViews(slug);
    if (!post) throw new AppError('Blog post not found.', 404);

    const related = await blogRepository.findRelated(post);
    return { post, related };
  }

  async create(payload, authorId) {
    const slug = await createUniqueSlug(Blog, payload.title);
    return blogRepository.create({ ...payload, slug, author: authorId });
  }

  async update(id, payload) {
    const updates = { ...payload };
    if (updates.title) {
      updates.slug = await createUniqueSlug(Blog, updates.title, id);
    }

    const post = await blogRepository.updateById(id, updates);
    if (!post) throw new AppError('Blog post not found.', 404);
    return post;
  }

  async delete(id) {
    const post = await blogRepository.deleteById(id);
    if (!post) throw new AppError('Blog post not found.', 404);
    return post;
  }

  async getAdminById(id) {
    const post = await blogRepository.findById(id, { populate: { path: 'author', select: 'name' } });
    if (!post) throw new AppError('Blog post not found.', 404);
    return post;
  }

  async listAdmin(query) {
    return blogRepository.findAdminPosts(query);
  }

  async listCategories() {
    return blogRepository.getDistinctCategories();
  }
}

module.exports = new BlogService();
