'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Grid2 as Grid, Paper, Box, Typography, Chip, Button, Skeleton, Stack } from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PersonIcon from '@mui/icons-material/Person';
import { ordersAPI } from '../../../services/api';
import useAuth from '../../../hooks/useAuth';
import ResponsiveDataView from '../../../components/common/ResponsiveDataView';
import { STATUS_COLORS, STATUS_LABELS } from '../../../lib/orderStatus';

// Same visual pattern as the admin dashboard's StatCard (app/admin/page.tsx),
// reproduced here rather than imported since that component isn't exported
// for reuse — kept pixel-identical so the two dashboards feel consistent.
function StatCard({ icon, label, value, color = 'primary.main' }: { icon: React.ReactNode; label: string; value: React.ReactNode; color?: string }) {
  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
        {icon}
      </Box>
      <Typography variant="h4" fontWeight={800}>{value}</Typography>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Paper>
  );
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['customer', 'dashboard'],
    queryFn: async () => (await ordersAPI.getMyDashboard()).data.data,
  });

  const stats = data?.stats;
  const recentOrders = data?.recentOrders ?? [];

  return (
    <Box>
      {/* Welcome section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>
          Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Here's what's happening with your orders.
        </Typography>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          {isLoading ? <Skeleton variant="rounded" height={128} /> : (
            <StatCard icon={<ShoppingBagIcon />} label="Total Orders" value={stats?.totalOrders ?? 0} />
          )}
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          {isLoading ? <Skeleton variant="rounded" height={128} /> : (
            <StatCard icon={<PendingActionsIcon />} label="Pending Orders" value={stats?.pendingOrders ?? 0} color="warning.main" />
          )}
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          {isLoading ? <Skeleton variant="rounded" height={128} /> : (
            <StatCard icon={<CheckCircleIcon />} label="Completed Orders" value={stats?.completedOrders ?? 0} color="success.main" />
          )}
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          {isLoading ? <Skeleton variant="rounded" height={128} /> : (
            <StatCard icon={<CancelIcon />} label="Cancelled Orders" value={stats?.cancelledOrders ?? 0} color="error.main" />
          )}
        </Grid>
      </Grid>

      {/* Quick actions */}
      <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Quick Actions</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button variant="contained" startIcon={<StorefrontIcon />} onClick={() => router.push('/products')} fullWidth>
            Browse Products
          </Button>
          <Button variant="outlined" startIcon={<ListAltIcon />} onClick={() => router.push('/account/orders')} fullWidth>
            View Orders
          </Button>
          <Button variant="outlined" startIcon={<PersonIcon />} onClick={() => router.push('/account/profile')} fullWidth>
            Edit Profile
          </Button>
        </Stack>
      </Paper>

      {/* Recent orders */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={700}>Recent Orders</Typography>
        </Box>
        <ResponsiveDataView
          isLoading={isLoading}
          rows={recentOrders}
          rowKey={(o: any) => o._id}
          onRowClick={(o: any) => router.push(`/account/orders/${o._id}`)}
          emptyMessage="You haven't placed any orders yet."
          renderMobileTitle={(o: any) => `#${o.orderNumber}`}
          renderMobileSubtitle={(o: any) => new Date(o.createdAt).toLocaleDateString('en-IN')}
          columns={[
            { key: 'orderNumber', label: 'Order #', render: (o: any) => `#${o.orderNumber}` },
            { key: 'createdAt', label: 'Date', render: (o: any) => new Date(o.createdAt).toLocaleDateString('en-IN') },
            { key: 'items', label: 'Items', render: (o: any) => `${o.items?.length ?? 0} item(s)` },
            { key: 'totalAmount', label: 'Total', render: (o: any) => `₹${(o.totalAmount ?? 0).toLocaleString('en-IN')}` },
            { key: 'status', label: 'Status', render: (o: any) => <Chip size="small" label={STATUS_LABELS[o.status] || o.status} color={STATUS_COLORS[o.status] || 'default'} /> },
          ]}
        />
      </Paper>
    </Box>
  );
}