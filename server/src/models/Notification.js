const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // Nullable now — admin notifications (forAdmin: true) have no
    // customer. Customer notifications still always set this.
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
      index: true,
    },
    // Distinguishes an admin-facing notification (visible to any admin/
    // manager/staff user, not scoped to one recipient) from a
    // customer-facing one. Kept as a simple boolean flag — following the
    // same lightweight-flag convention already used elsewhere in this
    // schema (isRead) — rather than introducing a parallel model.
    forAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
    type: {
      type: String,
      enum: ['order', 'profile', 'alert', 'promotion'],
      default: 'alert',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Fast lookup for "unread admin notifications" / "unread customer notifications"
notificationSchema.index({ forAdmin: 1, isRead: 1, createdAt: -1 });

// Auto-delete notifications older than 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('Notification', notificationSchema);
