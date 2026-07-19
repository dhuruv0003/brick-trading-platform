'use client';
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Divider, Button, Chip, CircularProgress,
  Alert, Stepper, Step, StepLabel, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import ReplayIcon from '@mui/icons-material/Replay';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ordersAPI } from '../../../../services/api';
import useCart from '../../../../hooks/useCart';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';

// Status stepper config — only the active forward path
const ORDER_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
const STEP_LABELS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

const STATUS_COLORS: Record<string, 'warning' | 'info' | 'primary' | 'success' | 'error' | 'default'> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'primary',
  out_for_delivery: 'primary',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'default',
};

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { add: addToCart } = useCart();
  const { enqueueSnackbar } = useSnackbar();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancel dialog
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await ordersAPI.getOne(params.id);
        setOrder(res.data.data.order);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [params.id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await ordersAPI.cancel(params.id, { reason: cancelReason });
      setOrder(res.data.data.order);
      setCancelOpen(false);
      enqueueSnackbar('Order cancelled successfully.', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to cancel order.', { variant: 'error' });
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = () => {
    if (!order?.items) return;
    order.items.forEach((item: any) => {
      // Use the populated product if available, else build a minimal stub from snapshot
      const product = item.product || {
        _id: item.product,
        name: item.productSnapshot?.name,
        images: item.productSnapshot?.image ? [{ url: item.productSnapshot.image }] : [],
        pricing: { retail: item.unitPrice },
        inStock: true,
      };
      addToCart(product, item.quantity);
    });
    enqueueSnackbar('Items added to cart!', { variant: 'success' });
    router.push('/cart');
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!order) return <Typography>Order not found.</Typography>;

  const isCancellable = ['pending', 'confirmed'].includes(order.status);
  const isCancelled = order.status === 'cancelled';
  const activeStep = ORDER_STEPS.indexOf(order.status);
  const total = order.pricing?.total ?? order.pricing?.subtotal ?? 0;
  const subtotal = order.pricing?.subtotal ?? 0;
  const tax = order.pricing?.tax ?? 0;
  const shipping = order.pricing?.shippingCharge ?? 0;
  const addr = order.shippingAddress;

  return (
    <Box>
      <Button component={Link} href="/account/orders" startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
        Back to Orders
      </Button>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} fontFamily='"Playfair Display", serif'>
            Order #{order.orderNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Placed on {dayjs(order.createdAt).format('DD MMM YYYY, hh:mm A')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={order.status.replace(/_/g, ' ').toUpperCase()}
            color={STATUS_COLORS[order.status] ?? 'default'}
          />
          {isCancellable && (
            <Button
              variant="outlined" color="error" size="small"
              startIcon={<CancelIcon />} onClick={() => setCancelOpen(true)}
            >
              Cancel Order
            </Button>
          )}
          {(order.status === 'delivered' || isCancelled) && (
            <Button
              variant="outlined" size="small"
              startIcon={<ReplayIcon />} onClick={handleReorder}
            >
              Reorder
            </Button>
          )}
        </Box>
      </Box>

      {/* ── Tracking Stepper (hide if cancelled/refunded) ─────────────────── */}
      {!isCancelled && order.status !== 'refunded' && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>Order Tracking</Typography>
          <Stepper activeStep={activeStep >= 0 ? activeStep : 0} alternativeLabel>
            {STEP_LABELS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {order.trackingNumber && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Tracking Number: <strong>{order.trackingNumber}</strong>
            </Typography>
          )}
        </Paper>
      )}

      {isCancelled && (
        <Alert severity="error" sx={{ mb: 3 }}>
          This order was cancelled{order.cancelReason ? `: "${order.cancelReason}"` : '.'}{' '}
          {order.cancelledAt && `(${dayjs(order.cancelledAt).format('DD MMM YYYY')})`}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* ── Items ─────────────────────────────────────────────────────── */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Items</Typography>
            {order.items.map((item: any) => {
              const name = item.productSnapshot?.name || item.product?.name || '—';
              const unitPrice = item.unitPrice ?? 0;
              const lineTotal = item.totalPrice ?? unitPrice * item.quantity;
              return (
                <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>{name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Qty: {item.quantity} × ₹{unitPrice.toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    ₹{lineTotal.toLocaleString()}
                  </Typography>
                </Box>
              );
            })}

            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography>₹{subtotal.toLocaleString()}</Typography>
            </Box>
            {tax > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography color="text.secondary">Tax</Typography>
                <Typography>₹{tax.toLocaleString()}</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography color="text.secondary">Shipping</Typography>
              <Typography>{shipping > 0 ? `₹${shipping.toLocaleString()}` : 'Free'}</Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={700}>Total</Typography>
              <Typography variant="h6" fontWeight={700} color="primary">₹{total.toLocaleString()}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* ── Details sidebar ───────────────────────────────────────────── */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Order Info</Typography>

            <Typography variant="body2" color="text.secondary">Payment Method</Typography>
            <Typography variant="body1" mb={1.5} textTransform="capitalize">
              {order.paymentMethod?.replace(/_/g, ' ') || '—'}
            </Typography>

            <Typography variant="body2" color="text.secondary">Payment Status</Typography>
            <Typography variant="body1" mb={1.5} textTransform="capitalize">{order.paymentStatus || '—'}</Typography>

            {order.deliveredAt && (
              <>
                <Typography variant="body2" color="text.secondary">Delivered On</Typography>
                <Typography variant="body1" mb={1.5}>
                  {dayjs(order.deliveredAt).format('DD MMM YYYY')}
                </Typography>
              </>
            )}

            {order.adminNotes && (
              <>
                <Typography variant="body2" color="text.secondary">Note from us</Typography>
                <Typography variant="body1">{order.adminNotes}</Typography>
              </>
            )}
          </Paper>

          {addr && (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={700} mb={1.5}>Shipping Address</Typography>
              <Typography variant="body1" fontWeight={600}>{addr.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">{addr.addressLine1}</Typography>
              {addr.addressLine2 && <Typography variant="body2" color="text.secondary">{addr.addressLine2}</Typography>}
              {addr.landmark && <Typography variant="body2" color="text.secondary">Near: {addr.landmark}</Typography>}
              <Typography variant="body2" color="text.secondary">
                {addr.city}, {addr.state} – {addr.pincode}
              </Typography>
              <Typography variant="body2" mt={0.5}>📞 {addr.phone}</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* ── Cancel Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Are you sure you want to cancel order #{order.orderNumber}? This cannot be undone.
          </Typography>
          <TextField
            label="Reason (optional)" multiline rows={3} fullWidth
            value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)} disabled={cancelling}>Keep Order</Button>
          <Button color="error" variant="contained" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
