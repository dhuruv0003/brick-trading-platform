'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Typography, Paper, Grid2 as Grid, Chip, Stepper, Step, StepLabel, Divider, Stack,
  Button, Skeleton, Avatar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import { ordersAPI } from '../../../../services/api';
import { STATUS_LABELS, STATUS_COLORS, TRACKING_STEPS } from '../../../../lib/orderStatus';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const { data: order, isLoading } = useQuery({
    queryKey: ['customer', 'order', orderId],
    queryFn: async () => (await ordersAPI.getMyOrder(orderId)).data.data.order,
    enabled: Boolean(orderId),
  });

  if (isLoading) {
    return (
      <Box>
        <Skeleton width={160} height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={300} />
      </Box>
    );
  }

  if (!order) {
    return <Typography color="text.secondary">Order not found.</Typography>;
  }

  const isCancelled = order.status === 'cancelled';
  const activeStep = isCancelled ? -1 : TRACKING_STEPS.indexOf(order.status);

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/account/orders')} sx={{ mb: 2 }}>
        Back to My Orders
      </Button>

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Order #{order.orderNumber}</Typography>
          <Typography variant="body2" color="text.secondary">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Typography>
        </Box>
        <Chip label={STATUS_LABELS[order.status] || order.status} color={STATUS_COLORS[order.status] || 'default'} sx={{ fontWeight: 700 }} />
      </Stack>

      {/* Tracking timeline */}
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider', mb: 3 }}>
        {isCancelled ? (
          <Typography color="error.main" fontWeight={700}>This order was cancelled.</Typography>
        ) : (
          <Stepper activeStep={activeStep} alternativeLabel={false} orientation="horizontal" sx={{ overflowX: 'auto', display: { xs: 'none', sm: 'flex' } }}>
            {TRACKING_STEPS.map((step) => (
              <Step key={step}><StepLabel>{STATUS_LABELS[step]}</StepLabel></Step>
            ))}
          </Stepper>
        )}
        {/* Mobile: vertical timeline reads far better than a squeezed horizontal one */}
        {!isCancelled && (
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ display: { xs: 'flex', sm: 'none' } }}>
            {TRACKING_STEPS.map((step) => (
              <Step key={step}><StepLabel>{STATUS_LABELS[step]}</StepLabel></Step>
            ))}
          </Stepper>
        )}
      </Paper>

      <Grid container spacing={2.5}>
        {/* Items */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight={700}>Items</Typography>
            </Box>
            <Stack divider={<Divider />}>
              {order.items.map((item: any, idx: number) => (
                <Stack key={idx} direction="row" spacing={2} alignItems="center" sx={{ p: 2 }}>
                  <Avatar variant="rounded" src={item.productImage} sx={{ width: 48, height: 48 }}>
                    {item.productName?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>{item.productName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.quantity} {item.unit} × ₹{item.unitPrice?.toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700}>₹{item.totalPrice?.toLocaleString('en-IN')}</Typography>
                </Stack>
              ))}
            </Stack>
            <Box sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
              <Typography fontWeight={700}>Total</Typography>
              <Typography fontWeight={800}>₹{order.totalAmount?.toLocaleString('en-IN')}</Typography>
            </Box>
          </Paper>

          {/* Invoice — only for delivered orders, and only if admin has generated one.
              No payment integration here per Phase 1 scope; this simply surfaces
              whatever invoice the admin has already produced. */}
          {order.status === 'delivered' && (
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mt: 2.5, p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Invoice</Typography>
              {order.invoice?.fileUrl ? (
                <Button variant="outlined" startIcon={<DownloadIcon />} href={order.invoice.fileUrl} target="_blank">
                  Download Invoice {order.invoice.number ? `#${order.invoice.number}` : ''}
                </Button>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Your invoice isn't ready yet. We'll notify you once it's available.
                </Typography>
              )}
            </Paper>
          )}
        </Grid>

        {/* Delivery address + status history */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 2.5, mb: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Delivery Address</Typography>
            <Typography variant="body2">{order.shippingAddress?.label}</Typography>
            <Typography variant="body2" color="text.secondary">
              {order.shippingAddress?.line1}{order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ''}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Phone: {order.shippingAddress?.phone}
            </Typography>
          </Paper>

          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Order History</Typography>
            <Stack spacing={1.5}>
              {[...(order.statusHistory || [])].reverse().map((h: any, idx: number) => (
                <Box key={idx}>
                  <Typography variant="body2" fontWeight={600}>{STATUS_LABELS[h.status] || h.status}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(h.changedAt).toLocaleString('en-IN')}
                  </Typography>
                  {h.note && <Typography variant="caption" display="block" color="text.secondary">{h.note}</Typography>}
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
