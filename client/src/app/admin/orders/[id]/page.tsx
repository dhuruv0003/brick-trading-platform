'use client';
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Divider, Button, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Alert, Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { adminOrdersAPI } from '../../../../services/api';
import dayjs from 'dayjs';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

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

export default function AdminOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id as string;
  const { enqueueSnackbar } = useSnackbar();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await adminOrdersAPI.getOne(orderId);
      setOrder(res.data.data.order);
      setStatus(res.data.data.order.status);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      const res = await adminOrdersAPI.update(orderId, { status });
      // Re-fetch rather than trust the local `status` value alone, since
      // the response also carries the freshly-computed validNextStatuses
      // for whatever status we just moved into.
      setOrder(res.data.data.order);
      setStatus(res.data.data.order.status);
      enqueueSnackbar('Order status updated successfully.', { variant: 'success' });
    } catch (err: any) {
      // AppError messages are now correctly preserved end-to-end (see
      // AppError.js fix), so a rejected transition surfaces a specific,
      // actionable message here instead of an empty string.
      enqueueSnackbar(err.response?.data?.message || 'Failed to update order status.', { variant: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!order) return <Typography>Order not found</Typography>;

  // Only the current status plus whatever the backend's state machine
  // actually allows next — this is what prevents the admin from picking
  // an illegal transition (e.g. pending -> processing, skipping
  // "confirmed") and hitting a rejected update with no indication why.
  const selectableStatuses = Array.from(new Set([order.status, ...(order.validNextStatuses || [])]));

  const subtotal = order.pricing?.subtotal ?? 0;
  const tax = order.pricing?.tax ?? 0;
  const shipping = order.pricing?.shippingCharge ?? 0;
  const discount = order.pricing?.discount ?? 0;
  const total = order.pricing?.total ?? 0;
  const addr = order.shippingAddress;

  return (
    <Box>
      <Button component={Link} href="/admin/orders" startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
        Back to Orders
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Order #{order.orderNumber}
          </Typography>
          <Chip
            label={STATUS_LABELS[order.status] || order.status}
            color={STATUS_COLORS[order.status] ?? 'default'}
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
              {selectableStatuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {STATUS_LABELS[s] || s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            disabled={updating || status === order.status || selectableStatuses.length <= 1}
            onClick={handleUpdateStatus}
          >
            {updating ? 'Updating...' : 'Update Status'}
          </Button>
        </Box>
      </Box>

      {(order.validNextStatuses || []).length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          This order is in a final state ({STATUS_LABELS[order.status] || order.status}) and cannot be changed further.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Order Items</Typography>
            {order.items.map((item: any) => {
              const name = item.productSnapshot?.name || item.product?.name || 'Item';
              const unitPrice = item.unitPrice ?? 0;
              const lineTotal = item.totalPrice ?? unitPrice * item.quantity;
              return (
                <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      component={item.product ? Link : 'span'}
                      href={item.product ? `/admin/products/${item.product._id || item.product}` : undefined}
                      sx={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {name}
                    </Typography>
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
            {discount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography color="text.secondary">Discount</Typography>
                <Typography color="error.main">-₹{discount.toLocaleString()}</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography color="text.secondary">Shipping</Typography>
              <Typography>{shipping > 0 ? `₹${shipping.toLocaleString()}` : 'Free'}</Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={700}>Total Amount</Typography>
              <Typography variant="h6" fontWeight={700}>₹{total.toLocaleString()}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Customer Details</Typography>
            {order.customer ? (
              <>
                <Typography variant="body1">{order.customer.firstName} {order.customer.lastName}</Typography>
                <Typography variant="body2" color="text.secondary">{order.customer.email}</Typography>
                <Typography variant="body2" color="text.secondary">{order.customer.phone}</Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">Guest Customer</Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" fontWeight={700} mb={2}>Shipping Address</Typography>
            {addr ? (
              <Box>
                <Typography variant="body1">{addr.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">{addr.addressLine1}</Typography>
                {addr.addressLine2 && <Typography variant="body2" color="text.secondary">{addr.addressLine2}</Typography>}
                {addr.landmark && <Typography variant="body2" color="text.secondary">Near: {addr.landmark}</Typography>}
                <Typography variant="body2" color="text.secondary">
                  {addr.city}, {addr.state} {addr.pincode}
                </Typography>
                <Typography variant="body2" color="text.secondary">Phone: {addr.phone}</Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">N/A</Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" fontWeight={700} mb={1}>Payment</Typography>
            <Typography variant="body2" color="text.secondary">Method: {order.paymentMethod?.toUpperCase()}</Typography>
            <Typography variant="body2" color="text.secondary">Status: {order.paymentStatus}</Typography>
            <Typography variant="body2" color="text.secondary">Date Placed: {dayjs(order.createdAt).format('DD MMM YYYY, hh:mm A')}</Typography>
            {order.trackingNumber && (
              <Typography variant="body2" color="text.secondary">Tracking #: {order.trackingNumber}</Typography>
            )}
            {order.adminNotes && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" fontWeight={700} mb={1}>Admin Notes</Typography>
                <Typography variant="body2" color="text.secondary">{order.adminNotes}</Typography>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
