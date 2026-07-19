'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, CircularProgress } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ordersAPI } from '../../../services/api';
import dayjs from 'dayjs';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await ordersAPI.getAll();
        setOrders(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} mb={3} fontFamily='"Playfair Display", serif'>
        My Orders
      </Typography>

      {orders?.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography color="text.secondary">You haven't placed any orders yet.</Typography>
          <Button component={Link} href="/products" variant="contained" sx={{ mt: 2 }}>
            Browse Products
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      #{order.orderNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {dayjs(order.createdAt).format('DD MMM YYYY')}
                  </TableCell>
                  <TableCell>
                    ₹{order.totalAmount?.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip label={order.status.toUpperCase()} size="small" color={getStatusColor(order.status) as any} />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      component={Link}
                      href={`/account/orders/${order._id}`}
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}