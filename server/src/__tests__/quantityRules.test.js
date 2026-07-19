const {
  getQuantityRules,
  isValidQuantity,
  getNextQuantity,
  getPreviousQuantity,
  snapToValidQuantity,
} = require('../utils/quantityRules');

describe('quantityRules — per_brick', () => {
  it('accepts 500 and 1000', () => {
    expect(isValidQuantity(500, 'per_brick')).toBe(true);
    expect(isValidQuantity(1000, 'per_brick')).toBe(true);
  });

  it('rejects 501 (not a multiple of 500)', () => {
    expect(isValidQuantity(501, 'per_brick')).toBe(false);
  });

  it('rejects 250 (below minimum and not a multiple of 500)', () => {
    expect(isValidQuantity(250, 'per_brick')).toBe(false);
  });

  it('rejects 0 and negative quantities', () => {
    expect(isValidQuantity(0, 'per_brick')).toBe(false);
    expect(isValidQuantity(-500, 'per_brick')).toBe(false);
  });

  it('exposes step=500 and minQuantity=500', () => {
    const rules = getQuantityRules('per_brick');
    expect(rules.step).toBe(500);
    expect(rules.minQuantity).toBe(500);
    expect(rules.isValidQuantity(500)).toBe(true);
    expect(rules.isValidQuantity(600)).toBe(false);
  });

  it('increments from a valid quantity to the next valid quantity', () => {
    expect(getNextQuantity(500, 'per_brick')).toBe(1000);
    expect(getNextQuantity(1000, 'per_brick')).toBe(1500);
  });

  it('decrements from a valid quantity, floored at the minimum', () => {
    expect(getPreviousQuantity(1000, 'per_brick')).toBe(500);
    expect(getPreviousQuantity(500, 'per_brick')).toBe(500);
  });

  it('snaps an arbitrary quantity up to the nearest valid boundary', () => {
    expect(snapToValidQuantity(501, 'per_brick')).toBe(1000);
    expect(snapToValidQuantity(250, 'per_brick')).toBe(500);
    expect(snapToValidQuantity(0, 'per_brick')).toBe(500);
  });
});

describe('quantityRules — bundle_1000', () => {
  it('accepts 1 and 2 bundles', () => {
    expect(isValidQuantity(1, 'bundle_1000')).toBe(true);
    expect(isValidQuantity(2, 'bundle_1000')).toBe(true);
  });

  it('rejects a non-integer quantity (1.5 bundles)', () => {
    expect(isValidQuantity(1.5, 'bundle_1000')).toBe(false);
  });

  it('rejects 0 and negative quantities', () => {
    expect(isValidQuantity(0, 'bundle_1000')).toBe(false);
    expect(isValidQuantity(-1, 'bundle_1000')).toBe(false);
  });

  it('exposes step=1 and minQuantity=1', () => {
    const rules = getQuantityRules('bundle_1000');
    expect(rules.step).toBe(1);
    expect(rules.minQuantity).toBe(1);
  });

  it('increments/decrements one bundle at a time', () => {
    expect(getNextQuantity(1, 'bundle_1000')).toBe(2);
    expect(getPreviousQuantity(2, 'bundle_1000')).toBe(1);
    expect(getPreviousQuantity(1, 'bundle_1000')).toBe(1);
  });
});

describe('quantityRules — unknown/legacy pricing type', () => {
  it('falls back to per_brick rules for backward compatibility', () => {
    expect(getQuantityRules(undefined).step).toBe(500);
    expect(getQuantityRules('something_unrecognized').minQuantity).toBe(500);
  });
});
