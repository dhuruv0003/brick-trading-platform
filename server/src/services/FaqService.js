const faqRepository = require('../repositories/FAQRepository');
const AppError = require('../utils/AppError');

class FaqService {
  async listPublic(category) {
    const faqs = await faqRepository.findPublished(category);
    const categories = [...new Set(faqs.map((f) => f.category))];
    return { faqs, categories };
  }

  async listAdmin(query) {
    return faqRepository.findAdminFAQs(query);
  }

  async create(payload) {
    return faqRepository.create(payload);
  }

  async update(id, payload) {
    const faq = await faqRepository.updateById(id, payload);
    if (!faq) throw new AppError('FAQ not found.', 404);
    return faq;
  }

  async delete(id) {
    const faq = await faqRepository.deleteById(id);
    if (!faq) throw new AppError('FAQ not found.', 404);
    return faq;
  }
}

module.exports = new FaqService();
