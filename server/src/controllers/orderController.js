const orderService = require('../services/OrderService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

// ---------- Customer-facing ----------

/**
 * POST /api/v1/customer/orders
 */
exports.placeOrder = catchAsync(async (req, res) => {
  const order = await orderService.placeOrder(req.user, req.body, req.ip);
  ApiResponse.success(res, {
    data: { order },
    message: `Order #${order.orderNumber} placed successfully!`,
    statusCode: 201,
  });
});

/**
 * GET /api/v1/customer/orders
 */
exports.getMyOrders = catchAsync(async (req, res) => {
  const { data, total, page, limit } = await orderService.getCustomerOrders(req.user._id, req.query);
  ApiResponse.paginated(res, { data, total, page, limit });
});

/**
 * GET /api/v1/customer/orders/:id
 */
exports.getMyOrder = catchAsync(async (req, res) => {
  const order = await orderService.getCustomerOrder(req.params.id, req.user._id);
  ApiResponse.success(res, { data: { order } });
});

/**
 * GET /api/v1/customer/dashboard
 */
exports.getMyDashboard = catchAsync(async (req, res) => {
  const dashboard = await orderService.getCustomerDashboard(req.user._id);
  ApiResponse.success(res, { data: dashboard });
});

/**
 * GET /api/v1/customer/invoices
 */
exports.getMyInvoices = catchAsync(async (req, res) => {
  const { data, total, page, limit } = await orderService.getCustomerInvoices(req.user._id, req.query);
  ApiResponse.paginated(res, { data, total, page, limit });
});

// ---------- Admin-facing ----------

/**
 * Admin: GET all orders
 */
exports.getOrders = catchAsync(async (req, res) => {
  const { data, total, page, limit } = await orderService.listAdminOrders(req.query);
  ApiResponse.paginated(res, { data, total, page, limit });
});

/**
 * PATCH /api/v1/admin/orders/:id/status
 */
exports.updateOrderStatus = catchAsync(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body, req.user._id);
  ApiResponse.success(res, { data: { order }, message: 'Order status updated.' });
});