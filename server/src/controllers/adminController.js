const testimonialService = require('../services/TestimonialService');
const faqService = require('../services/FaqService');
const galleryService = require('../services/GalleryService');
const projectService = require('../services/ProjectService');
const settingsService = require('../services/SettingsService');
const userService = require('../services/UserService');
const uploadService = require('../services/UploadService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

// ========== TESTIMONIALS ==========
exports.getTestimonials = catchAsync(async (req, res) => {
  const testimonials = await testimonialService.listPublic(req.query);
  ApiResponse.success(res, { data: { testimonials } });
});

exports.adminGetTestimonials = catchAsync(async (req, res) => {
  const { data, total, page, limit } = await testimonialService.listAdmin(req.query);
  ApiResponse.paginated(res, { data, total, page, limit });
});

exports.createTestimonial = catchAsync(async (req, res) => {
  const testimonial = await testimonialService.create(req.body);
  ApiResponse.success(res, { data: { testimonial }, message: 'Testimonial created.', statusCode: 201 });
});

exports.updateTestimonial = catchAsync(async (req, res) => {
  const testimonial = await testimonialService.update(req.params.id, req.body);
  ApiResponse.success(res, { data: { testimonial }, message: 'Testimonial updated.' });
});

exports.deleteTestimonial = catchAsync(async (req, res) => {
  await testimonialService.delete(req.params.id);
  ApiResponse.success(res, { message: 'Testimonial deleted.' });
});

// ========== FAQs ==========
exports.getFAQs = catchAsync(async (req, res) => {
  const { faqs, categories } = await faqService.listPublic(req.query.category);
  ApiResponse.success(res, { data: { faqs, categories } });
});

exports.adminGetFAQs = catchAsync(async (req, res) => {
  const { data, total, page, limit } = await faqService.listAdmin(req.query);
  ApiResponse.paginated(res, { data, total, page, limit });
});

exports.createFAQ = catchAsync(async (req, res) => {
  const faq = await faqService.create(req.body);
  ApiResponse.success(res, { data: { faq }, message: 'FAQ created.', statusCode: 201 });
});

exports.updateFAQ = catchAsync(async (req, res) => {
  const faq = await faqService.update(req.params.id, req.body);
  ApiResponse.success(res, { data: { faq }, message: 'FAQ updated.' });
});

exports.deleteFAQ = catchAsync(async (req, res) => {
  await faqService.delete(req.params.id);
  ApiResponse.success(res, { message: 'FAQ deleted.' });
});

// ========== GALLERY ==========
exports.getGallery = catchAsync(async (req, res) => {
  const items = await galleryService.listPublic(req.query);
  ApiResponse.success(res, { data: { items } });
});

exports.adminGetGallery = catchAsync(async (req, res) => {
  const { data, total, page, limit } = await galleryService.listAdmin(req.query);
  ApiResponse.paginated(res, { data, total, page, limit });
});

exports.createGalleryItem = catchAsync(async (req, res) => {
  const item = await galleryService.create(req.body);
  ApiResponse.success(res, { data: { item }, message: 'Gallery item created.', statusCode: 201 });
});

exports.updateGalleryItem = catchAsync(async (req, res) => {
  const item = await galleryService.update(req.params.id, req.body);
  ApiResponse.success(res, { data: { item }, message: 'Gallery item updated.' });
});

exports.deleteGalleryItem = catchAsync(async (req, res) => {
  await galleryService.delete(req.params.id);
  ApiResponse.success(res, { message: 'Gallery item deleted.' });
});

// ========== PROJECTS ==========
exports.getProjects = catchAsync(async (req, res) => {
  const { data, total, page, limit } = await projectService.listPublished(req.query);
  ApiResponse.paginated(res, { data, total, page, limit });
});

exports.getProject = catchAsync(async (req, res) => {
  const project = await projectService.getBySlug(req.params.slug);
  ApiResponse.success(res, { data: { project } });
});

exports.adminGetProjects = catchAsync(async (req, res) => {
  const { data, total, page, limit } = await projectService.listAdmin(req.query);
  ApiResponse.paginated(res, { data, total, page, limit });
});

exports.createProject = catchAsync(async (req, res) => {
  const project = await projectService.create(req.body);
  ApiResponse.success(res, { data: { project }, message: 'Project created.', statusCode: 201 });
});

exports.updateProject = catchAsync(async (req, res) => {
  const project = await projectService.update(req.params.id, req.body);
  ApiResponse.success(res, { data: { project }, message: 'Project updated.' });
});

exports.deleteProject = catchAsync(async (req, res) => {
  await projectService.delete(req.params.id);
  ApiResponse.success(res, { message: 'Project deleted.' });
});

// ========== SETTINGS ==========
exports.getPublicSettings = catchAsync(async (req, res) => {
  const settings = await settingsService.getPublicAsMap();
  ApiResponse.success(res, { data: { settings } });
});

exports.getAllSettings = catchAsync(async (req, res) => {
  const settings = await settingsService.listAll();
  ApiResponse.success(res, { data: { settings } });
});

exports.upsertSetting = catchAsync(async (req, res) => {
  const setting = await settingsService.upsert(req.body);
  ApiResponse.success(res, { data: { setting }, message: 'Setting saved.' });
});

// ========== USERS ==========
exports.getUsers = catchAsync(async (req, res) => {
  const { data, total, page, limit } = await userService.listAdmin(req.query);
  ApiResponse.paginated(res, { data, total, page, limit });
});

exports.createUser = catchAsync(async (req, res) => {
  const user = await userService.create(req.body);
  ApiResponse.success(res, { data: { user }, message: 'User created.', statusCode: 201 });
});

exports.updateUser = catchAsync(async (req, res) => {
  const user = await userService.update(req.params.id, req.body);
  ApiResponse.success(res, { data: { user }, message: 'User updated.' });
});

exports.deleteUser = catchAsync(async (req, res) => {
  await userService.delete(req.params.id, req.user._id);
  ApiResponse.success(res, { message: 'User deleted.' });
});

// ========== FILE UPLOAD ==========
exports.uploadFile = catchAsync(async (req, res) => {
  const file = await uploadService.handleSingle(req.file);
  ApiResponse.success(res, { data: file, message: 'File uploaded successfully.' });
});

exports.uploadMultipleFiles = catchAsync(async (req, res) => {
  const files = await uploadService.handleMultiple(req.files);
  ApiResponse.success(res, { data: { files }, message: `${files.length} file(s) uploaded.` });
});

/**
 * Deletes an image from Cloudinary storage by its public_id. Intended for
 * ad-hoc cleanup from the admin UI (e.g. removing a single image from a
 * product's image list, or a gallery item's image, before the containing
 * record itself is saved/deleted).
 */
exports.deleteFile = catchAsync(async (req, res) => {
  const { publicId } = req.body;
  await uploadService.deleteByPublicId(publicId);
  ApiResponse.success(res, { message: 'Image deleted successfully.' });
});
