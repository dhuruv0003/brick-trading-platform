const customerAuthService = require('../services/CustomerAuthService');
const catchAsync = require('../utils/catchAsync');
const { sendCustomerTokenResponse } = require('../middleware/customerAuth');
const ApiResponse = require('../utils/apiResponse');

/**
 * POST /api/v1/customer/auth/register
 */
exports.register = catchAsync(async (req, res) => {
  const { firstName, lastName, email, phone, password, companyName, gstNumber } = req.body;
  const customer = await customerAuthService.register({
    firstName, lastName, email, phone, password, companyName, gstNumber,
  });
  sendCustomerTokenResponse(customer, 201, res);
});

/**
 * POST /api/v1/customer/auth/login
 */
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const customer = await customerAuthService.login(email, password);
  sendCustomerTokenResponse(customer, 200, res);
});

/**
 * POST /api/v1/customer/auth/logout
 */
exports.logout = (req, res) => {
  res.cookie('jwt_customer', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  ApiResponse.success(res, { message: 'Logged out successfully.' });
};

/**
 * GET /api/v1/customer/auth/me
 */
exports.getMe = catchAsync(async (req, res) => {
  const customer = await customerAuthService.getProfile(req.customer._id);
  ApiResponse.success(res, { data: { customer } });
});

/**
 * PATCH /api/v1/customer/auth/update-profile
 */
exports.updateProfile = catchAsync(async (req, res) => {
  const { firstName, lastName, phone, avatar, companyName, gstNumber } = req.body;
  const customer = await customerAuthService.updateProfile(req.customer._id, {
    firstName, lastName, phone, avatar, companyName, gstNumber,
  });
  ApiResponse.success(res, { data: { customer }, message: 'Profile updated successfully.' });
});

/**
 * PATCH /api/v1/customer/auth/update-password
 */
exports.updatePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const customer = await customerAuthService.changePassword(
    req.customer._id, currentPassword, newPassword
  );
  sendCustomerTokenResponse(customer, 200, res);
});

/**
 * POST /api/v1/customer/auth/forgot-password
 */
exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await customerAuthService.requestPasswordReset(email);

  // Always respond with success to avoid email enumeration
  // In production, send the reset email here using mailer
  if (result) {
    const { resetToken } = result;
    // TODO: Send email with reset link containing resetToken
    // await mailer.sendPasswordResetEmail(result.customer.email, resetToken);
    // For now, log in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[Dev] Password reset token for ${email}: ${resetToken}`);
    }
  }

  ApiResponse.success(res, {
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
});

/**
 * POST /api/v1/customer/auth/reset-password/:token
 */
exports.resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    const AppError = require('../utils/AppError');
    throw new AppError('New password is required.', 400);
  }

  const customer = await customerAuthService.resetPassword(token, password);
  sendCustomerTokenResponse(customer, 200, res);
});

/**
 * GET /api/v1/customer/auth/google/callback
 * Called after successful Google OAuth — customer is set by passport strategy.
 */
exports.oauthSuccess = catchAsync(async (req, res) => {
  const customer = req.customer || req.user;
  if (!customer) {
    return res.redirect('/auth/login?error=oauth_failed');
  }
  const { signCustomerToken } = require('../middleware/customerAuth');
  const token = signCustomerToken(customer._id);

  // Redirect to frontend with token in query (short-lived, for OAuth handshake only)
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  res.redirect(`${clientUrl}/auth/oauth-success?token=${token}`);
});
