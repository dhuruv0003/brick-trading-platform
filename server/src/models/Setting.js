const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'array', 'object', 'json'],
      default: 'string',
    },
    group: {
      type: String,
      enum: ['general', 'contact', 'social', 'seo', 'email', 'ai', 'other'],
      default: 'general',
    },
    label: String,
    description: String,
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

settingSchema.index({ key: 1 });
settingSchema.index({ group: 1, isPublic: 1 });

module.exports = mongoose.model('Setting', settingSchema);
