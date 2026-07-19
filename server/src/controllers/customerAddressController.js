const addressService = require('../services/CustomerAddressService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * GET /api/v1/customer/addresses
 */
exports.getAddresses = catchAsync(async (req, res) => {
  const addresses = await addressService.getAddresses(req.customer._id);
  ApiResponse.success(res, { data: { addresses } });
});

/**
 * POST /api/v1/customer/addresses
 */
exports.addAddress = catchAsync(async (req, res) => {
  const address = await addressService.addAddress(req.customer._id, req.body);
  ApiResponse.success(res, { data: { address }, statusCode: 201, message: 'Address added successfully.' });
});

/**
 * PATCH /api/v1/customer/addresses/:id
 */
exports.updateAddress = catchAsync(async (req, res) => {
  const address = await addressService.updateAddress(req.customer._id, req.params.id, req.body);
  ApiResponse.success(res, { data: { address }, message: 'Address updated successfully.' });
});

/**
 * DELETE /api/v1/customer/addresses/:id
 */
exports.deleteAddress = catchAsync(async (req, res) => {
  await addressService.deleteAddress(req.customer._id, req.params.id);
  ApiResponse.success(res, { message: 'Address deleted successfully.' });
});

/**
 * PATCH /api/v1/customer/addresses/:id/set-default
 */
exports.setDefault = catchAsync(async (req, res) => {
  const address = await addressService.setDefault(req.customer._id, req.params.id);
  ApiResponse.success(res, { data: { address }, message: 'Default address updated.' });
});
