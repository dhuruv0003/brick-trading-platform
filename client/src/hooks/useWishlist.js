import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { wishlistAPI } from '../services/api';
import {
  setWishlist,
  setWishlistProducts,
  addToWishlistState,
  removeFromWishlistState,
  clearWishlistState,
  setWishlistLoading,
} from '../store/wishlistSlice';

export default function useWishlist() {
  const dispatch = useDispatch();
  const { items, products, loading } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.customer);
  const { enqueueSnackbar } = useSnackbar();

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    dispatch(setWishlistLoading(true));
    try {
      const response = await wishlistAPI.get();
      const wishlistProducts = response.data.data.wishlist.products || [];
      // Store both the product IDs (for isInWishlist checks) and the full product objects
      const ids = wishlistProducts.map((p) => p.product?._id).filter(Boolean);
      const fullProducts = wishlistProducts.map((p) => p.product).filter(Boolean);
      dispatch(setWishlist(ids));
      dispatch(setWishlistProducts(fullProducts));
    } catch (err) {
      console.error('Failed to fetch wishlist', err);
    } finally {
      dispatch(setWishlistLoading(false));
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const add = useCallback(async (product) => {
    if (!isAuthenticated) {
      enqueueSnackbar('Please login to add to wishlist', { variant: 'info' });
      return;
    }

    // Optimistic update — add ID and full product object
    dispatch(addToWishlistState({ id: product._id, product }));
    enqueueSnackbar('Added to wishlist', { variant: 'success' });

    try {
      await wishlistAPI.add({ productId: product._id });
    } catch (err) {
      // Revert on failure
      dispatch(removeFromWishlistState(product._id));
      enqueueSnackbar('Failed to add to wishlist', { variant: 'error' });
    }
  }, [dispatch, isAuthenticated, enqueueSnackbar]);

  const remove = useCallback(async (productId) => {
    if (!isAuthenticated) return;

    // Optimistic update
    dispatch(removeFromWishlistState(productId));
    enqueueSnackbar('Removed from wishlist', { variant: 'success' });

    try {
      await wishlistAPI.remove(productId);
    } catch (err) {
      // Re-fetch to sync state on failure
      fetchWishlist();
    }
  }, [dispatch, isAuthenticated, enqueueSnackbar, fetchWishlist]);

  const clear = useCallback(async () => {
    if (!isAuthenticated) return;
    dispatch(clearWishlistState());
  }, [dispatch, isAuthenticated]);

  const isInWishlist = useCallback((productId) => {
    return items.includes(productId);
  }, [items]);

  return {
    items,
    products,   // full product objects, ready to render
    loading,
    add,
    remove,
    clear,
    isInWishlist,
    refresh: fetchWishlist,
  };
}
