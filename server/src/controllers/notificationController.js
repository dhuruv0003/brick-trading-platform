const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');

/**
 * GET /api/v1/customer/notifications
 * List all notifications for the logged-in customer (latest first, max 50).
 */
exports.getNotifications = catchAsync(async (req, res) => {
  const notifications = await Notification.find({ customer: req.customer._id })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    customer: req.customer._id,
    isRead: false,
  });

  ApiResponse.success(res, { data: { notifications, unreadCount } });
});

/**
 * PATCH /api/v1/customer/notifications/:id/read
 * Mark a single notification as read.
 */
exports.markRead = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, customer: req.customer._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new AppError('Notification not found.', 404);
  ApiResponse.success(res, { data: { notification } });
});

/**
 * PATCH /api/v1/customer/notifications/read-all
 * Mark all notifications as read.
 */
exports.markAllRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    { customer: req.customer._id, isRead: false },
    { isRead: true }
  );
  ApiResponse.success(res, { message: 'All notifications marked as read.' });
});

/**
 * DELETE /api/v1/customer/notifications/:id
 * Delete a single notification.
 */
exports.deleteNotification = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    customer: req.customer._id,
  });
  if (!notification) throw new AppError('Notification not found.', 404);
  ApiResponse.success(res, { message: 'Notification deleted.' });
});

// ─── Admin-facing notifications ────────────────────────────────────────────
// Same shape/behavior as the customer endpoints above, scoped by
// `forAdmin: true` instead of a specific customer — visible to any
// authenticated admin/manager/staff user (not per-recipient).

/**
 * GET /api/v1/admin/notifications
 * List all admin notifications (latest first, max 50) + unread count.
 */
exports.getAdminNotifications = catchAsync(async (req, res) => {
  const notifications = await Notification.find({ forAdmin: true })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({ forAdmin: true, isRead: false });

  ApiResponse.success(res, { data: { notifications, unreadCount } });
});

/**
 * PATCH /api/v1/admin/notifications/:id/read
 * Mark a single admin notification as read.
 */
exports.markAdminRead = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, forAdmin: true },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new AppError('Notification not found.', 404);
  ApiResponse.success(res, { data: { notification } });
});

/**
 * PATCH /api/v1/admin/notifications/read-all
 * Mark all admin notifications as read.
 */
exports.markAllAdminRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ forAdmin: true, isRead: false }, { isRead: true });
  ApiResponse.success(res, { message: 'All notifications marked as read.' });
});
