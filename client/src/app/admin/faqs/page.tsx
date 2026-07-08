'use client';
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, TextField, InputAdornment, Table, TableHead, TableBody, TableRow,
  TableCell, Chip, IconButton, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, Grid2 as Grid,
  Switch, FormControlLabel, TablePagination, Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { faqsAPI } from '../../../services/api';
import useAdminResource from '../../../hooks/useAdminResource';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';

const EMPTY_FORM = { question: '', answer: '', category: 'General', isPublished: true };

export default function AdminFAQsPage() {
  const {
    items, meta, isLoading, page, setPage, limit, setLimit, setSearch,
    createMutation, updateMutation, deleteMutation,
  } = useAdminResource({ key: 'faqs', api: faqsAPI });

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
  const openEdit = (f: any) => {
    setEditingId(f._id);
    setForm({ question: f.question, answer: f.answer, category: f.category || 'General', isPublished: f.isPublished ?? true });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editingId) await updateMutation.mutateAsync({ id: editingId, payload: form });
    else await createMutation.mutateAsync(form);
    setDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={800}>FAQs</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add FAQ</Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 2 }}>
          <TextField
            placeholder="Search FAQs..."
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ maxWidth: 320 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Question</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={4}><Skeleton height={36} /></TableCell></TableRow>
            ))}
            {!isLoading && items.length === 0 && (
              <TableRow><TableCell colSpan={4}>
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No FAQs yet.</Typography>
              </TableCell></TableRow>
            )}
            {items.map((f: any) => (
              <TableRow key={f._id} hover>
                <TableCell sx={{ maxWidth: 420 }}>{f.question}</TableCell>
                <TableCell>{f.category}</TableCell>
                <TableCell>
                  <Chip size="small" label={f.isPublished ? 'Published' : 'Hidden'} color={f.isPublished ? 'success' : 'default'} />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(f)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteTarget(f._id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editingId ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField label="Question" fullWidth required value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <TextField label="Answer" fullWidth required multiline minRows={3} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <TextField label="Category" fullWidth value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={<Switch checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />}
                label="Published"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.question || !form.answer}>
            {editingId ? 'Save Changes' : 'Add FAQ'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ?"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => { if (deleteTarget) await deleteMutation.mutateAsync(deleteTarget); setDeleteTarget(null); }}
      />
    </Box>
  );
}
