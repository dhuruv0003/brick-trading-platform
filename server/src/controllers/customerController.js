const customerService = require('../services/CustomerService');
const { sendTokenResponse } = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * POST /api/v1/auth/register
 */
exports.register = catchAsync(async (req, res) => {
  const user = await customerService.register(req.body);
  sendTokenResponse(user, 201, res);
});

/**
 * NOTE: profile updates (name/phone/company) are handled by the existing
 * PATCH /api/v1/auth/update-profile endpoint (authController.updateProfile),
 * which AuthService.updateProfile now also accepts phone/company for. No
 * separate customer endpoint needed — avoids duplicating that logic.
 */

/**
 * GET /api/v1/customer/addresses
 */
exports.getMyAddresses = catchAsync(async (req, res) => {
  const addresses = await customerService.listAddresses(req.user._id);
  ApiResponse.success(res, { data: { addresses } });
});

/**
 * POST /api/v1/customer/addresses
 */
exports.addAddress = catchAsync(async (req, res) => {
  const addresses = await customerService.addAddress(req.user._id, req.body);
  ApiResponse.success(res, { data: { addresses }, message: 'Address added.', statusCode: 201 });
});

/**
 * PATCH /api/v1/customer/addresses/:id
 */
exports.updateAddress = catchAsync(async (req, res) => {
  const addresses = await customerService.updateAddress(req.user._id, req.params.id, req.body);
  ApiResponse.success(res, { data: { addresses }, message: 'Address updated.' });
});

/**
 * DELETE /api/v1/customer/addresses/:id
 */
exports.deleteAddress = catchAsync(async (req, res) => {
  const addresses = await customerService.deleteAddress(req.user._id, req.params.id);
  ApiResponse.success(res, { data: { addresses }, message: 'Address removed.' });
});

/**
 * PATCH /api/v1/customer/addresses/:id/default
 */
exports.setDefaultAddress = catchAsync(async (req, res) => {
  const addresses = await customerService.setDefaultAddress(req.user._id, req.params.id);
  ApiResponse.success(res, { data: { addresses }, message: 'Default address updated.' });
});