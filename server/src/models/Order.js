const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: String, // snapshot — survives product edits/deletion
  productImage: String, // snapshot
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  unit: {
    type: String,
    default: 'pieces',
  },
  priceType: {
    type: String,
    enum: ['retail', 'wholesale', 'bulk', 'custom'],
    default: 'retail',
  },
  unitPrice: Number,
  totalPrice: Number,
});

// Snapshot of the address at the time the order was placed, so later edits
// (or deletion) of the customer's saved address book never change what was
// actually recorded for an already-placed order.
const orderAddressSchema = new mongoose.Schema(
  {
    label: String,
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false },
);

// Customer-facing status set. Kept simple and in plain English on purpose
// (this app is used by people in tier-3 cities who don't think in terms of
// "quotes" or "fulfillment jargon") — these are the exact labels shown as
// the tracking timeline on the order detail page.
const ORDER_STATUSES = [
  'placed',
  'confirmed',
  'preparing',
  'ready_for_dispatch',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    note: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Denormalized snapshot so admin order lists/emails don't need to
    // populate the customer for basic display, mirroring how Quote already
    // stores name/phone/email directly rather than only a ref.
    customerName: String,
    customerPhone: String,
    customerEmail: String,

    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, 'An order must have at least one item.'],
    },
    shippingAddress: {
      type: orderAddressSchema,
      required: true,
    },

    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },

    notes: String, // customer-provided note at checkout

    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'placed',
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: () => [{ status: 'placed' }],
    },
    cancelReason: String,

    // No payment gateway is integrated (by design, Phase 1). This exists
    // only so the invoice section and admin UI have a place to reflect
    // "paid on delivery" / "unpaid" state without implying any online
    // payment flow.
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },

    // Populated once an admin generates an invoice for a delivered order.
    // Left null until that happens — the invoice section on the customer
    // side simply has nothing to show until then (see OrderService).
    invoice: {
      number: String,
      generatedAt: Date,
      fileUrl: String,
    },

    ipAddress: String,
  },
  { timestamps: true },
);

orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

orderSchema.statics.STATUSES = ORDER_STATUSES;

module.exports = mongoose.model('Order', orderSchema);