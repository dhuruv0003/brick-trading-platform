const mongoose = require('mongoose');

const quoteItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: String, // snapshot
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

const quoteSchema = new mongoose.Schema(
  {
    quoteNumber: {
      type: String,
      unique: true,
    },
    inquiry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inquiry',
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: String,
    customerType: {
      type: String,
      enum: [
        'homeowner', 'builder', 'developer', 'contractor',
        'govt_department', 'govt_contractor', 'dealer', 'trader',
        'hardware_store', 'mason', 'other',
      ],
      default: 'other',
    },
    projectLocation: String,
    projectType: String,
    items: [quoteItemSchema],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalEstimate: { type: Number, default: 0 },
    notes: String,
    adminNotes: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'sent', 'accepted', 'rejected', 'expired'],
      default: 'pending',
    },
    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    ipAddress: String,
  },
  { timestamps: true }
);

// Auto-generate quote number
quoteSchema.pre('save', async function (next) {
  if (!this.quoteNumber) {
    const count = await mongoose.model('Quote').countDocuments();
    this.quoteNumber = `QUO-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

quoteSchema.index({ status: 1, createdAt: -1 });
quoteSchema.index({ quoteNumber: 1 });

module.exports = mongoose.model('Quote', quoteSchema);
