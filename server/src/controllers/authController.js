const authService = require('../services/AuthService');
const catchAsync = require('../utils/catchAsync');
const { sendTokenResponse } = require('../middleware/auth');
const ApiResponse = require('../utils/apiResponse');

/**
 * POST /api/v1/auth/login
 */
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.login(email, password);
  sendTokenResponse(user, 200, res);
});

/**
 * POST /api/v1/auth/logout
 */
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  ApiResponse.success(res, { message: 'Logged out successfully.' });
};

/**
 * GET /api/v1/auth/me
 */
exports.getMe = catchAsync(async (req, res) => {
  const user = await authService.getProfile(req.user._id);
  ApiResponse.success(res, { data: { user } });
});

/**
 * PATCH /api/v1/auth/update-password
 */
exports.updatePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await authService.changePassword(req.user._id, currentPassword, newPassword);
  sendTokenResponse(user, 200, res);
});

/**
 * PATCH /api/v1/auth/update-profile
 */
exports.updateProfile = catchAsync(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  ApiResponse.success(res, { data: { user }, message: 'Profile updated successfully.' });
});
