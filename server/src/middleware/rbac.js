const AppError = require('../utils/AppError');

/**
 * Role-Based Access Control middleware
 * Usage: restrictTo('admin', 'manager')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }

    next();
  };
};

/**
 * Role hierarchy: super_admin > admin > manager > staff
 */
const ROLE_HIERARCHY = {
  super_admin: 4,
  admin: 3,
  manager: 2,
  staff: 1,
};

/**
 * Check if user has at least the minimum required role level
 */
const requireMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userLevel < requiredLevel) {
      return next(
        new AppError('You do not have sufficient permissions for this action.', 403)
      );
    }

    next();
  };
};

module.exports = { restrictTo, requireMinRole, ROLE_HIERARCHY };
