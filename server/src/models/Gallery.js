const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    thumbnail: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: ['products', 'projects', 'factory', 'transport', 'team', 'events', 'other'],
      default: 'other',
    },
    tags: [String],
    altText: {
      type: String,
      default: '',
    },
    caption: {
      type: String,
      default: '',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

gallerySchema.index({ category: 1, isActive: 1 });
gallerySchema.index({ sortOrder: 1 });

module.exports = mongoose.model('Gallery', gallerySchema);
