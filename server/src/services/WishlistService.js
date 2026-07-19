const Wishlist = require('../models/Wishlist');
const AppError = require('../utils/AppError');

/**
 * WishlistService
 * ---------------
 * One wishlist per customer; products are stored as refs with timestamps.
 */
class WishlistService {
  /**
   * Get the customer's wishlist with populated product data.
   */
  async getWishlist(customerId) {
    let wishlist = await Wishlist.findOne({ customer: customerId })
      .populate({
        path: 'products.product',
        select: 'name slug images pricing inStock isActive category',
        populate: { path: 'category', select: 'name slug' },
      });

    if (!wishlist) {
      // Return empty wishlist structure
      return { customer: customerId, products: [] };
    }

    // Filter out inactive/deleted products
    wishlist.products = wishlist.products.filter((item) => item.product && item.product.isActive);

    return wishlist;
  }

  /**
   * Add a product to the wishlist. Idempotent (no duplicates).
   */
  async addToWishlist(customerId, productId) {
    let wishlist = await Wishlist.findOne({ customer: customerId });

    if (!wishlist) {
      wishlist = new Wishlist({
        customer: customerId,
        products: [{ product: productId, addedAt: new Date() }],
      });
    } else {
      const alreadyAdded = wishlist.products.some(
        (item) => item.product.toString() === productId.toString()
      );
      if (!alreadyAdded) {
        wishlist.products.push({ product: productId, addedAt: new Date() });
      }
    }

    await wishlist.save();
    return wishlist;
  }

  /**
   * Remove a product from the wishlist.
   */
  async removeFromWishlist(customerId, productId) {
    const wishlist = await Wishlist.findOne({ customer: customerId });
    if (!wishlist) throw new AppError('Wishlist not found.', 404);

    wishlist.products = wishlist.products.filter(
      (item) => item.product.toString() !== productId.toString()
    );

    await wishlist.save();
    return wishlist;
  }

  /**
   * Clear all products from wishlist.
   */
  async clearWishlist(customerId) {
    const wishlist = await Wishlist.findOne({ customer: customerId });
    if (!wishlist) return { customer: customerId, products: [] };
    wishlist.products = [];
    await wishlist.save();
    return wishlist;
  }
}

module.exports = new WishlistService();
