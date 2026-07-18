'use client';
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, InputAdornment, Chip, MenuItem, TablePagination,
  Dialog, DialogTitle, DialogContent, DialogActions, Stack, Grid2 as Grid, Divider,
  Button, IconButton, Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import { ordersAPI } from '../../../services/api';
import useAdminResource from '../../../hooks/useAdminResource';
import ResponsiveDataView from '../../../components/common/ResponsiveDataView';
import { STATUS_LABELS, STATUS_COLORS, ORDER_STATUSES } from '../../../lib/orderStatus';

export default function AdminOrdersPage() {
  const {
    items: orders, meta, isLoading, page, setPage, limit, setLimit, setSearch, updateMutation,
  } = useAdminResource({
    key: 'admin-orders',
    api: { adminGetAll: ordersAPI.adminGetAll, update: ordersAPI.updateStatus, create: async () => {}, delete: async () => {} },
  });

  const [selected, setSelected] = useState<any | null>(null);
  const [statusDraft, setStatusDraft] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const openDetail = (order: any) => {
    setSelected(order);
    setStatusDraft(order.status);
    setNoteDraft('');
  };

  const handleUpdate = async () => {
    if (!selected) return;
    await updateMutation.mutateAsync({ id: selected._id, payload: { status: statusDraft, note: noteDraft || undefined } });
    setSelected(null);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Orders</Typography>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              placeholder="Search by order #, customer, phone..."
              size="small"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />
            <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: { sm: 200 } }}>
              <MenuItem value="">All Statuses</MenuItem>
              {ORDER_STATUSES.map((s) => <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>)}
            </TextField>
          </Stack>
        </Box>

        <ResponsiveDataView
          isLoading={isLoading}
          rows={orders.filter((o: any) => !statusFilter || o.status === statusFilter)}
          rowKey={(o: any) => o._id}
          onRowClick={openDetail}
          emptyMessage="No orders yet."
          renderMobileTitle={(o: any) => `#${o.orderNumber}`}
          renderMobileSubtitle={(o: any) => o.customerName}
          renderActions={(o: any) => (
            <Tooltip title="View / Update">
              <IconButton size="small" onClick={() => openDetail(o)}><VisibilityIcon fontSize="small" /></IconButton>
            </Tooltip>
          )}
          columns={[
            { key: 'orderNumber', label: 'Order #', render: (o: any) => `#${o.orderNumber}` },
            { key: 'customerName', label: 'Customer' },
            { key: 'customerPhone', label: 'Phone' },
            { key: 'items', label: 'Items', render: (o: any) => `${o.items?.length ?? 0} item(s)` },
            { key: 'totalAmount', label: 'Total', render: (o: any) => `₹${(o.totalAmount ?? 0).toLocaleString('en-IN')}` },
            { key: 'status', label: 'Status', render: (o: any) => <Chip size="small" label={STATUS_LABELS[o.status] || o.status} color={STATUS_COLORS[o.status] || 'default'} /> },
          ]}
        />

        <TablePagination
          component="div"
          count={meta?.total ?? 0}
          page={page - 1}
          onPageChange={(_, newPage) => setPage(newPage + 1)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => setLimit(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Order #{selected?.orderNumber}</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Stack spacing={2} sx={{ mt: 0.5 }}>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">Customer</Typography>
                  <Typography variant="body1" fontWeight={600}>{selected.customerName}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{selected.customerPhone}</Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary">Delivery Address</Typography>
                  <Typography variant="body2">
                    {selected.shippingAddress?.line1}, {selected.shippingAddress?.city}, {selected.shippingAddress?.state} - {selected.shippingAddress?.pincode}
                  </Typography>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>Items</Typography>
                <Stack spacing={1}>
                  {(selected.items ?? []).map((item: any, i: number) => (
                    <Paper key={i} variant="outlined" sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">{item.productName} × {item.quantity} {item.unit}</Typography>
                      <Typography variant="body2" fontWeight={700}>₹{item.totalPrice ?? 0}</Typography>
                    </Paper>
                  ))}
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1, px: 0.5 }}>
                  <Typography variant="body2" fontWeight={700}>Total</Typography>
                  <Typography variant="body2" fontWeight={700}>₹{selected.totalAmount ?? 0}</Typography>
                </Stack>
              </Box>

              {selected.invoice?.fileUrl && (
                <Button size="small" startIcon={<DownloadIcon />} href={selected.invoice.fileUrl} target="_blank" sx={{ alignSelf: 'flex-start' }}>
                  Download Invoice
                </Button>
              )}

              <Divider />

              <TextField select label="Update Status" fullWidth size="small" value={statusDraft} onChange={(e) => setStatusDraft(e.target.value)}>
                {ORDER_STATUSES.map((s) => <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>)}
              </TextField>
              <TextField
                label="Note (optional, visible in order history)"
                fullWidth
                multiline
                minRows={2}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
              />

              <Box>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>Status History</Typography>
                <Stack spacing={0.75}>
                  {[...(selected.statusHistory ?? [])].reverse().map((h: any, i: number) => (
                    <Typography key={i} variant="caption" color="text.secondary">
                      {STATUS_LABELS[h.status] || h.status} — {new Date(h.changedAt).toLocaleString('en-IN')}{h.note ? ` — ${h.note}` : ''}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setSelected(null)}>Close</Button>
          <Button variant="contained" onClick={handleUpdate}>Save Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
