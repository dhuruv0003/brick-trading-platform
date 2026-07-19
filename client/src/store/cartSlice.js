import { createSlice } from '@reduxjs/toolkit';

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
      const { product, quantity = 1 } = action.payload;
      const id = product._id;
      const limit = getStockLimit(product);
      if (state.items[id]) {
        state.items[id].quantity = Math.min(limit, state.items[id].quantity + quantity);
        state.items[id].product = product; // keep product data (incl. stockQuantity) fresh
      } else {
        state.items[id] = { product, quantity: Math.min(limit, quantity) };
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
        const limit = getStockLimit(state.items[id].product);
        state.items[id].quantity = Math.min(limit, Math.max(1, quantity));
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
