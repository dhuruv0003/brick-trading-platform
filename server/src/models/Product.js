const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },
    specs: {
      size: { type: String, default: '' },        // e.g., "9" x 4.5" x 3""
      weight: { type: String, default: '' },      // e.g., "3.5 kg"
      type: { type: String, default: '' },        // e.g., "Wire Cut", "Table Mould"
      color: { type: String, default: '' },       // e.g., "Red", "Yellow"
      finish: { type: String, default: '' },      // e.g., "Smooth", "Textured"
      strength: { type: String, default: '' },    // e.g., "7.5 N/mm²"
      waterAbsorption: { type: String, default: '' },
      customFields: [{ key: String, value: String }],
    },
    pricing: {
      retail: { type: Number, default: 0 },       // per 1000 bricks
      wholesale: { type: Number, default: 0 },
      bulk: { type: Number, default: 0 },
      unit: { type: String, default: 'per 1000' },
    },
    images: [
      {
        url: { type: String },
        publicId: { type: String, default: '' }, // Cloudinary public_id, required to delete the asset later
        alt: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    inStock: {
      type: Boolean,
      default: true,
    },
    // Numeric stock tracking, added on top of the original boolean `inStock`
    // flag. `inStock` is kept for backward compatibility with existing
    // display/filtering logic. stockQuantity is the new source of truth for
    // quantity-based validation (cart limits, checkout, order creation).
    //
    // Backward-compatibility rule: products created before this field
    // existed will have stockQuantity = 0. Treat 0 as "quantity not
    // tracked for this product" rather than "zero units available" —
    // fall back to the boolean inStock check in that case so existing
    // inventory isn't silently blocked from being ordered.
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    seoMeta: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      keywords: [String],
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
