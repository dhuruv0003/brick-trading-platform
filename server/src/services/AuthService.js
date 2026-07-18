const userRepository = require('../repositories/UserRepository');
const AppError = require('../utils/AppError');

/**
 * AuthService
 * -----------
 * All authentication business rules live here. Controllers only translate
 * HTTP <-> service calls; they never touch the User model or repository
 * directly, and never decide *whether* a login/password change is valid.
 */
class AuthService {
  /**
   * Validates credentials and returns the authenticated user.
   * Does NOT issue a token/cookie — that's an HTTP concern handled by the
   * controller via middleware/auth.sendTokenResponse.
   */
  async login(email, password) {
    if (!email || !password) {
      throw new AppError('Please provide email and password.', 400);
    }

    const user = await userRepository.findByEmail(email, { select: '+password' });

    if (!user || !(await user.correctPassword(password))) {
      throw new AppError('Incorrect email or password.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated.', 401);
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    return user;
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found.', 404);
    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId, { select: '+password' });
    if (!user) throw new AppError('User not found.', 404);

    if (!(await user.correctPassword(currentPassword))) {
      throw new AppError('Current password is incorrect.', 401);
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    return user;
  }

  async updateProfile(userId, { name, avatar, phone, company }) {
    const updateData = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;
    // Customer-only fields — harmless no-ops for staff accounts that never send them.
    if (phone !== undefined) updateData.phone = phone;
    if (company !== undefined) updateData.company = company;

    const user = await userRepository.updateById(userId, updateData);
    if (!user) throw new AppError('User not found.', 404);
    return user;
  }
}

module.exports = new AuthService();