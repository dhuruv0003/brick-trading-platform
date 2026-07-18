'use client';
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Paper, Tabs, Tab, TextField, Button, Grid2 as Grid, Stack, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Alert, Skeleton, Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useSnackbar } from 'notistack';
import { useDispatch } from 'react-redux';
import { authAPI, customerAPI, getApiErrorMessage } from '../../../services/api';
import useAuth from '../../../hooks/useAuth';
import { updateUser } from '../../../store/authSlice';

const EMPTY_ADDRESS = { label: 'Home', line1: '', line2: '', city: '', state: '', pincode: '', phone: '' };

export default function CustomerProfilePage() {
  const [tab, setTab] = useState(0);
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>My Account</Typography>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 1 }}>
          <Tab label="Personal Info" />
          <Tab label="Change Password" />
          <Tab label="Delivery Addresses" />
        </Tabs>
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {tab === 0 && <PersonalInfoTab />}
          {tab === 1 && <ChangePasswordTab />}
          {tab === 2 && <AddressesTab />}
        </Box>
      </Paper>
    </Box>
  );
}

function PersonalInfoTab() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', company: user?.company || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      dispatch(updateUser(res.data.data.user));
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err, 'Could not update profile.'), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Grid container spacing={2.5} sx={{ maxWidth: 480 }}>
      <Grid size={12}>
        <TextField label="Full Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Grid>
      <Grid size={12}>
        <TextField label="Mobile Number" fullWidth value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </Grid>
      <Grid size={12}>
        <TextField label="Company / Business Name (optional)" fullWidth value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
      </Grid>
      <Grid size={12}>
        <TextField label="Email" fullWidth value={user?.email || ''} disabled helperText="Email address cannot be changed." />
      </Grid>
      <Grid size={12}>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Grid>
    </Grid>
  );
}

function ChangePasswordTab() {
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setSaving(true);
    try {
      await authAPI.updatePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      enqueueSnackbar('Password changed successfully', { variant: 'success' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not change password.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Grid container spacing={2.5} sx={{ maxWidth: 480 }}>
      {error && <Grid size={12}><Alert severity="error">{error}</Alert></Grid>}
      <Grid size={12}>
        <TextField label="Current Password" type="password" fullWidth value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
      </Grid>
      <Grid size={12}>
        <TextField label="New Password" type="password" fullWidth value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} helperText="At least 8 characters." />
      </Grid>
      <Grid size={12}>
        <TextField label="Confirm New Password" type="password" fullWidth value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
      </Grid>
      <Grid size={12}>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Updating...' : 'Update Password'}
        </Button>
      </Grid>
    </Grid>
  );
}

function AddressesTab() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [saving, setSaving] = useState(false);

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['customer', 'addresses'],
    queryFn: async () => (await customerAPI.getAddresses()).data.data.addresses,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['customer', 'addresses'] });

  const openAdd = () => { setEditingId(null); setForm(EMPTY_ADDRESS); setDialogOpen(true); };
  const openEdit = (addr: any) => { setEditingId(addr._id); setForm(addr); setDialogOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await customerAPI.updateAddress(editingId, form);
      } else {
        await customerAPI.addAddress(form);
      }
      enqueueSnackbar('Address saved', { variant: 'success' });
      setDialogOpen(false);
      refresh();
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err, 'Could not save address.'), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this address?')) return;
    try {
      await customerAPI.deleteAddress(id);
      enqueueSnackbar('Address removed', { variant: 'success' });
      refresh();
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err, 'Could not remove address.'), { variant: 'error' });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await customerAPI.setDefaultAddress(id);
      refresh();
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err, 'Could not set default address.'), { variant: 'error' });
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Your Delivery Addresses</Typography>
        <Button startIcon={<AddIcon />} onClick={openAdd} size="small" variant="contained">Add Address</Button>
      </Stack>

      {isLoading ? (
        <Stack spacing={1.5}>{[1, 2].map((i) => <Skeleton key={i} variant="rounded" height={90} />)}</Stack>
      ) : !addresses?.length ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          You haven't added any delivery addresses yet.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {addresses.map((addr: any) => (
            <Paper key={addr._id} elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" fontWeight={700}>{addr.label}</Typography>
                    {addr.isDefault && <Chip label="Default" size="small" color="primary" />}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Phone: {addr.phone}</Typography>
                </Box>
                <Stack direction="row">
                  <IconButton size="small" onClick={() => handleSetDefault(addr._id)} title="Set as default">
                    {addr.isDefault ? <StarIcon fontSize="small" color="primary" /> : <StarBorderIcon fontSize="small" />}
                  </IconButton>
                  <IconButton size="small" onClick={() => openEdit(addr)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => handleDelete(addr._id)}><DeleteIcon fontSize="small" /></IconButton>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editingId ? 'Edit Address' : 'Add Address'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField label="Label (e.g. Home, Site Office)" fullWidth value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <TextField label="Address Line 1" fullWidth required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <TextField label="Address Line 2 (optional)" fullWidth value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField label="City" fullWidth required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField label="State" fullWidth required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField label="Pincode" fullWidth required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField label="Phone Number" fullWidth required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Address'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
