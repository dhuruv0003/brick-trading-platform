const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    customerType: {
      type: String,
      enum: [
        'homeowner',
        'builder',
        'developer',
        'contractor',
        'govt_department',
        'govt_contractor',
        'dealer',
        'trader',
        'hardware_store',
        'mason',
        'other',
      ],
      default: 'other',
    },
    subject: {
      type: String,
      default: 'General Inquiry',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    source: {
      type: String,
      enum: ['website', 'whatsapp', 'call', 'walk_in', 'referral', 'other'],
      default: 'website',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'converted', 'closed', 'spam'],
      default: 'new',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: [
      {
        text: String,
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    followUpDate: {
      type: Date,
      default: null,
    },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

inquirySchema.index({ status: 1, createdAt: -1 });
inquirySchema.index({ customerType: 1 });
inquirySchema.index({ assignedTo: 1 });
inquirySchema.index({ phone: 1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
