import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  customer: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  hydrated: false,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    hydrateCustomerFromStorage: (state) => {
      if (typeof window !== 'undefined') {
        let token = localStorage.getItem('brickpro_customer_token');
        let customer = localStorage.getItem('brickpro_customer');

        if (!token) {
          token = sessionStorage.getItem('brickpro_customer_token');
          customer = sessionStorage.getItem('brickpro_customer');
        }

        if (token && customer) {
          state.token = token;
          state.customer = JSON.parse(customer);
          state.isAuthenticated = true;
        }
      }
      state.hydrated = true;
    },
    customerLoginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    customerLoginSuccess: (state, action) => {
      const { customer, token, rememberMe } = action.payload;
      state.loading = false;
      state.isAuthenticated = true;
      state.customer = customer;
      state.token = token;
      state.error = null;

      if (typeof window !== 'undefined') {
        const storage = rememberMe ? localStorage : sessionStorage;
        const otherStorage = rememberMe ? sessionStorage : localStorage;
        
        otherStorage.removeItem('brickpro_customer_token');
        otherStorage.removeItem('brickpro_customer');
        
        storage.setItem('brickpro_customer_token', token);
        storage.setItem('brickpro_customer', JSON.stringify(customer));
      }
    },
    customerLoginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.customer = null;
      state.token = null;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('brickpro_customer_token');
        localStorage.removeItem('brickpro_customer');
        sessionStorage.removeItem('brickpro_customer_token');
        sessionStorage.removeItem('brickpro_customer');
      }
    },
    customerLogout: (state) => {
      state.customer = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('brickpro_customer_token');
        localStorage.removeItem('brickpro_customer');
        sessionStorage.removeItem('brickpro_customer_token');
        sessionStorage.removeItem('brickpro_customer');
      }
    },
    updateCustomer: (state, action) => {
      state.customer = { ...state.customer, ...action.payload };
      if (typeof window !== 'undefined') {
        if (sessionStorage.getItem('brickpro_customer_token')) {
          sessionStorage.setItem('brickpro_customer', JSON.stringify(state.customer));
        } else {
          localStorage.setItem('brickpro_customer', JSON.stringify(state.customer));
        }
      }
    },
    clearCustomerError: (state) => {
      state.error = null;
    },
  },
});

export const {
  hydrateCustomerFromStorage,
  customerLoginStart,
  customerLoginSuccess,
  customerLoginFailure,
  customerLogout,
  updateCustomer,
  clearCustomerError,
} = customerSlice.actions;

export default customerSlice.reducer;
