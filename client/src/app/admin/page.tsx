'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Grid2 as Grid,
  Paper,
  Box,
  Typography,
  Chip,
  Table, TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Skeleton,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PaymentsIcon from '@mui/icons-material/Payments';
import { dashboardAPI } from '../../services/api';

const STATUS_COLORS: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error' | 'primary'> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'primary',
  out_for_delivery: 'primary',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'default',
};

function StatCard({ icon, label, value, growth }: { icon: React.ReactNode; label: string; value: React.ReactNode; growth?: number }) {
  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        {typeof growth === 'number' && (
          <Chip
            size="small"
            icon={growth >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
            label={`${growth >= 0 ? '+' : ''}${growth}%`}
            color={growth >= 0 ? 'success' : 'error'}
            variant="outlined"
          />
        )}
      </Box>
      <Typography variant="h4" fontWeight={800}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: async () => (await dashboardAPI.getStats()).data.data,
  });

  const stats = data?.stats;
  const recentOrders = data?.recentOrders ?? [];
  const ordersByStatus = data?.ordersByStatus ?? [];

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
        Dashboard Overview
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={128} />
          ) : (
            <StatCard icon={<ShoppingBagIcon />} label="Total Orders" value={stats?.totalOrders ?? 0} growth={stats?.orderGrowth} />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={128} />
          ) : (
            <StatCard icon={<ShoppingBagIcon />} label="Pending Orders" value={stats?.pendingOrders ?? 0} />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={128} />
          ) : (
            <StatCard icon={<PeopleAltIcon />} label="Total Customers" value={stats?.totalCustomers ?? 0} />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={128} />
          ) : (
            <StatCard icon={<Inventory2Icon />} label="Active Products" value={stats?.totalProducts ?? 0} />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={128} />
          ) : (
            <StatCard
              icon={<PaymentsIcon />}
              label="Revenue (excl. cancelled/refunded)"
              value={`₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={128} />
          ) : (
            <StatCard icon={<Inventory2Icon />} label="Featured Products" value={stats?.featuredProducts ?? 0} />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Recent Orders
              </Typography>
            </Box>
            <TableContainer>

              <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4}>
                        <Skeleton />
                      </TableCell>
                    </TableRow>
                  ))}
                {!isLoading && recentOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                        No orders yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {recentOrders.map((order: any) => (
                  <TableRow key={order._id} hover>
                    <TableCell>#{order.orderNumber}</TableCell>
                    <TableCell>
                      {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : '—'}
                    </TableCell>
                    <TableCell>₹{(order.pricing?.total ?? 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Chip size="small" label={order.status} color={STATUS_COLORS[order.status] || 'default'} sx={{ textTransform: 'capitalize' }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>

            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Orders by Status
            </Typography>
            {isLoading && <Skeleton variant="rounded" height={140} />}
            {!isLoading &&
              ordersByStatus.map((s: any) => (
                <Box key={s._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Chip size="small" label={s._id} color={STATUS_COLORS[s._id] || 'default'} sx={{ textTransform: 'capitalize' }} />
                  <Typography variant="body2" fontWeight={700}>
                    {s.count}
                  </Typography>
                </Box>
              ))}
            {!isLoading && ordersByStatus.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No data yet.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}