// Single source of truth for order status display, matching the
// server-side Order model's status enum and STATUS_LABELS in
// server/src/services/OrderService.js. Kept in plain, everyday language —
// no fulfillment/logistics jargon — since this app's customers are
// non-technical, mostly ordering from tier-3 cities on their phones.

export const ORDER_STATUSES = [
  'placed',
  'confirmed',
  'preparing',
  'ready_for_dispatch',
  'out_for_delivery',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = {
  placed: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready_for_dispatch: 'Ready for Dispatch',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const STATUS_COLORS: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error' | 'secondary'> = {
  placed: 'info',
  confirmed: 'secondary',
  preparing: 'warning',
  ready_for_dispatch: 'warning',
  out_for_delivery: 'warning',
  delivered: 'success',
  cancelled: 'error',
};

// The linear happy-path order for the tracking timeline. "cancelled" is
// handled separately in the UI (shown as a stopped/red state, not a step
// in this sequence).
export const TRACKING_STEPS: OrderStatus[] = [
  'placed', 'confirmed', 'preparing', 'ready_for_dispatch', 'out_for_delivery', 'delivered',
];
