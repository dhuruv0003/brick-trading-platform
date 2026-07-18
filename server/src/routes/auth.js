const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const customerController = require('../controllers/customerController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, customerController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);
router.patch('/update-password', protect, authController.updatePassword);
router.patch('/update-profile', protect, authController.updateProfile);

module.exports = router;