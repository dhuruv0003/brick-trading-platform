import { createSlice } from '@reduxjs/toolkit';
import { getQuantityRules, getProductPricingType, snapToValidQuantity } from '../lib/quantityRules';

const initialState = {
  items: {},      // { [productId]: { product, quantity } }
  isOpen: false,
};

// A product's stockQuantity of 0 means "quantity not tracked for this
// product" (backward compatibility with products created before this field
// existed) — in that case we don't cap quantity here at all, and fall back
// to the existing boolean `inStock` check done elsewhere. Only a positive
// stockQuantity acts as a real ceiling.
const getStockLimit = (product) => {
  const qty = product?.stockQuantity;
  return typeof qty === 'number' && qty > 0 ? qty : Infinity;
};

// Clamp to the stock limit, then snap down/up onto a valid step boundary
// for the product's pricing type (never below minQuantity, never above the
// stock limit's nearest valid-below value).
const resolveQuantity = (product, requested) => {
  const pricingType = getProductPricingType(product);
  const { minQuantity, step } = getQuantityRules(pricingType);
  const stockLimit = getStockLimit(product);

  let qty = snapToValidQuantity(requested, pricingType);
  if (qty > stockLimit) {
    // Snap back down to the highest valid quantity that still fits the
    // stock limit (never below minQuantity, even if that exceeds stock —
    // in that edge case the item simply can't be ordered, which is
    // surfaced elsewhere via the existing stock-limit UI messaging).
    const stepsBelow = Math.floor((stockLimit - minQuantity) / step);
    qty = stepsBelow >= 0 ? minQuantity + stepsBelow * step : minQuantity;
  }
  return qty;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateCartFromStorage: (state) => {
      if (typeof window !== 'undefined') {
        const storedCart = localStorage.getItem('brickpro_cart');
        if (storedCart) {
          try {
            state.items = JSON.parse(storedCart);
          } catch (e) {
            console.error('Failed to parse cart from storage', e);
          }
        }
      }
    },
    addItem: (state, action) => {
      const { product, quantity } = action.payload;
      const id = product._id;
      const pricingType = getProductPricingType(product);
      const { minQuantity } = getQuantityRules(pricingType);
      // No quantity passed → default to the product's minimum valid
      // quantity (500 for per-brick, 1 for a bundle), not a hardcoded 1.
      const requestedIncrement = typeof quantity === 'number' ? quantity : minQuantity;

      if (state.items[id]) {
        state.items[id].quantity = resolveQuantity(product, state.items[id].quantity + requestedIncrement);
        state.items[id].product = product; // keep product data (incl. stockQuantity) fresh
      } else {
        state.items[id] = { product, quantity: resolveQuantity(product, requestedIncrement) };
      }
      if (typeof window !== 'undefined') localStorage.setItem('brickpro_cart', JSON.stringify(state.items));
    },
    removeItem: (state, action) => {
      delete state.items[action.payload];
      if (typeof window !== 'undefined') localStorage.setItem('brickpro_cart', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      if (state.items[id]) {
        state.items[id].quantity = resolveQuantity(state.items[id].product, quantity);
        if (typeof window !== 'undefined') localStorage.setItem('brickpro_cart', JSON.stringify(state.items));
      }
    },
    clearCart: (state) => {
      state.items = {};
      if (typeof window !== 'undefined') localStorage.removeItem('brickpro_cart');
    },
    toggleCart: (state) => { state.isOpen = !state.isOpen; },
  },
});

export const cartItemCount = (state) => Object.values(state.cart.items).reduce((sum, i) => sum + i.quantity, 0);
export const cartItemsList = (state) => Object.values(state.cart.items);

export const { hydrateCartFromStorage, addItem, removeItem, updateQuantity, clearCart, toggleCart } = cartSlice.actions;
export default cartSlice.reducer;
