'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hydrateFromStorage } from '../../store/authSlice';
import { hydrateCustomerFromStorage } from '../../store/customerSlice';
import { hydrateCartFromStorage } from '../../store/cartSlice';
import { wishlistAPI } from '../../services/api';
import { setWishlist, setWishlistLoading } from '../../store/wishlistSlice';

/**
 * Reads persisted auth (token/user) and cart from localStorage and pushes it into
 * Redux — but only after mount, so the server-rendered HTML and the first
 * client render both start from the same neutral state.
 */
export default function AuthHydrator() {
  const dispatch = useDispatch();
  const { isAuthenticated, hydrated } = useSelector((state: any) => state.customer);

  useEffect(() => {
    dispatch(hydrateFromStorage());
    dispatch(hydrateCustomerFromStorage());
    dispatch(hydrateCartFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      const fetchWishlist = async () => {
        dispatch(setWishlistLoading(true));
        try {
          const res = await wishlistAPI.get();
          const products = res.data?.data?.wishlist?.products || [];
          const items = products.map((p: any) => (typeof p === 'string' ? p : p._id || p));
          dispatch(setWishlist(items));
        } catch (error) {
          console.error('Failed to hydrate wishlist:', error);
          dispatch(setWishlistLoading(false));
        }
      };
      fetchWishlist();
    }
  }, [hydrated, isAuthenticated, dispatch]);

  return null;
}
