const productService = require('../services/ProductService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * GET /api/v1/products
 */
exports.getProducts = catchAsync(async (req, res) => {
  const { data, total, page, limit } = await productService.listPublic(req.query);
  ApiResponse.paginated(res, { data, total, page, limit });
});

/**
 * GET /api/v1/products/:slug
 */
exports.getProduct = catchAsync(async (req, res) => {
  const { product, related } = await productService.getBySlug(req.params.slug);
  ApiResponse.success(res, { data: { product, related } });
});

/**
 * POST /api/v1/admin/products
 */
exports.createProduct = catchAsync(async (req, res) => {
  const product = await productService.create(req.body);
  ApiResponse.success(res, { data: { product }, message: 'Product created.', statusCode: 201 });
});

/**
 * PATCH /api/v1/admin/products/:id
 */
exports.updateProduct = catchAsync(async (req, res) => {
  const product = await productService.update(req.params.id, req.body);
  ApiResponse.success(res, { data: { product }, message: 'Product updated.' });
});

/**
 * DELETE /api/v1/admin/products/:id
 */
exports.deleteProduct = catchAsync(async (req, res) => {
  await productService.delete(req.params.id);
  ApiResponse.success(res, { message: 'Product deleted.' });
});

/**
 * Admin: GET all products (including inactive)
 */
exports.adminGetProducts = catchAsync(async (req, res) => {
  const { data, total, page, limit } = await productService.listAdmin(req.query);
  ApiResponse.paginated(res, { data, total, page, limit });
});
