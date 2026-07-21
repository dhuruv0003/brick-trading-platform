'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  Table, TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid2 as Grid,
  MenuItem,
  Switch,
  FormControlLabel,
  TablePagination,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { categoriesAPI, uploadAPI } from '../../../services/api';
import { useSnackbar } from 'notistack';
import useAdminResource from '../../../hooks/useAdminResource';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import { getProductImageUrl, handleProductImageError } from '../../../lib/productImage';

const EMPTY_FORM = { name: '', description: '', parent: '', isActive: true, image: '' };

export default function AdminCategoriesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();
  const {
    items: categories,
    meta,
    isLoading,
    page,
    setPage,
    limit,
    setLimit,
    setSearch,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useAdminResource({ key: 'categories', api: categoriesAPI, listFn: 'adminGetAll' });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [uploading, setUploading] = useState(false);

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

  const openEdit = (c: any) => {
    setEditingId(c._id);
    setForm({ name: c.name || '', description: c.description || '', parent: c.parent?._id || c.parent || '', isActive: c.isActive ?? true, image: c.image || '' });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      const res = await uploadAPI.single(fd);
      const { url } = res.data.data;
      setForm((f) => ({ ...f, image: url }));
      enqueueSnackbar('Image uploaded successfully.', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'Image upload failed. Please try again.', { variant: 'error' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    const payload = { ...form, parent: form.parent || null };
    if (editingId) await updateMutation.mutateAsync({ id: editingId, payload });
    else await createMutation.mutateAsync(payload);
    setDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={800}>
          Categories
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Category
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 2 }}>
          <TextField
            placeholder="Search categories..."
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
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Parent</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton height={36} />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    No categories found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {categories.map((c: any) => (
              <TableRow key={c._id} hover>
                <TableCell>
                  <Box sx={{ width: 48, height: 36, borderRadius: 1, overflow: 'hidden', bgcolor: 'background.default' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.image || getProductImageUrl({ images: [] })}
                      alt={c.name}
                      onError={handleProductImageError}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </Box>
                </TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.parent?.name || '—'}</TableCell>
                <TableCell>
                  <Chip size="small" label={c.isActive ? 'Active' : 'Inactive'} color={c.isActive ? 'primary' : 'default'} variant="outlined" />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(c)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(c._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>

        </TableContainer>
        <TablePagination
          component="div"
          count={meta?.total ?? categories.length}
          page={page - 1}
          onPageChange={(_, newPage) => setPage(newPage + 1)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => setLimit(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle fontWeight={700}>{editingId ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Category Image
              </Typography>
              <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 1.5 }}>
                Shown on the homepage &quot;Shop by Category&quot; section.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 96, height: 72, borderRadius: 2, overflow: 'hidden', flexShrink: 0,
                    bgcolor: 'background.default', border: '1px solid', borderColor: 'divider',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.image || getProductImageUrl({ images: [] })}
                    alt="Category preview"
                    onError={handleProductImageError}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button component="label" variant="outlined" size="small" disabled={uploading}>
                    {uploading ? 'Uploading...' : form.image ? 'Replace' : 'Upload Image'}
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  </Button>
                  {form.image && (
                    <Button size="small" color="error" onClick={() => setForm((f) => ({ ...f, image: '' }))}>
                      Remove
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid size={12}>
              <TextField label="Category Name" fullWidth required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                minRows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                select
                label="Parent Category"
                fullWidth
                value={form.parent}
                onChange={(e) => setForm({ ...form, parent: e.target.value })}
              >
                <MenuItem value="">None (Top Level)</MenuItem>
                {categories
                  .filter((c: any) => c._id !== editingId)
                  .map((c: any) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.name}
                    </MenuItem>
                  ))}
              </TextField>
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
          <Button variant="contained" onClick={handleSave} disabled={!form.name}>
            {editingId ? 'Save Changes' : 'Create Category'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Category"
        message="Are you sure you want to delete this category?"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await deleteMutation.mutateAsync(deleteTarget);
          setDeleteTarget(null);
        }}
      />
    </Box>
  );
}
