const categoryService = require('../services/CategoryService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

exports.getCategories = catchAsync(async (req, res) => {
  const categories = await categoryService.listPublic();
  ApiResponse.success(res, { data: { categories } });
});

exports.adminGetCategories = catchAsync(async (req, res) => {
  const categories = await categoryService.listAdmin(req.query);
  ApiResponse.success(res, { data: categories, meta: { total: categories.length } });
});

exports.createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.create(req.body);
  ApiResponse.success(res, { data: { category }, message: 'Category created.', statusCode: 201 });
});

exports.updateCategory = catchAsync(async (req, res) => {
  const category = await categoryService.update(req.params.id, req.body);
  ApiResponse.success(res, { data: { category }, message: 'Category updated.' });
});

exports.deleteCategory = catchAsync(async (req, res) => {
  await categoryService.delete(req.params.id);
  ApiResponse.success(res, { message: 'Category deleted.' });
});
