import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: {},      // { [productId]: { product, quantity } }
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const id = product._id;
      if (state.items[id]) {
        state.items[id].quantity += quantity;
      } else {
        state.items[id] = { product, quantity };
      }
    },
    removeItem: (state, action) => {
      delete state.items[action.payload];
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      if (state.items[id]) {
        state.items[id].quantity = Math.max(1, quantity);
      }
    },
    clearCart: (state) => { state.items = {}; },
    toggleCart: (state) => { state.isOpen = !state.isOpen; },
  },
});

export const cartItemCount = (state) => Object.values(state.cart.items).reduce((sum, i) => sum + i.quantity, 0);
export const cartItemsList = (state) => Object.values(state.cart.items);

export const { addItem, removeItem, updateQuantity, clearCart, toggleCart } = cartSlice.actions;
export default cartSlice.reducer;
