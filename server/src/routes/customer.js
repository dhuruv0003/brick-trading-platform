const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const wishlistController = require('../controllers/wishlistController');
const customerAddressController = require('../controllers/customerAddressController');
const reviewController = require('../controllers/reviewController');
const notificationController = require('../controllers/notificationController');
const { protectCustomer } = require('../middleware/customerAuth');

// All routes below require a valid customer token
router.use(protectCustomer);

// Orders
router.post('/orders', orderController.createOrder);
router.get('/orders', orderController.getMyOrders);
router.get('/orders/:id', orderController.getMyOrder);
router.patch('/orders/:id/cancel', orderController.cancelOrder);

// Wishlist
router.get('/wishlist', wishlistController.getWishlist);
router.post('/wishlist', wishlistController.addToWishlist);
router.delete('/wishlist/:productId', wishlistController.removeFromWishlist);

// Addresses
router.get('/addresses', customerAddressController.getAddresses);
router.post('/addresses', customerAddressController.addAddress);
router.patch('/addresses/:id', customerAddressController.updateAddress);
router.delete('/addresses/:id', customerAddressController.deleteAddress);
router.patch('/addresses/:id/set-default', customerAddressController.setDefault);

// Reviews
router.get('/reviews/my', reviewController.getMyReviews);
router.post('/reviews', reviewController.createReview);
router.patch('/reviews/:id', reviewController.updateReview);
router.delete('/reviews/:id', reviewController.deleteReview);

// Notifications
router.get('/notifications', notificationController.getNotifications);
router.patch('/notifications/read-all', notificationController.markAllRead);
router.patch('/notifications/:id/read', notificationController.markRead);
router.delete('/notifications/:id', notificationController.deleteNotification);

module.exports = router;
