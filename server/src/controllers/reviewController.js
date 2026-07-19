const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');

/**
 * GET /api/v1/products/:slug/reviews
 * Public — returns approved reviews for a product, paginated.
 */
exports.getProductReviews = catchAsync(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).select('_id name averageRating reviewCount');
  if (!product) throw new AppError('Product not found.', 404);

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(20, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ product: product._id, isApproved: true })
      .populate('customer', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ product: product._id, isApproved: true }),
  ]);

  // Rating distribution (1-5)
  const distribution = await Review.aggregate([
    { $match: { product: product._id, isApproved: true } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  ApiResponse.success(res, {
    data: {
      reviews,
      summary: {
        averageRating: product.averageRating,
        reviewCount: product.reviewCount,
        distribution: distribution.reduce((acc, d) => { acc[d._id] = d.count; return acc; }, {}),
      },
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

/**
 * POST /api/v1/customer/reviews
 * Authenticated customer — create a review. One per product.
 * Also checks if customer has a delivered order containing this product.
 */
exports.createReview = catchAsync(async (req, res) => {
  const { productId, rating, title, comment } = req.body;
  const customerId = req.customer._id;

  if (!productId || !rating) throw new AppError('Product ID and rating are required.', 400);

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) throw new AppError('Product not found.', 404);

  // Check for duplicate review
  const existing = await Review.findOne({ product: productId, customer: customerId });
  if (existing) throw new AppError('You have already reviewed this product.', 409);

  // Check for verified purchase (has a delivered order containing this product)
  const verifiedOrder = await Order.findOne({
    customer: customerId,
    status: 'delivered',
    'items.product': productId,
  });

  const review = await Review.create({
    product: productId,
    customer: customerId,
    rating,
    title: title?.trim(),
    comment: comment?.trim(),
    isVerifiedPurchase: !!verifiedOrder,
  });

  await review.populate('customer', 'firstName lastName');

  ApiResponse.success(res, {
    data: { review },
    message: 'Review submitted successfully.',
    statusCode: 201,
  });
});

/**
 * PATCH /api/v1/customer/reviews/:id
 * Authenticated customer — update their own review.
 */
exports.updateReview = catchAsync(async (req, res) => {
  const { rating, title, comment } = req.body;

  const review = await Review.findOne({ _id: req.params.id, customer: req.customer._id });
  if (!review) throw new AppError('Review not found or you do not have permission to edit it.', 404);

  if (rating !== undefined) review.rating = rating;
  if (title !== undefined) review.title = title?.trim();
  if (comment !== undefined) review.comment = comment?.trim();
  await review.save();

  await review.populate('customer', 'firstName lastName');

  ApiResponse.success(res, { data: { review }, message: 'Review updated.' });
});

/**
 * DELETE /api/v1/customer/reviews/:id
 * Authenticated customer — delete their own review.
 */
exports.deleteReview = catchAsync(async (req, res) => {
  const review = await Review.findOneAndDelete({
    _id: req.params.id,
    customer: req.customer._id,
  });
  if (!review) throw new AppError('Review not found or you do not have permission to delete it.', 404);

  ApiResponse.success(res, { message: 'Review deleted.' });
});

/**
 * GET /api/v1/customer/reviews/my
 * Authenticated customer — get all their own reviews.
 */
exports.getMyReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ customer: req.customer._id })
    .populate('product', 'name slug images pricing')
    .sort({ createdAt: -1 });

  ApiResponse.success(res, { data: { reviews } });
});
