const CustomerAddress = require('../models/CustomerAddress');
const AppError = require('../utils/AppError');

/**
 * CustomerAddressService
 * ----------------------
 * Manages a customer's saved shipping/billing addresses.
 */
class CustomerAddressService {
  /**
   * Get all addresses for a customer.
   */
  async getAddresses(customerId) {
    return CustomerAddress.find({ customer: customerId }).sort({ isDefault: -1, createdAt: -1 });
  }

  /**
   * Add a new address. If it is the first address, make it default.
   */
  async addAddress(customerId, addressData) {
    const count = await CustomerAddress.countDocuments({ customer: customerId });

    const isDefault = count === 0 ? true : (addressData.isDefault || false);

    // If new address is default, unset existing default
    if (isDefault) {
      await CustomerAddress.updateMany({ customer: customerId }, { isDefault: false });
    }

    const address = await CustomerAddress.create({
      ...addressData,
      customer: customerId,
      isDefault,
    });

    return address;
  }

  /**
   * Update an existing address. Validates ownership.
   */
  async updateAddress(customerId, addressId, addressData) {
    const address = await CustomerAddress.findOne({ _id: addressId, customer: customerId });
    if (!address) throw new AppError('Address not found.', 404);

    if (addressData.isDefault) {
      await CustomerAddress.updateMany({ customer: customerId }, { isDefault: false });
    }

    Object.assign(address, addressData);
    await address.save();

    return address;
  }

  /**
   * Delete an address. If it was the default, assign default to another address.
   */
  async deleteAddress(customerId, addressId) {
    const address = await CustomerAddress.findOne({ _id: addressId, customer: customerId });
    if (!address) throw new AppError('Address not found.', 404);

    const wasDefault = address.isDefault;
    await address.deleteOne();

    if (wasDefault) {
      // Assign default to the most recently created remaining address
      const remaining = await CustomerAddress.findOne({ customer: customerId }).sort({ createdAt: -1 });
      if (remaining) {
        remaining.isDefault = true;
        await remaining.save();
      }
    }

    return { message: 'Address deleted successfully.' };
  }

  /**
   * Set an address as the default. Unsets any existing default first.
   */
  async setDefault(customerId, addressId) {
    const address = await CustomerAddress.findOne({ _id: addressId, customer: customerId });
    if (!address) throw new AppError('Address not found.', 404);

    await CustomerAddress.updateMany({ customer: customerId }, { isDefault: false });

    address.isDefault = true;
    await address.save();

    return address;
  }
}

module.exports = new CustomerAddressService();
