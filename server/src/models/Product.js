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
      // IMPORTANT: retail/wholesale/bulk are price PER BRICK when
      // pricing.type is 'per_brick' (they get multiplied directly by the
      // order quantity, which is counted in bricks) — do NOT enter a
      // "per 1000 bricks" total here for per_brick products, or orders
      // will be overcharged ~1000x. When pricing.type is 'bundle_1000',
      // these fields ARE the price per whole 1000-brick bundle, since
      // quantity there counts bundles, not bricks.
      retail: { type: Number, default: 0 },
      wholesale: { type: Number, default: 0 },
      bulk: { type: Number, default: 0 },
      unit: { type: String, default: 'per brick' }, // free-text display label only, e.g. "per brick", "per 1000 bricks bundle"
      // Structured pricing type that drives quantity-increment rules
      // (see server/src/utils/quantityRules.js). Unlike `unit` above,
      // this is a controlled value, not display text.
      //  - 'per_brick':   sold as individual bricks; quantity must be a
      //                   multiple of 500, minimum 500.
      //  - 'bundle_1000': sold as an indivisible 1000-brick bundle;
      //                   quantity = number of bundles, minimum 1, step 1.
      // Defaults to 'per_brick' for backward compatibility with products
      // created before this field existed.
      type: { type: String, enum: ['per_brick', 'bundle_1000'], default: 'per_brick' },
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
