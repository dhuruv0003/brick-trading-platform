const crypto = require('crypto');
const customerRepository = require('../repositories/CustomerRepository');
const AppError = require('../utils/AppError');
const NotificationService = require('./NotificationService');

/**
 * CustomerAuthService
 * -------------------
 * All customer authentication business logic.
 * Controllers only translate HTTP <-> service calls.
 * Completely isolated from the admin AuthService.
 */
class CustomerAuthService {
  /**
   * Register a new customer account.
   */
  async register({ firstName, lastName, email, phone, password, companyName, gstNumber }) {
    if (!firstName || !lastName || !email || !phone || !password) {
      throw new AppError('First name, last name, email, phone and password are required.', 400);
    }

    const existing = await customerRepository.findByEmail(email);
    if (existing) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const customer = await customerRepository.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      companyName: companyName || null,
      gstNumber: gstNumber || null,
      authProvider: 'local',
    });

    return customer;
  }

  /**
   * Validate customer credentials and return the customer object.
   */
  async login(email, password) {
    if (!email || !password) {
      throw new AppError('Please provide email and password.', 400);
    }

    const customer = await customerRepository.findByEmail(email, { select: '+password' });

    if (!customer) {
      throw new AppError('Incorrect email or password.', 401);
    }

    if (customer.authProvider === 'google' && !customer.password) {
      throw new AppError('This account uses Google Sign-In. Please continue with Google.', 400);
    }

    if (!(await customer.correctPassword(password))) {
      throw new AppError('Incorrect email or password.', 401);
    }

    if (!customer.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 401);
    }

    customer.lastLogin = new Date();
    await customer.save({ validateBeforeSave: false });

    return customer;
  }

  /**
   * Find or create a customer from Google OAuth profile.
   */
  async findOrCreateFromGoogle({ googleId, email, firstName, lastName, avatar }) {
    // Try to find by googleId first
    let customer = await customerRepository.findByGoogleId(googleId);
    if (customer) {
      customer.lastLogin = new Date();
      await customer.save({ validateBeforeSave: false });
      return customer;
    }

    // Try to find by email (link existing account)
    customer = await customerRepository.findByEmail(email);
    if (customer) {
      customer.googleId = googleId;
      customer.authProvider = 'google';
      if (!customer.avatar && avatar) customer.avatar = avatar;
      customer.lastLogin = new Date();
      await customer.save({ validateBeforeSave: false });
      return customer;
    }

    // Create new customer from Google
    customer = await customerRepository.create({
      firstName,
      lastName,
      email,
      // phone intentionally omitted — Google profiles don't provide one,
      // and setting it to '' would fail the schema's regex match validator.
      // Customer fills it in on first profile completion.
      googleId,
      authProvider: 'google',
      isEmailVerified: true,
      avatar: avatar || null,
      lastLogin: new Date(),
    });

    return customer;
  }

  /**
   * Get customer profile by ID.
   */
  async getProfile(customerId) {
    const customer = await customerRepository.findById(customerId);
    if (!customer) throw new AppError('Account not found.', 404);
    return customer;
  }

  /**
   * Update customer profile fields.
   */
  async updateProfile(customerId, { firstName, lastName, phone, avatar, companyName, gstNumber }) {
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (gstNumber !== undefined) updateData.gstNumber = gstNumber;

    const customer = await customerRepository.updateById(customerId, updateData);
    if (!customer) throw new AppError('Account not found.', 404);

    // Only notify if an actual field changed — not on a no-op call.
    if (Object.keys(updateData).length > 0) {
      NotificationService.profileUpdated(customerId).catch(() => {});
    }

    return customer;
  }

  /**
   * Change customer password.
   */
  async changePassword(customerId, currentPassword, newPassword) {
    const customer = await customerRepository.findById(customerId, { select: '+password' });
    if (!customer) throw new AppError('Account not found.', 404);

    if (customer.authProvider === 'google' && !customer.password) {
      throw new AppError('Google sign-in accounts cannot change password directly. Set a password first.', 400);
    }

    if (!(await customer.correctPassword(currentPassword))) {
      throw new AppError('Current password is incorrect.', 401);
    }

    customer.password = newPassword;
    customer.passwordChangedAt = new Date();
    await customer.save();

    NotificationService.profileUpdated(customerId).catch(() => {});

    return customer;
  }

  /**
   * Initiate password reset — generates token and returns it for email sending.
   */
  async requestPasswordReset(email) {
    const customer = await customerRepository.findByEmail(email);
    if (!customer) {
      // Don't reveal if email exists
      return null;
    }

    const resetToken = customer.createPasswordResetToken();
    await customer.save({ validateBeforeSave: false });

    return { customer, resetToken };
  }

  /**
   * Reset password using the token from email link.
   */
  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const customer = await customerRepository.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }, { select: '+passwordResetToken +passwordResetExpires' });

    if (!customer) {
      throw new AppError('Invalid or expired reset token. Please request a new one.', 400);
    }

    customer.password = newPassword;
    customer.passwordResetToken = undefined;
    customer.passwordResetExpires = undefined;
    customer.passwordChangedAt = new Date();
    await customer.save();

    return customer;
  }
}

module.exports = new CustomerAuthService();