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
        let token = localStorage.getItem('brickpro_token');
        let rawUser = localStorage.getItem('brickpro_user');
        
        if (!token) {
          token = sessionStorage.getItem('brickpro_token');
          rawUser = sessionStorage.getItem('brickpro_user');
        }

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
      const { user, token, rememberMe } = action.payload;
      state.loading = false;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
      if (typeof window !== 'undefined') {
        const storage = rememberMe ? localStorage : sessionStorage;
        const otherStorage = rememberMe ? sessionStorage : localStorage;
        
        otherStorage.removeItem('brickpro_token');
        otherStorage.removeItem('brickpro_user');
        
        storage.setItem('brickpro_token', token);
        storage.setItem('brickpro_user', JSON.stringify(user));
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
        sessionStorage.removeItem('brickpro_token');
        sessionStorage.removeItem('brickpro_user');
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      if (typeof window !== 'undefined') {
        if (sessionStorage.getItem('brickpro_token')) {
          sessionStorage.setItem('brickpro_user', JSON.stringify(state.user));
        } else {
          localStorage.setItem('brickpro_user', JSON.stringify(state.user));
        }
      }
    },
    clearError: (state) => { state.error = null; },
  },
});

export const { hydrateFromStorage, loginStart, loginSuccess, loginFailure, logout, updateUser, clearError } = authSlice.actions;
export default authSlice.reducer;
