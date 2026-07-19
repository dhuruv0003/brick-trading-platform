'use client';
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, TextField, InputAdornment, Table, TableContainer, TableHead, TableBody, TableRow,
  TableCell, Chip, IconButton, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, Grid2 as Grid,
  Switch, FormControlLabel, TablePagination, Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { blogAPI } from '../../../services/api';
import useAdminResource from '../../../hooks/useAdminResource';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';

const EMPTY_FORM = { title: '', excerpt: '', content: '', category: 'General', isPublished: false };

export default function AdminBlogPage() {
  const {
    items: posts, meta, isLoading, page, setPage, limit, setLimit, setSearch,
    createMutation, updateMutation, deleteMutation,
  } = useAdminResource({ key: 'blog', api: blogAPI });

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
  const openEdit = async (p: any) => {
    setEditingId(p._id);
    setDialogOpen(true);
    // List view omits `content` for payload size, so fetch the full post for editing.
    const res = await blogAPI.adminGetOne(p._id);
    const full = res.data.data.post;
    setForm({
      title: full.title,
      excerpt: full.excerpt,
      content: full.content,
      category: full.category || 'General',
      isPublished: full.isPublished ?? false,
    });
  };

  const handleSave = async () => {
    if (editingId) await updateMutation.mutateAsync({ id: editingId, payload: form });
    else await createMutation.mutateAsync(form);
    setDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={800}>Blog Posts</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>New Post</Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 2 }}>
          <TextField
            placeholder="Search posts..."
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
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Read Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={5}><Skeleton height={36} /></TableCell></TableRow>
            ))}
            {!isLoading && posts.length === 0 && (
              <TableRow><TableCell colSpan={5}>
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No blog posts yet.</Typography>
              </TableCell></TableRow>
            )}
            {posts.map((p: any) => (
              <TableRow key={p._id} hover>
                <TableCell>{p.title}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>{p.readTime} min</TableCell>
                <TableCell>
                  <Chip size="small" label={p.isPublished ? 'Published' : 'Draft'} color={p.isPublished ? 'success' : 'default'} />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteTarget(p._id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={700}>{editingId ? 'Edit Post' : 'New Blog Post'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField label="Title" fullWidth required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Category" fullWidth value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Excerpt"
                fullWidth
                required
                multiline
                minRows={2}
                inputProps={{ maxLength: 500 }}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Content"
                fullWidth
                required
                multiline
                minRows={8}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                helperText="Supports HTML markup for rich formatting."
              />
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
          <Button variant="contained" onClick={handleSave} disabled={!form.title || !form.excerpt || !form.content}>
            {editingId ? 'Save Changes' : 'Create Post'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Post"
        message="Are you sure you want to delete this blog post?"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => { if (deleteTarget) await deleteMutation.mutateAsync(deleteTarget); setDeleteTarget(null); }}
      />
    </Box>
  );
}
