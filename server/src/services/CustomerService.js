const userRepository = require('../repositories/UserRepository');
const AppError = require('../utils/AppError');

/**
 * CustomerService
 * ---------------
 * Address-book management and customer-only profile fields. Kept separate
 * from AuthService (which stays role-agnostic — login/password/basic
 * profile for any staff or customer account) so customer-specific concerns
 * don't bloat the shared auth service.
 */
class CustomerService {
  async register({ name, email, password, phone }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new AppError('An account with this email already exists.', 400);

    const user = await userRepository.create({
      name,
      email,
      password,
      phone,
      role: 'customer',
    });
    return user;
  }

  /** Extends AuthService.updateProfile with the customer-only fields (phone/company). */
  // NOTE: superseded — AuthService.updateProfile now accepts phone/company
  // directly, so the existing PATCH /auth/update-profile endpoint handles
  // this for both staff and customer accounts. Kept out of this service to
  // avoid duplicating that logic in two places.

  // ---------- Address book ----------

  async listAddresses(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found.', 404);
    return user.addresses.filter((a) => !a.isDeleted);
  }

  async addAddress(userId, payload) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found.', 404);

    // First-ever address is automatically the default so checkout always
    // has something pre-selected.
    const isFirstAddress = user.addresses.filter((a) => !a.isDeleted).length === 0;
    const isDefault = isFirstAddress || !!payload.isDefault;

    if (isDefault) {
      user.addresses.forEach((a) => { a.isDefault = false; });
    }

    user.addresses.push({ ...payload, isDefault });
    await user.save();
    return user.addresses.filter((a) => !a.isDeleted);
  }

  async updateAddress(userId, addressId, payload) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found.', 404);

    const address = user.addresses.id(addressId);
    if (!address || address.isDeleted) throw new AppError('Address not found.', 404);

    if (payload.isDefault) {
      user.addresses.forEach((a) => { a.isDefault = false; });
    }

    ['label', 'line1', 'line2', 'city', 'state', 'pincode', 'phone', 'isDefault'].forEach((field) => {
      if (payload[field] !== undefined) address[field] = payload[field];
    });

    await user.save();
    return user.addresses.filter((a) => !a.isDeleted);
  }

  /** Soft delete — matches this project's existing isActive/soft-delete convention. */
  async deleteAddress(userId, addressId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found.', 404);

    const address = user.addresses.id(addressId);
    if (!address || address.isDeleted) throw new AppError('Address not found.', 404);

    address.isDeleted = true;
    const wasDefault = address.isDefault;
    address.isDefault = false;

    // If the deleted address was the default, promote the next remaining
    // one so checkout never ends up with zero default addresses.
    if (wasDefault) {
      const next = user.addresses.find((a) => !a.isDeleted);
      if (next) next.isDefault = true;
    }

    await user.save();
    return user.addresses.filter((a) => !a.isDeleted);
  }

  async setDefaultAddress(userId, addressId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found.', 404);

    const address = user.addresses.id(addressId);
    if (!address || address.isDeleted) throw new AppError('Address not found.', 404);

    user.addresses.forEach((a) => { a.isDefault = false; });
    address.isDefault = true;

    await user.save();
    return user.addresses.filter((a) => !a.isDeleted);
  }
}

module.exports = new CustomerService();