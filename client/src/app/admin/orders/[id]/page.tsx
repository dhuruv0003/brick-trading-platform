'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Divider, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { adminOrdersAPI } from '../../../../services/api';
import dayjs from 'dayjs';

export default function AdminOrderDetailsPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await adminOrdersAPI.getOne(params.id);
        setOrder(res.data.data.order);
        setStatus(res.data.data.order.status);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [params.id]);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await adminOrdersAPI.update(params.id, { status });
      // update local state order status
      setOrder({ ...order, status });
      alert('Order status updated successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!order) return <Typography>Order not found</Typography>;

  return (
    <Box>
      <Button component={Link} href="/admin/orders" startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
        Back to Orders
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Order #{order.orderNumber}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" disabled={updating || status === order.status} onClick={handleUpdateStatus}>
            {updating ? 'Updating...' : 'Update Status'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Order Items</Typography>
            {order.items.map((item: any) => (
              <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} component={Link} href={`/admin/products/${item.product}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                    {item.productName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Qty: {item.quantity}</Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  ₹{(item.price * item.quantity).toLocaleString()}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="h6" fontWeight={700}>Total Amount</Typography>
              <Typography variant="h6" fontWeight={700}>₹{order.totalAmount?.toLocaleString()}</Typography>
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
            {order.shippingAddress ? (
              <Box>
                <Typography variant="body1">{order.shippingAddress.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">{order.shippingAddress.street}</Typography>
                <Typography variant="body2" color="text.secondary">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</Typography>
                <Typography variant="body2" color="text.secondary">Phone: {order.shippingAddress.phone}</Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">N/A</Typography>
            )}

            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" fontWeight={700} mb={1}>Payment</Typography>
            <Typography variant="body2" color="text.secondary">Method: {order.paymentMethod?.toUpperCase()}</Typography>
            <Typography variant="body2" color="text.secondary">Status: {order.paymentStatus}</Typography>
            <Typography variant="body2" color="text.secondary">Date Placed: {dayjs(order.createdAt).format('DD MMM YYYY, hh:mm A')}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
