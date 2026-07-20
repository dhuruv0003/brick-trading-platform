'use client';
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, TextField, InputAdornment, Table, TableContainer, TableHead, TableBody, TableRow,
  TableCell, Chip, IconButton, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, Grid2 as Grid,
  MenuItem, Switch, FormControlLabel, TablePagination, Tooltip, Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { usersAPI } from '../../../services/api';
import useAdminResource from '../../../hooks/useAdminResource';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import useAuth from '../../../hooks/useAuth';

const ROLES = ['super_admin', 'admin', 'manager', 'staff'];
const EMPTY_FORM = { name: '', email: '', password: '', role: 'staff', isActive: true };

export default function AdminUsersPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user: currentUser } = useAuth();
  const {
    items: users, meta, isLoading, page, setPage, limit, setLimit, setSearch,
    createMutation, updateMutation, deleteMutation,
  } = useAdminResource({ key: 'users', api: usersAPI, listFn: 'getAll' });

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
  const openEdit = (u: any) => {
    setEditingId(u._id);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, isActive: u.isActive ?? true });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editingId) {
      const { password, ...rest } = form;
      await updateMutation.mutateAsync({ id: editingId, payload: rest });
    } else {
      await createMutation.mutateAsync(form);
    }
    setDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={800}>Users</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add User</Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 2 }}>
          <TextField
            placeholder="Search users..."
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
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={5}><Skeleton height={36} /></TableCell></TableRow>
            ))}
            {!isLoading && users.length === 0 && (
              <TableRow><TableCell colSpan={5}>
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No users yet.</Typography>
              </TableCell></TableRow>
            )}
            {users.map((u: any) => (
              <TableRow key={u._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.85rem' }}>{u.name?.charAt(0)}</Avatar>
                    {u.name}
                  </Box>
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Chip size="small" label={u.role?.replace('_', ' ')} sx={{ textTransform: 'capitalize' }} /></TableCell>
                <TableCell>
                  <Chip size="small" label={u.isActive ? 'Active' : 'Inactive'} color={u.isActive ? 'success' : 'default'} />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(u)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete">
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={u._id === currentUser?._id}
                        onClick={() => setDeleteTarget(u._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
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
        <DialogTitle fontWeight={700}>{editingId ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField label="Full Name" fullWidth required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={Boolean(editingId)}
              />
            </Grid>
            {!editingId && (
              <Grid size={12}>
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  helperText="Minimum 8 characters"
                />
              </Grid>
            )}
            <Grid size={12}>
              <TextField select label="Role" fullWidth value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => <MenuItem key={r} value={r} sx={{ textTransform: 'capitalize' }}>{r.replace('_', ' ')}</MenuItem>)}
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
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!form.name || !form.email || (!editingId && form.password.length < 8)}
          >
            {editingId ? 'Save Changes' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete User"
        message="Are you sure you want to delete this user account?"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => { if (deleteTarget) await deleteMutation.mutateAsync(deleteTarget); setDeleteTarget(null); }}
      />
    </Box>
  );
}
