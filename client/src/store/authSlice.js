import { createSlice } from '@reduxjs/toolkit';

// IMPORTANT: never read localStorage here. This module runs during SSR too,
// where `window` is undefined, so any value derived from localStorage would
// differ between the server-rendered HTML and the client's first render —
// causing a React hydration mismatch. Instead we always start "logged out"
// and hydrate real auth state client-side via `hydrateFromStorage` (dispatched
// once from a top-level effect after mount, see components/common/Providers).
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateFromStorage: (state) => {
      if (typeof window === 'undefined') return;
      try {
        const token = localStorage.getItem('brickpro_token');
        const rawUser = localStorage.getItem('brickpro_user');
        state.token = token || null;
        state.user = rawUser ? JSON.parse(rawUser) : null;
        state.isAuthenticated = !!token;
      } catch {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      } finally {
        state.hydrated = true;
      }
    },
    loginStart: (state) => { state.loading = true; state.error = null; },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.setItem('brickpro_token', action.payload.token);
        localStorage.setItem('brickpro_user', JSON.stringify(action.payload.user));
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('brickpro_token');
        localStorage.removeItem('brickpro_user');
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      if (typeof window !== 'undefined') {
        localStorage.setItem('brickpro_user', JSON.stringify(state.user));
      }
    },
    clearError: (state) => { state.error = null; },
  },
});

export const { hydrateFromStorage, loginStart, loginSuccess, loginFailure, logout, updateUser, clearError } = authSlice.actions;
export default authSlice.reducer;
