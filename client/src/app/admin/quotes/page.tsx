'use client';
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, InputAdornment, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid2 as Grid, MenuItem, TablePagination, Tooltip, Button, Stack, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { quotesAPI } from '../../../services/api';
import useAdminResource from '../../../hooks/useAdminResource';
import ResponsiveDataView from '../../../components/common/ResponsiveDataView';

const STATUS_OPTIONS = ['pending', 'processing', 'sent', 'accepted', 'rejected', 'expired'];
const STATUS_COLORS: Record<string, any> = { pending: 'info', processing: 'warning', sent: 'secondary', accepted: 'success', rejected: 'error', expired: 'default' };

export default function AdminQuotesPage() {
  const {
    items: quotes, meta, isLoading, page, setPage, limit, setLimit, setSearch, updateMutation,
  } = useAdminResource({ key: 'quotes', api: { adminGetAll: quotesAPI.getAll, update: quotesAPI.update, create: async () => {}, delete: async () => {} } });

  const [selected, setSelected] = useState<any | null>(null);
  const [statusDraft, setStatusDraft] = useState('');
  const [adminNotesDraft, setAdminNotesDraft] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const openDetail = (q: any) => {
    setSelected(q);
    setStatusDraft(q.status);
    setAdminNotesDraft(q.adminNotes || '');
  };

  const handleUpdate = async () => {
    if (!selected) return;
    await updateMutation.mutateAsync({ id: selected._id, payload: { status: statusDraft, adminNotes: adminNotesDraft } });
    setSelected(null);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Quote Requests</Typography>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 2 }}>
          <TextField
            placeholder="Search quotes..."
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ maxWidth: 320, width: '100%' }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
        </Box>

        <ResponsiveDataView
          isLoading={isLoading}
          rows={quotes}
          rowKey={(q: any) => q._id}
          onRowClick={openDetail}
          emptyMessage="No quote requests yet."
          renderMobileTitle={(q: any) => q.quoteNumber}
          renderMobileSubtitle={(q: any) => q.name}
          renderActions={(q: any) => (
            <Tooltip title="View / Update">
              <IconButton size="small" onClick={() => openDetail(q)}><VisibilityIcon fontSize="small" /></IconButton>
            </Tooltip>
          )}
          columns={[
            { key: 'quoteNumber', label: 'Quote #' },
            { key: 'name', label: 'Name' },
            { key: 'items', label: 'Items', render: (q: any) => q.items?.length ?? 0 },
            { key: 'totalEstimate', label: 'Estimate', render: (q: any) => `₹${q.totalEstimate ?? 0}` },
            { key: 'status', label: 'Status', render: (q: any) => <Chip size="small" label={q.status} color={STATUS_COLORS[q.status] || 'default'} sx={{ textTransform: 'capitalize' }} /> },
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
        <DialogTitle fontWeight={700}>Quote {selected?.quoteNumber}</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Stack spacing={2} sx={{ mt: 0.5 }}>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">Customer</Typography>
                  <Typography variant="body1" fontWeight={600}>{selected.name}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{selected.phone}</Typography>
                </Grid>
              </Grid>
              <Box>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>Items</Typography>
                <Stack spacing={1}>
                  {(selected.items ?? []).map((item: any, i: number) => (
                    <Paper key={i} variant="outlined" sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">{item.productName} × {item.quantity}</Typography>
                      <Typography variant="body2" fontWeight={700}>₹{item.totalPrice ?? 0}</Typography>
                    </Paper>
                  ))}
                </Stack>
              </Box>
              <Divider />
              <TextField select label="Status" fullWidth size="small" value={statusDraft} onChange={(e) => setStatusDraft(e.target.value)}>
                {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>)}
              </TextField>
              <TextField
                label="Admin Notes"
                fullWidth
                multiline
                minRows={2}
                value={adminNotesDraft}
                onChange={(e) => setAdminNotesDraft(e.target.value)}
              />
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
