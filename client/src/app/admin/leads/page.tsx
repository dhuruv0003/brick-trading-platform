'use client';
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, InputAdornment, Table, TableContainer, TableHead, TableBody, TableRow,
  TableCell, Chip, IconButton, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid2 as Grid, MenuItem, TablePagination, Tooltip, Button, Stack, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { inquiriesAPI } from '../../../services/api';
import useAdminResource from '../../../hooks/useAdminResource';

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'converted', 'closed', 'spam'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];
const STATUS_COLORS: Record<string, any> = { new: 'info', contacted: 'warning', qualified: 'secondary', converted: 'success', closed: 'default', spam: 'error' };

export default function AdminLeadsPage() {
  const {
    items: leads, meta, isLoading, page, setPage, limit, setLimit, setSearch, updateMutation,
  } = useAdminResource({ key: 'leads', api: { adminGetAll: inquiriesAPI.getAll, update: inquiriesAPI.updateStatus, create: async () => {}, delete: async () => {} } });

  const [selected, setSelected] = useState<any | null>(null);
  const [statusDraft, setStatusDraft] = useState('');
  const [priorityDraft, setPriorityDraft] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const openDetail = (lead: any) => {
    setSelected(lead);
    setStatusDraft(lead.status);
    setPriorityDraft(lead.priority);
    setNoteDraft('');
  };

  const handleUpdate = async () => {
    if (!selected) return;
    await updateMutation.mutateAsync({
      id: selected._id,
      payload: { status: statusDraft, priority: priorityDraft, note: noteDraft || undefined },
    });
    setSelected(null);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Leads</Typography>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 2 }}>
          <TextField
            placeholder="Search leads..."
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ maxWidth: 320 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
        </Box>
        <TableContainer>

          <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={6}><Skeleton height={36} /></TableCell></TableRow>
            ))}
            {!isLoading && leads.length === 0 && (
              <TableRow><TableCell colSpan={6}>
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No leads yet.</Typography>
              </TableCell></TableRow>
            )}
            {leads.map((l: any) => (
              <TableRow key={l._id} hover>
                <TableCell>{l.name}</TableCell>
                <TableCell>{l.phone}</TableCell>
                <TableCell sx={{ textTransform: 'capitalize' }}>{l.customerType?.replace('_', ' ')}</TableCell>
                <TableCell sx={{ textTransform: 'capitalize' }}>{l.priority}</TableCell>
                <TableCell><Chip size="small" label={l.status} color={STATUS_COLORS[l.status] || 'default'} sx={{ textTransform: 'capitalize' }} /></TableCell>
                <TableCell align="right">
                  <Tooltip title="View / Update"><IconButton size="small" onClick={() => openDetail(l)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>

        </TableContainer>
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
        <DialogTitle fontWeight={700}>Lead Details</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Stack spacing={2} sx={{ mt: 0.5 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Name</Typography>
                <Typography variant="body1" fontWeight={600}>{selected.name}</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{selected.phone}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selected.email || '—'}</Typography>
                </Grid>
              </Grid>
              <Box>
                <Typography variant="body2" color="text.secondary">Message</Typography>
                <Typography variant="body1">{selected.message}</Typography>
              </Box>
              <Divider />
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField select label="Status" fullWidth size="small" value={statusDraft} onChange={(e) => setStatusDraft(e.target.value)}>
                    {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={6}>
                  <TextField select label="Priority" fullWidth size="small" value={priorityDraft} onChange={(e) => setPriorityDraft(e.target.value)}>
                    {PRIORITY_OPTIONS.map((p) => <MenuItem key={p} value={p} sx={{ textTransform: 'capitalize' }}>{p}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>
              <TextField
                label="Add a note"
                fullWidth
                multiline
                minRows={2}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
              />
              {selected.notes?.length > 0 && (
                <Box>
                  <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>Previous Notes</Typography>
                  <Stack spacing={1}>
                    {selected.notes.map((n: any, i: number) => (
                      <Paper key={i} variant="outlined" sx={{ p: 1.5 }}>
                        <Typography variant="body2">{n.text}</Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
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
