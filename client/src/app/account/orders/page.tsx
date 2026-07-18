'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Paper, TextField, InputAdornment, MenuItem, Chip, Stack, TablePagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ordersAPI } from '../../../services/api';
import useAdminResource from '../../../hooks/useAdminResource';
import ResponsiveDataView from '../../../components/common/ResponsiveDataView';
import { STATUS_LABELS, STATUS_COLORS, ORDER_STATUSES } from '../../../lib/orderStatus';

export default function MyOrdersPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const {
    items: orders, meta, isLoading, page, setPage, limit, setLimit, setSearch,
  } = useAdminResource({
    key: 'my-orders',
    listFn: 'getAll',
    api: {
      getAll: ordersAPI.getMyOrders,
      create: async () => {},
      update: async () => {},
      delete: async () => {},
    },
    extraParams: {
      status: status || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
  });

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>My Orders</Typography>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              placeholder="Search by order number or product..."
              size="small"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />
            <TextField
              select
              size="small"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ minWidth: { sm: 180 } }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {ORDER_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              size="small"
              label="From"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: { sm: 160 } }}
            />
            <TextField
              type="date"
              size="small"
              label="To"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: { sm: 160 } }}
            />
          </Stack>
        </Box>

        <ResponsiveDataView
          isLoading={isLoading}
          rows={orders}
          rowKey={(o: any) => o._id}
          onRowClick={(o: any) => router.push(`/account/orders/${o._id}`)}
          emptyMessage="No orders match your filters."
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

        {!isLoading && orders.length > 0 && (
          <TablePagination
            component="div"
            count={meta?.total ?? 0}
            page={page - 1}
            onPageChange={(_, newPage) => setPage(newPage + 1)}
            rowsPerPage={limit}
            onRowsPerPageChange={(e) => setLimit(parseInt(e.target.value, 10))}
            rowsPerPageOptions={[5, 10, 25]}
          />
        )}
      </Paper>
    </Box>
  );
}
