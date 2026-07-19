import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, removeItem, updateQuantity, clearCart, toggleCart, cartItemCount, cartItemsList } from '../store/cartSlice';

const getStockLimit = (product) => {
  const qty = product?.stockQuantity;
  return typeof qty === 'number' && qty > 0 ? qty : Infinity;
};

export default function useCart() {
  const dispatch = useDispatch();
  const { items, isOpen } = useSelector((state) => state.cart);
  const count = useSelector(cartItemCount);
  const itemsList = useSelector(cartItemsList);

  const total = itemsList.reduce((sum, item) => sum + (item.product.pricing?.retail || 0) * item.quantity, 0);

  /**
   * Adds a product to the cart. Returns { clamped: boolean, limit?: number }
   * so callers can show a "only N left in stock" message when the
   * requested quantity exceeded the product's tracked stockQuantity.
   */
  const add = useCallback((product, quantity = 1) => {
    const limit = getStockLimit(product);
    const existingQty = items[product._id]?.quantity || 0;
    const requestedTotal = existingQty + quantity;
    const clamped = requestedTotal > limit;
    dispatch(addItem({ product, quantity }));
    return { clamped, limit: clamped ? limit : undefined };
  }, [dispatch, items]);

  const remove = useCallback((productId) => {
    dispatch(removeItem(productId));
  }, [dispatch]);

  /**
   * Updates a line item's quantity. Returns { clamped: boolean, limit?: number }
   * the same way `add` does.
   */
  const update = useCallback((productId, quantity) => {
    const product = items[productId]?.product;
    const limit = getStockLimit(product);
    const clamped = quantity > limit;
    dispatch(updateQuantity({ id: productId, quantity }));
    return { clamped, limit: clamped ? limit : undefined };
  }, [dispatch, items]);

  const clear = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  const toggle = useCallback(() => {
    dispatch(toggleCart());
  }, [dispatch]);

  return {
    items, // Record<id, {product, quantity}>
    itemsList, // Array<{product, quantity}>
    count,
    total,
    isOpen,
    add,
    remove,
    update,
    clear,
    toggle,
  };
}
