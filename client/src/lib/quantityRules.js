/**
 * quantityRules.js
 * -----------------
 * Single source of truth (client side) for brick order-quantity increment
 * rules. This exact logic is mirrored on the server at
 * `server/src/utils/quantityRules.js`. Node cannot import this client file
 * directly, so the two are kept hand-in-sync deliberately — if you change a
 * rule here, change it there too. Constants/function names/shapes are
 * identical on both sides on purpose, to make that mirroring easy to verify.
 *
 * Business rule:
 *  - "per_brick": product is priced/sold as individual bricks. Quantity
 *    must always be a multiple of 500, minimum order quantity is 500.
 *  - "bundle_1000": product is priced/sold as a 1000-brick bundle, and the
 *    bundle is indivisible. `quantity` represents "number of bundles", not
 *    "number of bricks" — so it moves 1 at a time, minimum 1.
 */

export const PRICING_TYPES = Object.freeze({
  PER_BRICK: 'per_brick',
  BUNDLE_1000: 'bundle_1000',
});

export const DEFAULT_PRICING_TYPE = PRICING_TYPES.PER_BRICK;

const RULES = Object.freeze({
  [PRICING_TYPES.PER_BRICK]: Object.freeze({ step: 500, minQuantity: 500 }),
  [PRICING_TYPES.BUNDLE_1000]: Object.freeze({ step: 1, minQuantity: 1 }),
});

function resolvePricingType(pricingType) {
  return RULES[pricingType] ? pricingType : DEFAULT_PRICING_TYPE;
}

/** Given a product's pricing type, return { step, minQuantity, isValidQuantity }. */
export function getQuantityRules(pricingType) {
  const resolved = resolvePricingType(pricingType);
  const { step, minQuantity } = RULES[resolved];

  return {
    step,
    minQuantity,
    isValidQuantity: (qty) => isValidQuantity(qty, resolved),
  };
}

export function isValidQuantity(qty, pricingType) {
  const resolved = resolvePricingType(pricingType);
  const { step, minQuantity } = RULES[resolved];

  if (typeof qty !== 'number' || !Number.isInteger(qty)) return false;
  if (qty < minQuantity) return false;
  return (qty - minQuantity) % step === 0;
}

/** Smallest valid quantity that is >= the given quantity. */
export function snapToValidQuantity(qty, pricingType) {
  const resolved = resolvePricingType(pricingType);
  const { step, minQuantity } = RULES[resolved];

  const n = Number.isFinite(qty) ? Math.ceil(qty) : minQuantity;
  if (n <= minQuantity) return minQuantity;
  const remainder = (n - minQuantity) % step;
  return remainder === 0 ? n : n + (step - remainder);
}

/** Next valid quantity when incrementing from a (presumed valid) quantity. */
export function getNextQuantity(qty, pricingType) {
  const { step, minQuantity } = getQuantityRules(pricingType);
  if (!Number.isInteger(qty) || qty < minQuantity) return minQuantity;
  return qty + step;
}

/** Previous valid quantity when decrementing, floored at minQuantity. */
export function getPreviousQuantity(qty, pricingType) {
  const { step, minQuantity } = getQuantityRules(pricingType);
  const prev = (Number.isInteger(qty) ? qty : minQuantity) - step;
  return prev < minQuantity ? minQuantity : prev;
}

/** Human-readable explanation of the rule, used for inline helper/error text. */
export function describeRule(pricingType) {
  const resolved = resolvePricingType(pricingType);
  if (resolved === PRICING_TYPES.BUNDLE_1000) {
    return 'Quantity must be a whole number of bundles (minimum 1).';
  }
  return 'Quantity must be a multiple of 500 (minimum 500).';
}

/** Convenience: read a product's pricing type with the same default fallback. */
export function getProductPricingType(product) {
  return resolvePricingType(product?.pricing?.type);
}
