const testimonialRepository = require('../repositories/TestimonialRepository');
const AppError = require('../utils/AppError');

class TestimonialService {
  async listPublic(query) {
    return testimonialRepository.findPublic(query);
  }

  async listAdmin(query) {
    return testimonialRepository.findAdminTestimonials(query);
  }

  async create(payload) {
    return testimonialRepository.create(payload);
  }

  async update(id, payload) {
    const testimonial = await testimonialRepository.updateById(id, payload);
    if (!testimonial) throw new AppError('Testimonial not found.', 404);
    return testimonial;
  }

  async delete(id) {
    const testimonial = await testimonialRepository.deleteById(id);
    if (!testimonial) throw new AppError('Testimonial not found.', 404);
    return testimonial;
  }
}

module.exports = new TestimonialService();
