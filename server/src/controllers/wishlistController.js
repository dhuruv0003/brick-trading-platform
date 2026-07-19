const wishlistService = require('../services/WishlistService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * GET /api/v1/customer/wishlist
 */
exports.getWishlist = catchAsync(async (req, res) => {
  const wishlist = await wishlistService.getWishlist(req.customer._id);
  ApiResponse.success(res, { data: { wishlist } });
});

/**
 * POST /api/v1/customer/wishlist
 */
exports.addToWishlist = catchAsync(async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    const AppError = require('../utils/AppError');
    throw new AppError('Product ID is required.', 400);
  }
  const wishlist = await wishlistService.addToWishlist(req.customer._id, productId);
  ApiResponse.success(res, { data: { wishlist }, message: 'Product added to wishlist.' });
});

/**
 * DELETE /api/v1/customer/wishlist/:productId
 */
exports.removeFromWishlist = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const wishlist = await wishlistService.removeFromWishlist(req.customer._id, productId);
  ApiResponse.success(res, { data: { wishlist }, message: 'Product removed from wishlist.' });
});
