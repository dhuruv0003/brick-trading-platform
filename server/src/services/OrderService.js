const orderRepository = require('../repositories/OrderRepository');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { sendEmail, renderEmailTemplate } = require('../config/mailer');
const whatsapp = require('../config/whatsapp');
const config = require('../config/env');

// Human-friendly labels for the tracking timeline — deliberately plain
// language (no "fulfillment"/"dispatch queue" jargon) since this app is
// used by people in tier-3 cities who think in terms of "my order", not
// e-commerce back-office terms.
const STATUS_LABELS = {
  placed: 'Order Placed',
  confirmed: 'Order Confirmed',
  preparing: 'Preparing Your Order',
  ready_for_dispatch: 'Ready for Dispatch',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

class OrderService {
  // ---------- Customer-facing ----------

  /**
   * Places an order from the customer's current cart. Mirrors
   * CrmService.submitQuote's item-snapshotting approach (product name/price
   * captured at order time), but tied to a logged-in customer + their
   * saved address instead of an anonymous quote form.
   */
  async placeOrder(customerUser, { items, addressId, address, notes }, ip) {
    if (!items?.length) {
      throw new AppError('Your cart is empty. Add at least one item before placing an order.', 400);
    }

    // Resolve the shipping address: either an existing saved address
    // (referenced by id) or a one-off address object passed directly.
    let shippingAddress = address;
    if (addressId) {
      const saved = customerUser.addresses.id(addressId);
      if (!saved || saved.isDeleted) {
        throw new AppError('Selected address not found.', 404);
      }
      shippingAddress = {
        label: saved.label,
        line1: saved.line1,
        line2: saved.line2,
        city: saved.city,
        state: saved.state,
        pincode: saved.pincode,
        phone: saved.phone,
      };
    }
    if (!shippingAddress?.line1) {
      throw new AppError('A delivery address is required to place an order.', 400);
    }

    // Snapshot product details + compute totals server-side — never trust
    // client-submitted prices, same principle as the existing quote flow.
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    let subtotal = 0;
    const orderItems = items.map((i) => {
      const product = productMap.get(i.productId);
      if (!product) throw new AppError('One of the items in your cart is no longer available.', 400);

      const priceType = i.priceType || 'retail';
      const unitPrice = product.pricing?.[priceType] || product.pricing?.retail || 0;
      const isPerThousand = (product.pricing?.unit || '').toLowerCase().includes('1000');
      const multiplier = isPerThousand ? i.quantity / 1000 : i.quantity;
      const totalPrice = Math.round(unitPrice * multiplier);
      subtotal += totalPrice;

      return {
        product: product._id,
        productName: product.name,
        productImage: product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url,
        quantity: i.quantity,
        unit: product.pricing?.unit || 'pieces',
        priceType,
        unitPrice,
        totalPrice,
      };
    });

    const order = await orderRepository.create({
      customer: customerUser._id,
      customerName: customerUser.name,
      customerPhone: customerUser.phone,
      customerEmail: customerUser.email,
      items: orderItems,
      shippingAddress,
      subtotal,
      totalAmount: subtotal, // no discount/payment logic in Phase 1
      notes,
      ipAddress: ip,
    });

    Promise.allSettled([
      this._notifyAdminOfOrder(order),
      this._notifyCustomerOfOrder(order, customerUser),
    ]);

    return order;
  }

  async getCustomerOrders(customerId, query) {
    return orderRepository.findCustomerOrders(customerId, query);
  }

  async getCustomerOrder(orderId, customerId) {
    const order = await orderRepository.findByIdForCustomer(orderId, customerId);
    if (!order) throw new AppError('Order not found.', 404);
    return order;
  }

  /** Dashboard stats + recent orders for the logged-in customer. */
  async getCustomerDashboard(customerId) {
    const [{ total, counts }, recentOrders] = await Promise.all([
      orderRepository.countByStatusForCustomer(customerId),
      orderRepository.findAll({ customer: customerId }, { sort: { createdAt: -1 }, limit: 5 }),
    ]);

    const pending = ['placed', 'confirmed', 'preparing', 'ready_for_dispatch', 'out_for_delivery']
      .reduce((sum, s) => sum + (counts[s] || 0), 0);

    return {
      stats: {
        totalOrders: total,
        pendingOrders: pending,
        completedOrders: counts.delivered || 0,
        cancelledOrders: counts.cancelled || 0,
      },
      recentOrders,
    };
  }

  /** Completed (delivered) orders that have an invoice — for the customer's invoice list. */
  async getCustomerInvoices(customerId, query) {
    return orderRepository.findMany(
      { customer: customerId, status: 'delivered' },
      query,
      { sort: { createdAt: -1 } },
    );
  }

  // ---------- Admin-facing ----------

  async listAdminOrders(query) {
    return orderRepository.findAdminOrders(query);
  }

  async updateOrderStatus(orderId, { status, note }, adminUserId) {
    if (!Object.keys(STATUS_LABELS).includes(status)) {
      throw new AppError('Invalid order status.', 400);
    }
    const order = await orderRepository.appendStatusUpdate(orderId, { status, note }, adminUserId);
    if (!order) throw new AppError('Order not found.', 404);

    Promise.allSettled([this._notifyCustomerOfStatusChange(order)]);

    return order;
  }

  // ---------- Notifications (same pattern as CrmService) ----------

  async _notifyAdminOfOrder(order) {
    if (!config.email.adminEmail) return;
    await sendEmail({
      to: config.email.adminEmail,
      subject: `New Order #${order.orderNumber}`,
      html: renderEmailTemplate({
        heading: 'New Order Received',
        rows: [
          { label: 'Order #', value: order.orderNumber },
          { label: 'Customer', value: order.customerName },
          { label: 'Phone', value: order.customerPhone },
          { label: 'Items', value: `${order.items.length} item(s)` },
          { label: 'Total', value: `₹${(order.totalAmount || 0).toLocaleString('en-IN')}` },
        ],
        footerNote: `<a href="${config.clientUrl}/admin/orders/${order._id}" style="color:#c2410c;">View in Admin →</a>`,
      }),
    });
  }

  async _notifyCustomerOfOrder(order, customerUser) {
    if (customerUser.email) {
      const itemRows = order.items.map((item) => ({
        label: item.productName,
        value: `${item.quantity} ${item.unit} × ₹${item.unitPrice.toLocaleString('en-IN')} = ₹${item.totalPrice.toLocaleString('en-IN')}`,
      }));
      await sendEmail({
        to: customerUser.email,
        subject: `Your order #${order.orderNumber} is confirmed — ${config.company.name}`,
        html: renderEmailTemplate({
          heading: `Thanks for your order, ${order.customerName}!`,
          intro: `Your order number is <strong>#${order.orderNumber}</strong>. We'll keep you updated as it's prepared and delivered.`,
          rows: [
            ...itemRows,
            { label: 'Total', value: `<strong>₹${order.totalAmount.toLocaleString('en-IN')}</strong>` },
            { label: 'Delivery Address', value: `${order.shippingAddress.line1}, ${order.shippingAddress.city}` },
          ],
          footerNote: `Need help? Call us at ${config.company.phone}. — ${config.company.name}`,
        }),
      });
    }

    await whatsapp.sendMessage({
      to: order.customerPhone,
      message:
        `Hi ${order.customerName}, your order #${order.orderNumber} with ${config.company.name} has been placed! ` +
        `Total: ₹${order.totalAmount.toLocaleString('en-IN')}. We'll notify you as it progresses. ` +
        `For help, call ${config.company.phone}.`,
      templateName: config.whatsapp.fallbackTemplate,
      templateParams: [order.customerName, order.orderNumber],
    });
  }

  /** Sent whenever an admin moves an order to a new status — the core of order tracking. */
  async _notifyCustomerOfStatusChange(order) {
    const label = STATUS_LABELS[order.status] || order.status;
    const message =
      `Hi ${order.customerName}, your order #${order.orderNumber} is now: ${label}. ` +
      `Track it anytime: ${config.clientUrl}/account/orders/${order._id}`;

    const tasks = [
      whatsapp.sendMessage({
        to: order.customerPhone,
        message,
        templateName: config.whatsapp.fallbackTemplate,
        templateParams: [order.customerName, label],
      }),
    ];

    if (order.customerEmail) {
      tasks.push(
        sendEmail({
          to: order.customerEmail,
          subject: `Order #${order.orderNumber} update: ${label}`,
          html: renderEmailTemplate({
            heading: label,
            intro: `Your order <strong>#${order.orderNumber}</strong> has been updated.`,
            rows: [{ label: 'Status', value: label }],
            footerNote: `Track your order: <a href="${config.clientUrl}/account/orders/${order._id}" style="color:#c2410c;">${config.clientUrl}/account/orders/${order._id}</a>`,
          }),
        }),
      );
    }

    await Promise.allSettled(tasks);
  }
}

module.exports = new OrderService();
module.exports.STATUS_LABELS = STATUS_LABELS;