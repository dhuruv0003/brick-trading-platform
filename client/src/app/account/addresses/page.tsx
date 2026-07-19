'use client';
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, Alert, CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { customerAddressAPI } from '../../../services/api';

const EMPTY_FORM = {
  label: 'Home',
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  landmark: '',
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState('');

  const fetchAddresses = async () => {
    try {
      const res = await customerAddressAPI.getAll();
      setAddresses(res.data.data.addresses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const handleOpenDialog = (address: any = null) => {
    setFormError('');
    if (address) {
      setEditId(address._id);
      setFormData({
        label: address.label || 'Home',
        fullName: address.fullName || '',
        phone: address.phone || '',
        addressLine1: address.addressLine1 || '',
        addressLine2: address.addressLine2 || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        landmark: address.landmark || '',
      });
    } else {
      setEditId(null);
      setFormData({ ...EMPTY_FORM });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => { setOpenDialog(false); setFormError(''); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editId) {
        await customerAddressAPI.update(editId, formData);
      } else {
        await customerAddressAPI.create(formData);
      }
      await fetchAddresses();
      handleCloseDialog();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await customerAddressAPI.delete(id);
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await customerAddressAPI.setDefault(id);
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={800} fontFamily='"Playfair Display", serif'>
          Saved Addresses
        </Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Add New Address
        </Button>
      </Box>

      {addresses.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <LocationOnIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} mb={1}>No saved addresses</Typography>
          <Typography color="text.secondary" mb={3}>
            Add a shipping address to speed up checkout.
          </Typography>
          <Button variant="contained" onClick={() => handleOpenDialog()}>
            Add Your First Address
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {addresses.map((addr) => (
            <Grid item xs={12} md={6} key={addr._id}>
              <Paper
                elevation={0}
                sx={{
                  p: 3, borderRadius: 3, border: '2px solid',
                  borderColor: addr.isDefault ? 'primary.main' : 'divider',
                  position: 'relative',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700}>{addr.label || 'Address'}</Typography>
                    {addr.isDefault && <Chip label="Default" size="small" color="primary" />}
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpenDialog(addr)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(addr._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="subtitle2" fontWeight={600} mb={0.5}>{addr.fullName}</Typography>
                <Typography variant="body2" color="text.secondary" mb={0.25}>{addr.addressLine1}</Typography>
                {addr.addressLine2 && (
                  <Typography variant="body2" color="text.secondary" mb={0.25}>{addr.addressLine2}</Typography>
                )}
                {addr.landmark && (
                  <Typography variant="body2" color="text.secondary" mb={0.25}>Near: {addr.landmark}</Typography>
                )}
                <Typography variant="body2" color="text.secondary" mb={0.25}>
                  {addr.city}, {addr.state} – {addr.pincode}
                </Typography>
                <Typography variant="body2" fontWeight={500} mt={1}>📞 {addr.phone}</Typography>

                {!addr.isDefault && (
                  <Button
                    variant="text" size="small" startIcon={<StarBorderIcon />}
                    onClick={() => handleSetDefault(addr._id)} sx={{ mt: 1.5 }}
                  >
                    Set as Default
                  </Button>
                )}
                {addr.isDefault && (
                  <Button variant="text" size="small" color="primary" startIcon={<StarIcon />} disabled sx={{ mt: 1.5 }}>
                    Default Address
                  </Button>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── Address Form Dialog ────────────────────────────────────────────── */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Address' : 'Add New Address'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent dividers>
            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Address Label (e.g. Home, Office, Site)"
                  name="label" fullWidth value={formData.label} onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Full Name" name="fullName" fullWidth required value={formData.fullName} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Phone Number" name="phone" fullWidth required value={formData.phone} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address Line 1 (House/Flat No., Street)"
                  name="addressLine1" fullWidth required multiline rows={2}
                  value={formData.addressLine1} onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address Line 2 (optional)"
                  name="addressLine2" fullWidth
                  value={formData.addressLine2} onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="City" name="city" fullWidth required value={formData.city} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="State" name="state" fullWidth required value={formData.state} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Pincode" name="pincode" fullWidth required
                  value={formData.pincode} onChange={handleChange}
                  inputProps={{ maxLength: 6, pattern: '[0-9]{6}' }}
                  helperText="6-digit pincode"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Landmark (optional)" name="landmark" fullWidth
                  value={formData.landmark} onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving…' : (editId ? 'Update Address' : 'Save Address')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
