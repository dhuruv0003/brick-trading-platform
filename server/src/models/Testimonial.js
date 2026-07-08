const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    designation: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      default: '',
    },
    customerType: {
      type: String,
      enum: [
        'homeowner', 'builder', 'developer', 'contractor',
        'govt_department', 'govt_contractor', 'dealer', 'trader',
        'hardware_store', 'mason', 'other',
      ],
      default: 'other',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    review: {
      type: String,
      required: [true, 'Review text is required'],
    },
    avatar: {
      type: String,
      default: null,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

testimonialSchema.index({ isApproved: 1, isFeatured: 1 });
testimonialSchema.index({ rating: -1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);
