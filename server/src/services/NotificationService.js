const Notification = require('../models/Notification');

class NotificationService {
  constructor() {
    this._io = null; // Set by server.js after socket.io is initialised
  }

  /** Called once from server.js: NotificationService.init(io) */
  init(io) {
    this._io = io;
  }

  /**
   * Create a notification, save to DB, and push to the customer's socket room.
   * @param {string|ObjectId} customerId
   * @param {{ type, title, message, link? }} payload
   */
  async send(customerId, { type = 'alert', title, message, link = '' }) {
    const notification = await Notification.create({
      customer: customerId,
      type,
      title,
      message,
      link,
    });

    // Emit to the customer's private room (they join room = their _id on connect)
    if (this._io) {
      this._io.to(customerId.toString()).emit('notification', {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        isRead: false,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  }

  /** Convenience wrappers for common notification types */
  async orderPlaced(customerId, orderNumber) {
    return this.send(customerId, {
      type: 'order',
      title: 'Order Placed',
      message: `Your order #${orderNumber} has been placed successfully.`,
      link: `/account/orders`,
    });
  }

  async orderStatusChanged(customerId, orderNumber, newStatus) {
    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being prepared.',
      processing: 'Your order is now being processed.',
      shipped: `Your order #${orderNumber} has been shipped and is on its way!`,
      out_for_delivery: `Your order #${orderNumber} is out for delivery today.`,
      delivered: `Your order #${orderNumber} has been delivered. Enjoy!`,
      cancelled: `Your order #${orderNumber} has been cancelled.`,
    };

    return this.send(customerId, {
      type: 'order',
      title: `Order ${newStatus.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`,
      message: statusMessages[newStatus] || `Order #${orderNumber} status updated to ${newStatus}.`,
      link: `/account/orders`,
    });
  }

  async profileUpdated(customerId) {
    return this.send(customerId, {
      type: 'profile',
      title: 'Profile Updated',
      message: 'Your profile information was updated successfully.',
      link: '/account/profile',
    });
  }
}

module.exports = new NotificationService();
