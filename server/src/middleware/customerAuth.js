const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/env');

/**
 * Verify customer JWT and attach customer to request.
 * Reads from Authorization header (Bearer token) or jwt_customer cookie.
 * Completely separate from the admin auth middleware.
 */
const protectCustomer = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt_customer) {
    token = req.cookies.jwt_customer;
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to continue.', 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.secret);
  } catch (err) {
    return next(new AppError('Invalid or expired session. Please log in again.', 401));
  }

  // Must be a customer token (role: 'customer')
  if (decoded.role !== 'customer') {
    return next(new AppError('Invalid token type. Please log in as a customer.', 401));
  }

  const currentCustomer = await Customer.findById(decoded.id).select('+password');
  if (!currentCustomer) {
    return next(new AppError('Account no longer exists.', 401));
  }

  if (!currentCustomer.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 401));
  }

  if (currentCustomer.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Password was recently changed. Please log in again.', 401));
  }

  req.customer = currentCustomer;
  next();
});

/**
 * Sign a customer JWT. Embeds role:'customer' to distinguish from admin tokens.
 */
const signCustomerToken = (id) => {
  return jwt.sign({ id, role: 'customer' }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Set customer cookie and return token response.
 */
const sendCustomerTokenResponse = (customer, statusCode, res) => {
  const token = signCustomerToken(customer._id);

  const cookieOptions = {
    expires: new Date(Date.now() + config.jwt.cookieExpiresIn * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
  };

  res.cookie('jwt_customer', token, cookieOptions);

  // Remove sensitive fields from response
  customer.password = undefined;
  customer.googleId = undefined;
  customer.passwordResetToken = undefined;
  customer.passwordResetExpires = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: { customer },
  });
};

module.exports = { protectCustomer, signCustomerToken, sendCustomerTokenResponse };
