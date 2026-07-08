const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      maxlength: 300,
    },
    images: [
      {
        url: { type: String },
        alt: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    customer: {
      name: String,
      type: {
        type: String,
        enum: ['homeowner', 'builder', 'developer', 'contractor', 'govt'],
      },
    },
    location: {
      city: String,
      state: String,
      area: String,
    },
    // NOTE: nested object fields must not use a bare `type: String` key —
    // Mongoose treats `type` as a reserved keyword meaning "this field's
    // own type is String", not "a property named type". That collision is
    // what caused bricksUsed to be cast to a plain string. Wrapping each
    // sub-field explicitly avoids the ambiguity.
    bricksUsed: {
      quantity: { type: Number },
      brickType: { type: String }, // product name (renamed from `type` to avoid the Mongoose keyword collision)
    },
    completionDate: Date,
    duration: String, // e.g., "6 months"
    projectValue: String, // optional
    category: {
      type: String,
      enum: ['residential', 'commercial', 'government', 'infrastructure', 'industrial'],
      default: 'residential',
    },
    highlights: [String],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    seoMeta: {
      title: String,
      description: String,
    },
  },
  { timestamps: true }
);

projectSchema.index({ slug: 1 });
projectSchema.index({ isFeatured: 1, isPublished: 1 });
projectSchema.index({ category: 1 });

module.exports = mongoose.model('Project', projectSchema);
