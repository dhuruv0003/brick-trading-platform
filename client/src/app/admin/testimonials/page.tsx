'use client';
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, TextField, InputAdornment, Table, TableContainer, TableHead, TableBody, TableRow,
  TableCell, Chip, IconButton, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, Grid2 as Grid,
  MenuItem, Rating, TablePagination, Tooltip, Switch, FormControlLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { testimonialsAPI } from '../../../services/api';
import useAdminResource from '../../../hooks/useAdminResource';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';

const CUSTOMER_TYPES = [
  'homeowner', 'builder', 'developer', 'contractor', 'govt_department',
  'govt_contractor', 'dealer', 'trader', 'hardware_store', 'mason', 'other',
];
const EMPTY_FORM = { name: '', designation: '', company: '', customerType: 'other', rating: 5, review: '', isApproved: false, isFeatured: false };

export default function AdminTestimonialsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    items, meta, isLoading, page, setPage, limit, setLimit, setSearch,
    createMutation, updateMutation, deleteMutation,
  } = useAdminResource({ key: 'testimonials', api: testimonialsAPI });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (t: any) => {
    setEditingId(t._id);
    setForm({
      name: t.name, designation: t.designation || '', company: t.company || '',
      customerType: t.customerType || 'other', rating: t.rating || 5, review: t.review,
      isApproved: t.isApproved ?? false, isFeatured: t.isFeatured ?? false,
    });
    setDialogOpen(true);
  };

  const toggleApprove = (t: any) => updateMutation.mutate({ id: t._id, payload: { isApproved: !t.isApproved } });

  const handleSave = async () => {
    if (editingId) await updateMutation.mutateAsync({ id: editingId, payload: form });
    else await createMutation.mutateAsync(form);
    setDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={800}>Testimonials</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Testimonial</Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 2 }}>
          <TextField
            placeholder="Search testimonials..."
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
              <TableCell>Type</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Approved</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={5}><Skeleton height={36} /></TableCell></TableRow>
            ))}
            {!isLoading && items.length === 0 && (
              <TableRow><TableCell colSpan={5}>
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No testimonials yet.</Typography>
              </TableCell></TableRow>
            )}
            {items.map((t: any) => (
              <TableRow key={t._id} hover>
                <TableCell>{t.name}</TableCell>
                <TableCell sx={{ textTransform: 'capitalize' }}>{t.customerType?.replace('_', ' ')}</TableCell>
                <TableCell><Rating value={t.rating} readOnly size="small" /></TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    icon={t.isApproved ? <CheckCircleIcon fontSize="small" /> : undefined}
                    label={t.isApproved ? 'Approved' : 'Pending'}
                    color={t.isApproved ? 'success' : 'default'}
                    onClick={() => toggleApprove(t)}
                    clickable
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(t)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteTarget(t._id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle fontWeight={700}>{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Name" fullWidth required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Customer Type" fullWidth value={form.customerType} onChange={(e) => setForm({ ...form, customerType: e.target.value })}>
                {CUSTOMER_TYPES.map((c) => <MenuItem key={c} value={c} sx={{ textTransform: 'capitalize' }}>{c.replace('_', ' ')}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Designation" fullWidth value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Company" fullWidth value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <Typography component="legend" variant="body2" sx={{ mb: 0.5 }}>Rating</Typography>
              <Rating value={form.rating} onChange={(_, v) => setForm({ ...form, rating: v || 5 })} />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Review"
                fullWidth
                required
                multiline
                minRows={3}
                value={form.review}
                onChange={(e) => setForm({ ...form, review: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControlLabel
                control={<Switch checked={form.isApproved} onChange={(e) => setForm({ ...form, isApproved: e.target.checked })} />}
                label="Approved"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControlLabel
                control={<Switch checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />}
                label="Featured"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name || !form.review}>
            {editingId ? 'Save Changes' : 'Add Testimonial'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Testimonial"
        message="Are you sure you want to delete this testimonial?"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => { if (deleteTarget) await deleteMutation.mutateAsync(deleteTarget); setDeleteTarget(null); }}
      />
    </Box>
  );
}
