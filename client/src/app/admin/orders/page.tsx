'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, IconButton, Alert, Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Link from 'next/link';
import { SectionLoader } from '../../../components/common/Loaders';
import { adminOrdersAPI } from '../../../services/api';
import dayjs from 'dayjs';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminOrdersAPI.getAll({ page: page + 1, limit: rowsPerPage });
      setOrders(res.data.data);
      setTotal(res.data.meta.total);
    } catch (err) {
      console.error(err);
      setError('Failed to load orders. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Orders Management</Typography>
      
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        {loading ? (
          <SectionLoader />
        ) : error ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchOrders}>Retry</Button>}>
              {error}
            </Alert>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id} hover>
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell>{dayjs(order.createdAt).format('DD MMM YYYY')}</TableCell>
                      <TableCell>
                        {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Guest'}
                      </TableCell>
                      <TableCell>₹{(order.pricing?.total ?? 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={order.status.toUpperCase()} size="small" color={getStatusColor(order.status) as any} />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton component={Link} href={`/admin/orders/${order._id}`} color="primary" size="small">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>No orders found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </Box>
  );
} 