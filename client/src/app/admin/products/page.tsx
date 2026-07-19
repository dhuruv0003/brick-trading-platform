'use client';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  Table,
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
  Avatar,
  TablePagination,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import { productsAPI, categoriesAPI, uploadAPI } from '../../../services/api';
import useAdminResource from '../../../hooks/useAdminResource';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import { useSnackbar } from 'notistack';

const EMPTY_FORM = {
  name: '',
  category: '',
  description: '',
  shortDescription: '',
  specs: { size: '', weight: '', type: '', color: '', finish: '', strength: '' },
  pricing: { retail: 0, wholesale: 0, bulk: 0, unit: 'per 1000' },
  images: [] as { url: string; publicId?: string; alt: string; isPrimary: boolean }[],
  inStock: true,
  stockQuantity: 0,
  isFeatured: false,
  isActive: true,
};

export default function AdminProductsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const {
    items: products,
    meta,
    isLoading,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useAdminResource({ key: 'products', api: productsAPI });

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: async () => (await categoriesAPI.adminGetAll({ limit: 200 })).data.data,
  });
  const categories = categoriesRes ?? [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [deletingImageIndex, setDeletingImageIndex] = useState<number | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
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

  const openEdit = (product: any) => {
    setEditingId(product._id);
    setForm({
      name: product.name || '',
      category: product.category?._id || product.category || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      specs: { ...EMPTY_FORM.specs, ...product.specs },
      pricing: { ...EMPTY_FORM.pricing, ...product.pricing },
      images: product.images || [],
      inStock: product.inStock ?? true,
      stockQuantity: product.stockQuantity ?? 0,
      isFeatured: product.isFeatured ?? false,
      isActive: product.isActive ?? true,
    });
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
      const { url, publicId } = res.data.data;
      setForm((f) => ({
        ...f,
        images: [...f.images, { url, publicId, alt: f.name, isPrimary: f.images.length === 0 }],
      }));
      enqueueSnackbar('Image uploaded successfully.', { variant: 'success' });
    } catch (err: any) {
      // Previously this failure was completely silent (no catch block at
      // all) — a slow/failed Cloudinary upload would leave the user
      // staring at a stuck "Uploading..." button with zero feedback.
      enqueueSnackbar(err.response?.data?.message || 'Image upload failed. Please try again.', { variant: 'error' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  /**
   * Removes an image both from Cloudinary storage and from the form's
   * local state. If the image has no publicId (e.g. it was added before
   * this field existed, or came from external data), it's only removed
   * from the form — there's nothing to delete remotely in that case.
   */
  const handleImageDelete = async (index: number) => {
    const image = form.images[index];
    setDeletingImageIndex(index);
    try {
      if (image.publicId) {
        await uploadAPI.delete(image.publicId);
      }
      setForm((f) => {
        const remaining = f.images.filter((_, i) => i !== index);
        // If the removed image was primary, promote the new first image.
        if (image.isPrimary && remaining.length > 0) {
          remaining[0] = { ...remaining[0], isPrimary: true };
        }
        return { ...f, images: remaining };
      });
      enqueueSnackbar('Image removed.', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to delete image. Please try again.', { variant: 'error' });
    } finally {
      setDeletingImageIndex(null);
    }
  };

  const handleSave = async () => {
    const payload = { ...form };
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={800}>
          Products
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Product
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 2 }}>
          <TextField
            placeholder="Search products..."
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
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Retail Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton height={40} />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    No products found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {products.map((p: any) => (
              <TableRow key={p._id} hover>
                <TableCell>
                  <Avatar variant="rounded" src={p.images?.[0]?.url} sx={{ width: 44, height: 44 }}>
                    <ImageIcon />
                  </Avatar>
                </TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.category?.name || '—'}</TableCell>
                <TableCell>₹{p.pricing?.retail ?? 0}</TableCell>
                <TableCell>
                  <Chip size="small" label={p.inStock ? 'In Stock' : 'Out of Stock'} color={p.inStock ? 'success' : 'default'} />
                  {p.stockQuantity > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({p.stockQuantity} units)
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={p.isActive ? 'Active' : 'Inactive'} color={p.isActive ? 'primary' : 'default'} variant="outlined" />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(p)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(p)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={700}>{editingId ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Product Name"
                fullWidth
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Category"
                fullWidth
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((c: any) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                label="Short Description"
                fullWidth
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                inputProps={{ maxLength: 300 }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Full Description"
                fullWidth
                required
                multiline
                minRows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Grid>

            <Grid size={12}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>
                Specifications
              </Typography>
            </Grid>
            {(['size', 'weight', 'type', 'color', 'finish', 'strength'] as const).map((field) => (
              <Grid size={{ xs: 6, sm: 4 }} key={field}>
                <TextField
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  fullWidth
                  size="small"
                  value={(form.specs as any)[field]}
                  onChange={(e) => setForm({ ...form, specs: { ...form.specs, [field]: e.target.value } })}
                />
              </Grid>
            ))}

            <Grid size={12}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>
                Pricing (₹)
              </Typography>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField
                label="Retail"
                type="number"
                fullWidth
                size="small"
                value={form.pricing.retail}
                onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, retail: Number(e.target.value) } })}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField
                label="Wholesale"
                type="number"
                fullWidth
                size="small"
                value={form.pricing.wholesale}
                onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, wholesale: Number(e.target.value) } })}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField
                label="Bulk"
                type="number"
                fullWidth
                size="small"
                value={form.pricing.bulk}
                onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, bulk: Number(e.target.value) } })}
              />
            </Grid>

            <Grid size={12}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1, mb: 1 }}>
                Images
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1.5 }}>
                {form.images.map((img, idx) => (
                  <Box key={img.publicId || img.url || idx} sx={{ position: 'relative' }}>
                    <Avatar
                      src={img.url}
                      variant="rounded"
                      sx={{
                        width: 64,
                        height: 64,
                        border: img.isPrimary ? '2px solid' : 'none',
                        borderColor: 'primary.main',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleImageDelete(idx)}
                      disabled={deletingImageIndex === idx}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        bgcolor: 'error.main',
                        color: '#fff',
                        width: 20,
                        height: 20,
                        '&:hover': { bgcolor: 'error.dark' },
                      }}
                    >
                      {deletingImageIndex === idx ? (
                        <CircularProgress size={12} sx={{ color: '#fff' }} />
                      ) : (
                        <CloseIcon sx={{ fontSize: 14 }} />
                      )}
                    </IconButton>
                  </Box>
                ))}
              </Box>
              <Button component="label" variant="outlined" size="small" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
              </Button>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControlLabel
                control={<Switch checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} />}
                label="In Stock"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Stock Quantity"
                type="number"
                fullWidth
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: Math.max(0, Number(e.target.value)) })}
                inputProps={{ min: 0 }}
                helperText="Leave 0 if you don't track exact quantity for this item"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControlLabel
                control={<Switch checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />}
                label="Featured"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControlLabel
                control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!form.name || !form.category || !form.description || createMutation.isPending || updateMutation.isPending}
          >
            {editingId ? 'Save Changes' : 'Create Product'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeletingProduct(true);
          try {
            // Delete the DB record first, same reasoning as the gallery
            // delete flow: if this fails, nothing on Cloudinary has been
            // touched yet, so there's no inconsistent partial state.
            await deleteMutation.mutateAsync(deleteTarget._id);

            const imagesWithPublicId = (deleteTarget.images || []).filter((img: any) => img.publicId);
            if (imagesWithPublicId.length > 0) {
              const results = await Promise.allSettled(
                imagesWithPublicId.map((img: any) => uploadAPI.delete(img.publicId)),
              );
              const failedCount = results.filter((r) => r.status === 'rejected').length;
              if (failedCount > 0) {
                enqueueSnackbar(
                  `Product deleted, but ${failedCount} of ${imagesWithPublicId.length} image(s) could not be removed from storage.`,
                  { variant: 'warning' },
                );
              }
            }
          } finally {
            setDeletingProduct(false);
            setDeleteTarget(null);
          }
        }}
        confirmDisabled={deletingProduct}
      />
    </Box>
  );
}
