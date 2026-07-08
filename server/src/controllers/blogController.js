const blogService = require('../services/BlogService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

exports.getBlogs = catchAsync(async (req, res) => {
  const { data, total, page, limit } = await blogService.listPublished(req.query);
  ApiResponse.paginated(res, { data, total, page, limit });
});

exports.getBlog = catchAsync(async (req, res) => {
  const { post, related } = await blogService.getBySlug(req.params.slug);
  ApiResponse.success(res, { data: { post, related } });
});

exports.createBlog = catchAsync(async (req, res) => {
  const post = await blogService.create(req.body, req.user._id);
  ApiResponse.success(res, { data: { post }, message: 'Blog post created.', statusCode: 201 });
});

exports.updateBlog = catchAsync(async (req, res) => {
  const post = await blogService.update(req.params.id, req.body);
  ApiResponse.success(res, { data: { post }, message: 'Blog post updated.' });
});

exports.deleteBlog = catchAsync(async (req, res) => {
  await blogService.delete(req.params.id);
  ApiResponse.success(res, { message: 'Blog post deleted.' });
});

exports.adminGetBlog = catchAsync(async (req, res) => {
  const post = await blogService.getAdminById(req.params.id);
  ApiResponse.success(res, { data: { post } });
});

exports.adminGetBlogs = catchAsync(async (req, res) => {
  const { data, total, page, limit } = await blogService.listAdmin(req.query);
  ApiResponse.paginated(res, { data, total, page, limit });
});

exports.getBlogCategories = catchAsync(async (req, res) => {
  const categories = await blogService.listCategories();
  ApiResponse.success(res, { data: { categories } });
});
