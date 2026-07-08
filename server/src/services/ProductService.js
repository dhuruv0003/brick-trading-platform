const productRepository = require('../repositories/ProductRepository');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { createUniqueSlug } = require('../utils/slugify');

class ProductService {
  async listPublic(query) {
    return productRepository.findPublicProducts(query);
  }

  async listAdmin(query) {
    return productRepository.findAdminProducts(query);
  }

  async getBySlug(slug) {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw new AppError('Product not found.', 404);

    const related = await productRepository.findRelated(product.category._id, product._id);
    return { product, related };
  }

  async create(payload) {
    const slug = await createUniqueSlug(Product, payload.name);
    return productRepository.create({ ...payload, slug });
  }

  async update(id, payload) {
    const updates = { ...payload };
    if (updates.name) {
      updates.slug = await createUniqueSlug(Product, updates.name, id);
    }

    const product = await productRepository.updateById(id, updates);
    if (!product) throw new AppError('Product not found.', 404);
    return product;
  }

  async delete(id) {
    const product = await productRepository.deleteById(id);
    if (!product) throw new AppError('Product not found.', 404);
    return product;
  }
}

module.exports = new ProductService();
