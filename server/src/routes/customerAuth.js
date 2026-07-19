const express = require('express');
const passport = require('passport');
const router = express.Router();
const customerAuthController = require('../controllers/customerAuthController');
const { protectCustomer } = require('../middleware/customerAuth');
const { authLimiter } = require('../middleware/rateLimiter');
const AppError = require('../utils/AppError');

const ensureGoogleStrategy = (req, res, next) => {
  if (!passport._strategy('google-customer')) {
    return next(new AppError(
      'Google sign-in is not configured on the server (missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET).',
      503
    ));
  }
  next();
};

// Local Auth
router.post('/register', authLimiter, customerAuthController.register);
router.post('/login', authLimiter, customerAuthController.login);
router.post('/logout', customerAuthController.logout);

// Protected Profile routes
router.get('/me', protectCustomer, customerAuthController.getMe);
router.patch('/update-password', protectCustomer, customerAuthController.updatePassword);
router.patch('/update-profile', protectCustomer, customerAuthController.updateProfile);

// Password Reset
router.post('/forgot-password', authLimiter, customerAuthController.forgotPassword);
router.post('/reset-password/:token', authLimiter, customerAuthController.resetPassword);

// Google OAuth
router.get(
  '/google',
  ensureGoogleStrategy,
  passport.authenticate('google-customer', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  ensureGoogleStrategy,
  passport.authenticate('google-customer', { session: false, failureRedirect: '/auth/login?error=oauth_failed' }),
  customerAuthController.oauthSuccess
);

module.exports = router;