'use client';
import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button, CircularProgress, Chip } from '@mui/material';
import Link from 'next/link';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import useCustomerAuth from '../../../hooks/useCustomerAuth';
import useWishlist from '../../../hooks/useWishlist';
import { ordersAPI, customerAddressAPI } from '../../../services/api';
import dayjs from 'dayjs';

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

export default function DashboardPage() {
  const { customer } = useCustomerAuth();
  const { items: wishlistItems } = useWishlist();

  const [orders, setOrders] = useState<any[]>([]);
  const [addressCount, setAddressCount] = useState(0);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, addrRes] = await Promise.all([
          // Fetch up to the backend's max page size so Total/Active/Completed
          // counts below are accurate for the whole order history, not just
          // the most recent page. The "Recent Orders" panel still only
          // displays the first few of these.
          ordersAPI.getAll({ limit: 100, page: 1 }),
          customerAddressAPI.getAll(),
        ]);
        setOrders(ordersRes.data.data || []);
        setAddressCount((addrRes.data.data.addresses || []).length);
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchData();
  }, []);

  const ACTIVE_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery'];
  const activeOrdersCount = orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;
  const completedOrdersCount = orders.filter((o) => o.status === 'delivered').length;

  const stats = [
    {
      label: 'Total Orders',
      value: loadingOrders ? '—' : orders.length.toString(),
      icon: <ShoppingBagIcon color="primary" />,
      link: '/account/orders',
    },
    {
      label: 'Active Orders',
      value: loadingOrders ? '—' : activeOrdersCount.toString(),
      icon: <LocalShippingIcon color="warning" />,
      link: '/account/orders',
    },
    {
      label: 'Completed Orders',
      value: loadingOrders ? '—' : completedOrdersCount.toString(),
      icon: <TaskAltIcon color="success" />,
      link: '/account/orders',
    },
    {
      label: 'Wishlist Items',
      value: wishlistItems.length.toString(),
      icon: <FavoriteIcon color="error" />,
      link: '/account/wishlist',
    },
    {
      label: 'Saved Addresses',
      value: addressCount.toString(),
      icon: <LocationOnIcon color="success" />,
      link: '/account/addresses',
    },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} mb={3} fontFamily='"Playfair Display", serif'>
        Welcome back, {customer?.firstName}!
      </Typography>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, i) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={i}>
            <Paper
              elevation={0}
              component={Link}
              href={stat.link}
              sx={{
                p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider',
                display: 'flex', alignItems: 'center', gap: 2,
                textDecoration: 'none', color: 'inherit',
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: 'primary.main' },
              }}
            >
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.default' }}>
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={700}>{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* ── Recent Orders ─────────────────────────────────────────────── */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Recent Orders</Typography>
              <Button component={Link} href="/account/orders" size="small">View All</Button>
            </Box>

            {loadingOrders ? (
              <CircularProgress size={24} />
            ) : orders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary" mb={1}>No orders yet.</Typography>
                <Button variant="outlined" size="small" component={Link} href="/products">
                  Shop Now
                </Button>
              </Box>
            ) : (
              orders.slice(0, 4).map((order: any) => (
                <Box
                  key={order._id}
                  component={Link}
                  href={`/account/orders/${order._id}`}
                  sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    py: 1.5, borderBottom: '1px solid', borderColor: 'divider',
                    textDecoration: 'none', color: 'inherit',
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { bgcolor: 'action.hover', mx: -1, px: 1, borderRadius: 1 },
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600}>#{order.orderNumber}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(order.createdAt).format('DD MMM YYYY')}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight={600}>
                      ₹{(order.pricing?.total ?? 0).toLocaleString()}
                    </Typography>
                    <Chip
                      label={order.status}
                      size="small"
                      color={STATUS_COLORS[order.status] ?? 'default'}
                      sx={{ mt: 0.25, fontSize: '0.65rem', height: 18 }}
                    />
                  </Box>
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        {/* ── Account Details ───────────────────────────────────────────── */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>Account Details</Typography>
              <Button component={Link} href="/account/profile" size="small">Edit Profile</Button>
            </Box>
            <Box mb={1.5}>
              <Typography variant="subtitle2" color="text.secondary">Name</Typography>
              <Typography variant="body1">{customer?.firstName} {customer?.lastName}</Typography>
            </Box>
            <Box mb={1.5}>
              <Typography variant="subtitle2" color="text.secondary">Email</Typography>
              <Typography variant="body1">{customer?.email}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
              <Typography variant="body1">{customer?.phone || '—'}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
