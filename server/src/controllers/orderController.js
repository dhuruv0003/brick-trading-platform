const orderService = require('../services/OrderService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * ─── Customer Endpoints ───────────────────────────────────────────────────
 */

/**
 * POST /api/v1/customer/orders
 */
exports.createOrder = catchAsync(async (req, res) => {
  const { items, shippingAddress, billingAddress, paymentMethod, notes } = req.body;
  const order = await orderService.createOrder(req.customer._id, {
    items,
    shippingAddress,
    billingAddress,
    paymentMethod,
    notes,
  });
  ApiResponse.success(res, { data: { order }, statusCode: 201, message: 'Order placed successfully.' });
});

/**
 * GET /api/v1/customer/orders
 */
exports.getMyOrders = catchAsync(async (req, res) => {
  const { data, total, page, limit } = await orderService.getCustomerOrders(req.customer._id, req.query);
  ApiResponse.paginated(res, { data, total, page, limit });
});

/**
 * GET /api/v1/customer/orders/:id
 */
exports.getMyOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.customer._id, req.params.id);
  ApiResponse.success(res, { data: { order } });
});

/**
 * PATCH /api/v1/customer/orders/:id/cancel
 */
exports.cancelOrder = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const order = await orderService.cancelOrder(req.customer._id, req.params.id, reason);
  ApiResponse.success(res, { data: { order }, message: 'Order cancelled successfully.' });
});


/**
 * ─── Admin Endpoints ──────────────────────────────────────────────────────
 */

/**
 * GET /api/v1/admin/orders
 */
exports.adminGetOrders = catchAsync(async (req, res) => {
  const { data, total, page, limit } = await orderService.adminGetOrders(req.query);
  ApiResponse.paginated(res, { data, total, page, limit });
});

/**
 * GET /api/v1/admin/orders/:id
 */
exports.adminGetOrder = catchAsync(async (req, res) => {
  const order = await orderService.adminGetOrderById(req.params.id);
  ApiResponse.success(res, { data: { order } });
});

/**
 * PATCH /api/v1/admin/orders/:id
 */
exports.adminUpdateOrder = catchAsync(async (req, res) => {
  const { status, paymentStatus, adminNotes, trackingNumber, deliveredAt } = req.body;
  const order = await orderService.adminUpdateOrder(req.params.id, {
    status,
    paymentStatus,
    adminNotes,
    trackingNumber,
    deliveredAt,
  });
  ApiResponse.success(res, { data: { order }, message: 'Order updated successfully.' });
});
