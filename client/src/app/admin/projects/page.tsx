'use client';
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, TextField, InputAdornment, Table, TableHead, TableBody, TableRow,
  TableCell, Chip, IconButton, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, Grid2 as Grid,
  MenuItem, Switch, FormControlLabel, TablePagination, Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { projectsAPI } from '../../../services/api';
import useAdminResource from '../../../hooks/useAdminResource';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';

const CATEGORY_OPTIONS = ['residential', 'commercial', 'government', 'infrastructure', 'industrial'];
const EMPTY_FORM = {
  title: '', description: '', shortDescription: '', category: 'residential',
  location: { city: '', state: '' }, isFeatured: false, isPublished: true,
};

export default function AdminProjectsPage() {
  const {
    items: projects, meta, isLoading, page, setPage, limit, setLimit, setSearch,
    createMutation, updateMutation, deleteMutation,
  } = useAdminResource({ key: 'projects', api: projectsAPI });

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
  const openEdit = (p: any) => {
    setEditingId(p._id);
    setForm({
      title: p.title, description: p.description, shortDescription: p.shortDescription || '',
      category: p.category || 'residential',
      location: { city: p.location?.city || '', state: p.location?.state || '' },
      isFeatured: p.isFeatured ?? false, isPublished: p.isPublished ?? true,
    });
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
        <Typography variant="h5" fontWeight={800}>Projects</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Project</Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 2 }}>
          <TextField
            placeholder="Search projects..."
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
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={5}><Skeleton height={36} /></TableCell></TableRow>
            ))}
            {!isLoading && projects.length === 0 && (
              <TableRow><TableCell colSpan={5}>
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No projects yet.</Typography>
              </TableCell></TableRow>
            )}
            {projects.map((p: any) => (
              <TableRow key={p._id} hover>
                <TableCell>{p.title}</TableCell>
                <TableCell sx={{ textTransform: 'capitalize' }}>{p.category}</TableCell>
                <TableCell>{[p.location?.city, p.location?.state].filter(Boolean).join(', ') || '—'}</TableCell>
                <TableCell>
                  <Chip size="small" label={p.isPublished ? 'Published' : 'Draft'} color={p.isPublished ? 'success' : 'default'} sx={{ mr: 0.5 }} />
                  {p.isFeatured && <Chip size="small" label="Featured" color="primary" variant="outlined" />}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteTarget(p._id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={700}>{editingId ? 'Edit Project' : 'Add Project'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField label="Project Title" fullWidth required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select label="Category" fullWidth value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORY_OPTIONS.map((c) => <MenuItem key={c} value={c} sx={{ textTransform: 'capitalize' }}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="City" fullWidth value={form.location.city} onChange={(e) => setForm({ ...form, location: { ...form.location, city: e.target.value } })} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="State" fullWidth value={form.location.state} onChange={(e) => setForm({ ...form, location: { ...form.location, state: e.target.value } })} />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Short Description"
                fullWidth
                inputProps={{ maxLength: 300 }}
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Full Description"
                fullWidth
                required
                multiline
                minRows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControlLabel
                control={<Switch checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />}
                label="Featured"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControlLabel
                control={<Switch checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />}
                label="Published"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.title || !form.description}>
            {editingId ? 'Save Changes' : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Project"
        message="Are you sure you want to delete this project?"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => { if (deleteTarget) await deleteMutation.mutateAsync(deleteTarget); setDeleteTarget(null); }}
      />
    </Box>
  );
}
