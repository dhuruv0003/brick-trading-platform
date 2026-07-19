/**
 * quantityRules.js
 * -----------------
 * Single source of truth for brick order-quantity increment rules.
 *
 * This exact logic is mirrored on the client at
 * `client/src/lib/quantityRules.js`. Node cannot import a client file
 * directly (different bundlers/module systems), so the two files are kept
 * hand-in-sync deliberately. If you change a rule here, change it there too.
 * The constants and function names/shapes are identical on both sides on
 * purpose, to make that mirroring easy to verify at a glance.
 *
 * Business rule:
 *  - "per_brick": product is priced/sold as individual bricks. Quantity
 *    must always be a multiple of 500, minimum order quantity is 500.
 *  - "bundle_1000": product is priced/sold as a 1000-brick bundle, and the
 *    bundle is indivisible. `quantity` represents "number of bundles", not
 *    "number of bricks" — so it moves 1 at a time, minimum 1.
 */

const PRICING_TYPES = Object.freeze({
  PER_BRICK: 'per_brick',
  BUNDLE_1000: 'bundle_1000',
});

const DEFAULT_PRICING_TYPE = PRICING_TYPES.PER_BRICK;

const RULES = Object.freeze({
  [PRICING_TYPES.PER_BRICK]: Object.freeze({ step: 500, minQuantity: 500 }),
  [PRICING_TYPES.BUNDLE_1000]: Object.freeze({ step: 1, minQuantity: 1 }),
});

/**
 * Resolve a product's pricing type, defaulting to 'per_brick' for legacy
 * products created before this field existed.
 */
function resolvePricingType(pricingType) {
  return RULES[pricingType] ? pricingType : DEFAULT_PRICING_TYPE;
}

/**
 * Given a product's pricing type, return { step, minQuantity, isValidQuantity }.
 */
function getQuantityRules(pricingType) {
  const resolved = resolvePricingType(pricingType);
  const { step, minQuantity } = RULES[resolved];

  return {
    step,
    minQuantity,
    isValidQuantity: (qty) => isValidQuantity(qty, resolved),
  };
}

/**
 * Standalone validity check: integer, >= minQuantity, and lands exactly on
 * a step boundary from minQuantity.
 */
function isValidQuantity(qty, pricingType) {
  const resolved = resolvePricingType(pricingType);
  const { step, minQuantity } = RULES[resolved];

  if (typeof qty !== 'number' || !Number.isInteger(qty)) return false;
  if (qty < minQuantity) return false;
  return (qty - minQuantity) % step === 0;
}

/**
 * Smallest valid quantity that is >= the given quantity (used to snap an
 * arbitrary/invalid input up to the nearest legal value).
 */
function snapToValidQuantity(qty, pricingType) {
  const resolved = resolvePricingType(pricingType);
  const { step, minQuantity } = RULES[resolved];

  const n = Number.isFinite(qty) ? Math.ceil(qty) : minQuantity;
  if (n <= minQuantity) return minQuantity;
  const remainder = (n - minQuantity) % step;
  return remainder === 0 ? n : n + (step - remainder);
}

/**
 * Next valid quantity when incrementing from a (presumed valid) quantity.
 */
function getNextQuantity(qty, pricingType) {
  const { step, minQuantity } = getQuantityRules(pricingType);
  if (!Number.isInteger(qty) || qty < minQuantity) return minQuantity;
  return qty + step;
}

/**
 * Previous valid quantity when decrementing, floored at minQuantity.
 */
function getPreviousQuantity(qty, pricingType) {
  const { step, minQuantity } = getQuantityRules(pricingType);
  const prev = (Number.isInteger(qty) ? qty : minQuantity) - step;
  return prev < minQuantity ? minQuantity : prev;
}

/**
 * Human-readable explanation of the rule for a given pricing type, used in
 * error messages and UI helper text.
 */
function describeRule(pricingType) {
  const resolved = resolvePricingType(pricingType);
  if (resolved === PRICING_TYPES.BUNDLE_1000) {
    return 'quantity must be a whole number of bundles (minimum 1)';
  }
  return 'quantity must be a multiple of 500 (minimum 500)';
}

module.exports = {
  PRICING_TYPES,
  DEFAULT_PRICING_TYPE,
  getQuantityRules,
  isValidQuantity,
  snapToValidQuantity,
  getNextQuantity,
  getPreviousQuantity,
  describeRule,
};
