const categoryRepository = require('../repositories/CategoryRepository');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const { createUniqueSlug } = require('../utils/slugify');

class CategoryService {
  async listPublic() {
    return categoryRepository.findPublicCategories();
  }

  async listAdmin(query) {
    return categoryRepository.findAdminCategories(query);
  }

  async create(payload) {
    const slug = await createUniqueSlug(Category, payload.name);
    return categoryRepository.create({ ...payload, slug });
  }

  async update(id, payload) {
    const updates = { ...payload };
    if (updates.name) {
      updates.slug = await createUniqueSlug(Category, updates.name, id);
    }

    const category = await categoryRepository.updateById(id, updates);
    if (!category) throw new AppError('Category not found.', 404);
    return category;
  }

  async delete(id) {
    const category = await categoryRepository.deleteById(id);
    if (!category) throw new AppError('Category not found.', 404);
    return category;
  }
}

module.exports = new CategoryService();
