const orderRepository = require('../repositories/OrderRepository');
const productRepository = require('../repositories/ProductRepository');
const CustomerAddress = require('../models/CustomerAddress');
const Customer = require('../models/Customer');
const AppError = require('../utils/AppError');
const NotificationService = require('./NotificationService');
const { sendEmail, renderEmailTemplate } = require('../config/mailer');
const config = require('../config/env');

/**
 * OrderService
 * ------------
 * Business logic for order creation, retrieval, and status management.
 * Both customer-facing and admin-facing operations live here.
 */
class OrderService {
  /**
   * Create a new order from cart items.
   * Validates products, computes pricing, generates order number.
   */
  async createOrder(customerId, { items, shippingAddress, shippingAddressId, billingAddress, paymentMethod, notes }) {
    if (!items || items.length === 0) {
      throw new AppError('Order must contain at least one item.', 400);
    }

    // Resolve shipping address — accept either an embedded object or a saved address ID
    let resolvedShippingAddress = shippingAddress;
    if (!resolvedShippingAddress && shippingAddressId) {
      const savedAddress = await CustomerAddress.findOne({
        _id: shippingAddressId,
        customer: customerId,
      }).lean();
      if (!savedAddress) {
        throw new AppError('Shipping address not found.', 404);
      }
      // Map CustomerAddress fields → Order addressSchema fields
      resolvedShippingAddress = {
        fullName: savedAddress.fullName,
        phone: savedAddress.phone,
        addressLine1: savedAddress.addressLine1,
        addressLine2: savedAddress.addressLine2 || '',
        city: savedAddress.city,
        state: savedAddress.state,
        pincode: savedAddress.pincode,
        landmark: savedAddress.landmark || '',
      };
    }

    if (!resolvedShippingAddress) {
      throw new AppError('Shipping address is required.', 400);
    }

    // Resolve and validate each product
    const resolvedItems = [];
    let subtotal = 0;

    for (const item of items) {
      // Accept both 'product' (from frontend cart) and 'productId' (legacy)
      const pid = item.product || item.productId;
      if (!pid || !item.quantity || item.quantity < 1) {
        throw new AppError('Each item must have a valid product ID and quantity.', 400);
      }

      const product = await productRepository.findById(pid);
      if (!product || !product.isActive) {
        throw new AppError(`Product "${pid}" is not available.`, 400);
      }
      if (!product.inStock) {
        throw new AppError(`"${product.name}" is currently out of stock.`, 400);
      }
      // Quantity-based check — only enforced for products with a tracked
      // stockQuantity (> 0). A stockQuantity of 0 means "not tracked for
      // this product" (backward compatibility), so we fall back to the
      // boolean inStock check above in that case.
      if (product.stockQuantity > 0 && item.quantity > product.stockQuantity) {
        throw new AppError(
          `Only ${product.stockQuantity} unit(s) of "${product.name}" are available, but ${item.quantity} were requested.`,
          400
        );
      }

      const unitPrice = product.pricing?.retail || 0;
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      const primaryImage = product.images?.find((img) => img.isPrimary)?.url
        || product.images?.[0]?.url
        || null;

      resolvedItems.push({
        product: product._id,
        productSnapshot: {
          name: product.name,
          slug: product.slug,
          image: primaryImage,
          sku: product.specs?.type || '',
          category: product.category?.name || '',
        },
        quantity: item.quantity,
        unitPrice,
        totalPrice: itemTotal,
      });
    }

    const tax = 0; // GST calculation can be extended here
    const shippingCharge = 0; // Shipping logic can be extended here
    const discount = 0; // Coupon logic can be extended here
    const total = subtotal + tax + shippingCharge - discount;

    const orderNumber = await orderRepository.generateOrderNumber();

    const order = await orderRepository.create({
      orderNumber,
      customer: customerId,
      items: resolvedItems,
      pricing: { subtotal, tax, shippingCharge, discount, total },
      shippingAddress: resolvedShippingAddress,
      billingAddress: billingAddress || null,
      paymentMethod: paymentMethod || 'cod',
      notes: notes || '',
      status: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    });

    // Decrement stock for tracked products (no-op for untracked ones).
    // Non-blocking per-item — a failure here shouldn't fail the whole
    // order, since the order itself was already successfully created.
    Promise.all(
      resolvedItems.map((item) =>
        productRepository.decrementStock(item.product, item.quantity).catch(() => {})
      )
    );

    // Fire notification (non-blocking)
    NotificationService.orderPlaced(customerId, orderNumber).catch(() => {});

    // Fire order-confirmation emails to the customer and admin — best-effort,
    // never blocks or fails the order response if email sending has issues.
    Promise.allSettled([
      this._notifyCustomerOfOrder(customerId, order),
      this._notifyAdminOfOrder(order),
    ]);

    return order;
  }

  /**
   * Order confirmation email sent to the customer who placed the order.
   */
  async _notifyCustomerOfOrder(customerId, order) {
    const customer = await Customer.findById(customerId).select('firstName lastName email');
    if (!customer?.email) return;

    const itemRows = order.items.map((item) => ({
      label: item.productSnapshot?.name || 'Item',
      value: `${item.quantity} × ₹${item.unitPrice.toLocaleString('en-IN')} = ₹${item.totalPrice.toLocaleString('en-IN')}`,
    }));

    await sendEmail({
      to: customer.email,
      subject: `Order confirmed — #${order.orderNumber} — ${config.company.name}`,
      html: renderEmailTemplate({
        heading: `Thanks for your order, ${customer.firstName}!`,
        intro: `Your order <strong>#${order.orderNumber}</strong> has been placed successfully. Here's a summary:`,
        rows: [
          ...itemRows,
          { label: 'Subtotal', value: `₹${order.pricing.subtotal.toLocaleString('en-IN')}` },
          { label: 'Total', value: `<strong>₹${order.pricing.total.toLocaleString('en-IN')}</strong>` },
          { label: 'Payment Method', value: (order.paymentMethod || 'cod').toUpperCase() },
          { label: 'Shipping To', value: `${order.shippingAddress?.addressLine1}, ${order.shippingAddress?.city}` },
        ],
        footerNote: `Track your order anytime at ${config.clientUrl}/account/orders. — ${config.company.name}`,
      }),
    });
  }

  /**
   * New-order alert email sent to the admin inbox.
   */
  async _notifyAdminOfOrder(order) {
    if (!config.email.adminEmail) return;
    await sendEmail({
      to: config.email.adminEmail,
      subject: `New Order #${order.orderNumber} — ₹${order.pricing.total.toLocaleString('en-IN')}`,
      html: renderEmailTemplate({
        heading: 'New Order Placed',
        rows: [
          { label: 'Order #', value: order.orderNumber },
          { label: 'Items', value: `${order.items.length} item(s)` },
          { label: 'Total', value: `₹${order.pricing.total.toLocaleString('en-IN')}` },
          { label: 'Payment Method', value: (order.paymentMethod || 'cod').toUpperCase() },
        ],
        footerNote: `<a href="${config.clientUrl}/admin/orders/${order._id}" style="color:#c2410c;">View in Admin →</a>`,
      }),
    });
  }

  /**
   * Get paginated orders for a specific customer.
   */
  async getCustomerOrders(customerId, query) {
    return orderRepository.findByCustomer(customerId, query);
  }

  /**
   * Get a single order by ID, scoped to the customer.
   */
  async getOrderById(customerId, orderId) {
    const order = await orderRepository.findById(orderId, {
      populate: [
        { path: 'items.product', select: 'name slug images pricing' },
      ],
    });

    if (!order) throw new AppError('Order not found.', 404);
    if (order.customer.toString() !== customerId.toString()) {
      throw new AppError('You do not have access to this order.', 403);
    }

    return order;
  }

  /**
   * Cancel an order (customer can only cancel pending/confirmed orders).
   */
  async cancelOrder(customerId, orderId, reason) {
    const order = await orderRepository.findById(orderId);

    if (!order) throw new AppError('Order not found.', 404);
    if (order.customer.toString() !== customerId.toString()) {
      throw new AppError('You do not have access to this order.', 403);
    }

    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      throw new AppError(
        `Cannot cancel an order with status "${order.status}". Please contact support.`,
        400
      );
    }

    const updated = await orderRepository.updateById(orderId, {
      status: 'cancelled',
      cancelReason: reason || 'Cancelled by customer',
      cancelledAt: new Date(),
    });

    // Restore stock for tracked products — non-blocking, mirrors the
    // decrement done on order creation.
    Promise.all(
      (order.items || []).map((item) =>
        productRepository.restoreStock(item.product, item.quantity).catch(() => {})
      )
    );

    return updated;
  }

  // ─── Admin operations ──────────────────────────────────────────────────

  /**
   * Get all orders for admin with pagination, filtering, and search.
   */
  async adminGetOrders(query) {
    return orderRepository.findAdminOrders(query);
  }

  /**
   * Get a single order by ID for admin (no customer scope restriction).
   */
  async adminGetOrderById(orderId) {
    const order = await orderRepository.findById(orderId, {
      populate: [
        { path: 'customer', select: 'firstName lastName email phone companyName' },
        { path: 'items.product', select: 'name slug images pricing category' },
      ],
    });
    if (!order) throw new AppError('Order not found.', 404);
    return order;
  }

  /**
   * Update order status and/or add admin notes.
   */
  async adminUpdateOrder(orderId, { status, paymentStatus, adminNotes, trackingNumber, deliveredAt }) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new AppError('Order not found.', 404);

    const updateData = {};
    if (status) {
      const validTransitions = this._getValidStatusTransitions(order.status);
      if (!validTransitions.includes(status)) {
        throw new AppError(
          `Cannot transition order from "${order.status}" to "${status}".`,
          400
        );
      }
      updateData.status = status;
      if (status === 'delivered') updateData.deliveredAt = deliveredAt || new Date();
      if (status === 'cancelled') updateData.cancelledAt = new Date();
    }
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

    const updated = await orderRepository.updateById(orderId, updateData);

    // Send realtime notification to customer when status changes
    if (status && order.customer) {
      NotificationService.orderStatusChanged(order.customer, order.orderNumber, status).catch(() => {});
    }

    // Restore stock if an admin cancels an order that wasn't already cancelled
    if (status === 'cancelled' && order.status !== 'cancelled') {
      Promise.all(
        (order.items || []).map((item) =>
          productRepository.restoreStock(item.product, item.quantity).catch(() => {})
        )
      );
    }

    return updated;
  }

  /**
   * Define allowed status transitions for validation.
   */
  _getValidStatusTransitions(currentStatus) {
    const transitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['out_for_delivery', 'delivered'],
      out_for_delivery: ['delivered'],
      delivered: ['refunded'],
      cancelled: ['refunded'],
      refunded: [],
    };
    return transitions[currentStatus] || [];
  }
}

module.exports = new OrderService();