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
import { categoriesAPI } from '../../../services/api';
import useAdminResource from '../../../hooks/useAdminResource';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';

const EMPTY_FORM = { name: '', description: '', parent: '', isActive: true };

export default function AdminCategoriesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    setForm({ name: c.name || '', description: c.description || '', parent: c.parent?._id || c.parent || '', isActive: c.isActive ?? true });
    setDialogOpen(true);
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
                  <TableCell colSpan={4}>
                    <Skeleton height={36} />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    No categories found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {categories.map((c: any) => (
              <TableRow key={c._id} hover>
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
