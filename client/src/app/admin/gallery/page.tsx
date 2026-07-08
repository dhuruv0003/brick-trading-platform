'use client';
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, TextField, InputAdornment, Grid2 as Grid, Card, CardMedia,
  CardContent, IconButton, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  Switch, FormControlLabel, Tooltip, Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { galleryAPI, uploadAPI } from '../../../services/api';
import useAdminResource from '../../../hooks/useAdminResource';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';

const CATEGORY_OPTIONS = ['products', 'projects', 'factory', 'transport', 'team', 'events', 'other'];
const EMPTY_FORM = { title: '', url: '', category: 'other', caption: '', isActive: true };

export default function AdminGalleryPage() {
  const {
    items, isLoading, setSearch, createMutation, updateMutation, deleteMutation,
  } = useAdminResource({ key: 'gallery', api: galleryAPI });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingId(item._id);
    setForm({ title: item.title, url: item.url, category: item.category, caption: item.caption || '', isActive: item.isActive ?? true });
    setDialogOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      const res = await uploadAPI.single(fd);
      setForm((f) => ({ ...f, url: res.data.data.url }));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (editingId) await updateMutation.mutateAsync({ id: editingId, payload: form });
    else await createMutation.mutateAsync(form);
    setDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={800}>Gallery</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Image</Button>
      </Box>

      <TextField
        placeholder="Search gallery..."
        size="small"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        sx={{ maxWidth: 320, mb: 2.5 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
      />

      <Grid container spacing={2.5}>
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={i}>
              <Skeleton variant="rounded" height={180} />
            </Grid>
          ))}
        {!isLoading && items.length === 0 && (
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No gallery items yet.
            </Typography>
          </Grid>
        )}
        {items.map((item: any) => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={item._id}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardMedia component="img" height="140" image={item.url} alt={item.title} sx={{ objectFit: 'cover' }} />
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="body2" fontWeight={700} noWrap>{item.title}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                  <Chip size="small" label={item.category} sx={{ textTransform: 'capitalize' }} />
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(item)}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(item._id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editingId ? 'Edit Image' : 'Add Image'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField label="Title" fullWidth required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Grid>
            <Grid size={12}>
              {form.url && (
                <Box component="img" src={form.url} sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 2, mb: 1.5 }} />
              )}
              <Button component="label" variant="outlined" size="small" disabled={uploading}>
                {uploading ? 'Uploading...' : form.url ? 'Replace Image' : 'Upload Image'}
                <input type="file" hidden accept="image/*" onChange={handleUpload} />
              </Button>
            </Grid>
            <Grid size={12}>
              <TextField select label="Category" fullWidth value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORY_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c} sx={{ textTransform: 'capitalize' }}>{c}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField label="Caption" fullWidth value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.title || !form.url}>
            {editingId ? 'Save Changes' : 'Add Image'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Image"
        message="Are you sure you want to delete this gallery image?"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await deleteMutation.mutateAsync(deleteTarget);
          setDeleteTarget(null);
        }}
      />
    </Box>
  );
}
