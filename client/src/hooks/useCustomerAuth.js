import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { customerAuthAPI } from '../services/api';
import {
  customerLoginStart,
  customerLoginSuccess,
  customerLoginFailure,
  customerLogout,
  updateCustomer,
} from '../store/customerSlice';
import { addItem, clearCart } from '../store/cartSlice';
import { clearWishlistState } from '../store/wishlistSlice';

export default function useCustomerAuth() {
  const dispatch = useDispatch();
  const { customer, token, isAuthenticated, loading, error, hydrated } = useSelector((state) => state.customer);
  const cartItems = useSelector((state) => state.cart.items);

  /**
   * Merges the current guest cart into Redux state after login.
   * Adds only items not already in cart (avoids duplicates).
   * Cart is already in Redux state — no separate merge needed since
   * the cart slice reads from localStorage on hydration.
   */
  const mergeGuestCart = useCallback(
    (guestCart) => {
      // guestCart is Record<productId, { product, quantity }>
      Object.values(guestCart).forEach((item) => {
        dispatch(addItem({ product: item.product, quantity: item.quantity }));
      });
    },
    [dispatch],
  );

  const login = useCallback(
    async (email, password, rememberMe = false) => {
      // Snapshot guest cart before login clears it
      const guestCartSnapshot = { ...cartItems };

      dispatch(customerLoginStart());
      try {
        const response = await customerAuthAPI.login({ email, password });
        dispatch(
          customerLoginSuccess({
            customer: response.data.data.customer,
            token: response.data.token,
            rememberMe,
          }),
        );

        // Merge guest cart into the now-authenticated session
        if (Object.keys(guestCartSnapshot).length > 0) {
          mergeGuestCart(guestCartSnapshot);
        }

        return { success: true };
      } catch (err) {
        const message = err.response?.data?.message || 'Login failed. Please try again.';
        dispatch(customerLoginFailure(message));
        return { success: false, message };
      }
    },
    [dispatch, cartItems, mergeGuestCart],
  );

  const register = useCallback(
    async (data) => {
      // Snapshot guest cart before registration
      const guestCartSnapshot = { ...cartItems };

      dispatch(customerLoginStart());
      try {
        const response = await customerAuthAPI.register(data);
        dispatch(
          customerLoginSuccess({
            customer: response.data.data.customer,
            token: response.data.token,
          }),
        );

        // Preserve guest cart on new account creation too
        if (Object.keys(guestCartSnapshot).length > 0) {
          mergeGuestCart(guestCartSnapshot);
        }

        return { success: true };
      } catch (err) {
        const message = err.response?.data?.message || 'Registration failed. Please try again.';
        dispatch(customerLoginFailure(message));
        return { success: false, message };
      }
    },
    [dispatch, cartItems, mergeGuestCart],
  );

  const logout = useCallback(async () => {
    try {
      await customerAuthAPI.logout();
    } catch (err) {
      console.error('Logout API failed', err);
    }
    dispatch(customerLogout());
    dispatch(clearCart());
    dispatch(clearWishlistState());
  }, [dispatch]);

  const checkAuth = useCallback(async () => {
    if (!token) return;
    try {
      const response = await customerAuthAPI.getMe();
      dispatch(updateCustomer(response.data.data.customer));
    } catch (err) {
      if (err.response?.status === 401) {
        dispatch(customerLogout());
      }
    }
  }, [dispatch, token]);

  return {
    customer,
    token,
    isAuthenticated,
    loading,
    error,
    hydrated,
    login,
    register,
    logout,
    checkAuth,
  };
}
