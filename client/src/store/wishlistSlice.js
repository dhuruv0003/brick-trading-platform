import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],    // Array of product IDs (for fast isInWishlist checks)
  products: [], // Array of full product objects (for rendering the wishlist page)
  loading: false,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload; // array of IDs
      state.loading = false;
    },
    setWishlistProducts: (state, action) => {
      state.products = action.payload; // array of full product objects
    },
    setWishlistLoading: (state, action) => {
      state.loading = action.payload;
    },
    addToWishlistState: (state, action) => {
      const { id, product } = action.payload;
      if (!state.items.includes(id)) {
        state.items.push(id);
        state.products.push(product);
      }
    },
    removeFromWishlistState: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((id) => id !== productId);
      state.products = state.products.filter((p) => p._id !== productId);
    },
    clearWishlistState: (state) => {
      state.items = [];
      state.products = [];
    },
  },
});

export const {
  setWishlist,
  setWishlistProducts,
  setWishlistLoading,
  addToWishlistState,
  removeFromWishlistState,
  clearWishlistState,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
