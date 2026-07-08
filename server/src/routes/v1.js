const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const blogController = require('../controllers/blogController');
const adminController = require('../controllers/adminController');
const aiController = require('../controllers/aiController');
const inquiryController = require('../controllers/inquiryController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');
const { upload } = require('../middleware/upload');
const { publicLimiter, formLimiter, aiLimiter } = require('../middleware/rateLimiter');

// ─── Public routes ───────────────────────────────────────────────────────────
router.get('/products', publicLimiter, productController.getProducts);
router.get('/products/:slug', publicLimiter, productController.getProduct);

router.get('/categories', publicLimiter, categoryController.getCategories);

router.get('/blog', publicLimiter, blogController.getBlogs);
router.get('/blog/categories', publicLimiter, blogController.getBlogCategories);
router.get('/blog/:slug', publicLimiter, blogController.getBlog);

router.get('/projects', publicLimiter, adminController.getProjects);
router.get('/projects/:slug', publicLimiter, adminController.getProject);

router.get('/testimonials', publicLimiter, adminController.getTestimonials);
router.get('/gallery', publicLimiter, adminController.getGallery);
router.get('/faqs', publicLimiter, adminController.getFAQs);
router.get('/settings/public', publicLimiter, adminController.getPublicSettings);

router.post('/inquiries', formLimiter, inquiryController.submitInquiry);
router.post('/quotes', formLimiter, inquiryController.submitQuote);

// AI — Public
router.post('/ai/chat', aiLimiter, aiController.chat);
router.post('/ai/recommend', aiLimiter, aiController.recommend);

// ─── Protected Admin routes ──────────────────────────────────────────────────
router.use('/admin', protect);

// Dashboard
router.get('/admin/dashboard/stats', restrictTo('super_admin', 'admin', 'manager'), inquiryController.getDashboardStats);

// Products
router.get('/admin/products', restrictTo('super_admin', 'admin', 'manager', 'staff'), productController.adminGetProducts);
router.post('/admin/products', restrictTo('super_admin', 'admin', 'manager'), productController.createProduct);
router.patch('/admin/products/:id', restrictTo('super_admin', 'admin', 'manager'), productController.updateProduct);
router.delete('/admin/products/:id', restrictTo('super_admin', 'admin'), productController.deleteProduct);

// Categories
router.get('/admin/categories', restrictTo('super_admin', 'admin', 'manager', 'staff'), categoryController.adminGetCategories);
router.post('/admin/categories', restrictTo('super_admin', 'admin'), categoryController.createCategory);
router.patch('/admin/categories/:id', restrictTo('super_admin', 'admin'), categoryController.updateCategory);
router.delete('/admin/categories/:id', restrictTo('super_admin', 'admin'), categoryController.deleteCategory);

// Blog
router.get('/admin/blog', restrictTo('super_admin', 'admin', 'manager', 'staff'), blogController.adminGetBlogs);
router.get('/admin/blog/:id', restrictTo('super_admin', 'admin', 'manager', 'staff'), blogController.adminGetBlog);
router.post('/admin/blog', restrictTo('super_admin', 'admin', 'manager'), blogController.createBlog);
router.patch('/admin/blog/:id', restrictTo('super_admin', 'admin', 'manager'), blogController.updateBlog);
router.delete('/admin/blog/:id', restrictTo('super_admin', 'admin'), blogController.deleteBlog);

// Leads / Inquiries
router.get('/admin/leads', restrictTo('super_admin', 'admin', 'manager', 'staff'), inquiryController.getInquiries);
router.patch('/admin/leads/:id/status', restrictTo('super_admin', 'admin', 'manager', 'staff'), inquiryController.updateInquiryStatus);

// Quotes
router.get('/admin/quotes', restrictTo('super_admin', 'admin', 'manager', 'staff'), inquiryController.getQuotes);
router.patch('/admin/quotes/:id', restrictTo('super_admin', 'admin', 'manager'), inquiryController.updateQuote);

// Gallery
router.get('/admin/gallery', restrictTo('super_admin', 'admin', 'manager', 'staff'), adminController.adminGetGallery);
router.post('/admin/gallery', restrictTo('super_admin', 'admin', 'manager'), adminController.createGalleryItem);
router.patch('/admin/gallery/:id', restrictTo('super_admin', 'admin', 'manager'), adminController.updateGalleryItem);
router.delete('/admin/gallery/:id', restrictTo('super_admin', 'admin'), adminController.deleteGalleryItem);

// Testimonials
router.get('/admin/testimonials', restrictTo('super_admin', 'admin', 'manager', 'staff'), adminController.adminGetTestimonials);
router.post('/admin/testimonials', restrictTo('super_admin', 'admin'), adminController.createTestimonial);
router.patch('/admin/testimonials/:id', restrictTo('super_admin', 'admin'), adminController.updateTestimonial);
router.delete('/admin/testimonials/:id', restrictTo('super_admin', 'admin'), adminController.deleteTestimonial);

// FAQs
router.get('/admin/faqs', restrictTo('super_admin', 'admin', 'manager', 'staff'), adminController.adminGetFAQs);
router.post('/admin/faqs', restrictTo('super_admin', 'admin', 'manager'), adminController.createFAQ);
router.patch('/admin/faqs/:id', restrictTo('super_admin', 'admin', 'manager'), adminController.updateFAQ);
router.delete('/admin/faqs/:id', restrictTo('super_admin', 'admin'), adminController.deleteFAQ);

// Projects
router.get('/admin/projects', restrictTo('super_admin', 'admin', 'manager', 'staff'), adminController.adminGetProjects);
router.post('/admin/projects', restrictTo('super_admin', 'admin', 'manager'), adminController.createProject);
router.patch('/admin/projects/:id', restrictTo('super_admin', 'admin', 'manager'), adminController.updateProject);
router.delete('/admin/projects/:id', restrictTo('super_admin', 'admin'), adminController.deleteProject);

// Settings
router.get('/admin/settings', restrictTo('super_admin', 'admin'), adminController.getAllSettings);
router.post('/admin/settings', restrictTo('super_admin', 'admin'), adminController.upsertSetting);

// Users
router.get('/admin/users', restrictTo('super_admin', 'admin'), adminController.getUsers);
router.post('/admin/users', restrictTo('super_admin'), adminController.createUser);
router.patch('/admin/users/:id', restrictTo('super_admin', 'admin'), adminController.updateUser);
router.delete('/admin/users/:id', restrictTo('super_admin'), adminController.deleteUser);

// File Upload
router.post('/admin/upload', restrictTo('super_admin', 'admin', 'manager', 'staff'), upload.single('file'), adminController.uploadFile);
router.post('/admin/upload/multiple', restrictTo('super_admin', 'admin', 'manager', 'staff'), upload.array('files', 10), adminController.uploadMultipleFiles);

// AI Admin tools
router.post('/admin/ai/generate-blog', restrictTo('super_admin', 'admin', 'manager'), aiLimiter, aiController.generateBlog);
router.post('/admin/ai/reply-suggestion', restrictTo('super_admin', 'admin', 'manager', 'staff'), aiLimiter, aiController.replySuggestion);
router.get('/admin/ai/insights', restrictTo('super_admin', 'admin', 'manager'), aiController.dashboardInsights);

module.exports = router;
