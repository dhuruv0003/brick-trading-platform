'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid, Alert, Divider } from '@mui/material';
import useCustomerAuth from '../../../hooks/useCustomerAuth';
import { customerAuthAPI } from '../../../services/api';

export default function ProfilePage() {
  const { customer, checkAuth } = useCustomerAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    gstNumber: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileStatus, setProfileStatus] = useState({ loading: false, error: '', success: '' });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: '', success: '' });

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phone: customer.phone || '',
        companyName: customer.companyName || '',
        gstNumber: customer.gstNumber || '',
      });
    }
  }, [customer]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus({ loading: true, error: '', success: '' });
    try {
      await customerAuthAPI.updateProfile(formData);
      await checkAuth(); // Refresh customer data in Redux
      setProfileStatus({ loading: false, error: '', success: 'Profile updated successfully.' });
    } catch (err: any) {
      setProfileStatus({ loading: false, error: err.response?.data?.message || 'Failed to update profile.', success: '' });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ loading: false, error: 'New passwords do not match.', success: '' });
      return;
    }
    setPasswordStatus({ loading: true, error: '', success: '' });
    try {
      await customerAuthAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStatus({ loading: false, error: '', success: 'Password updated successfully.' });
    } catch (err: any) {
      setPasswordStatus({ loading: false, error: err.response?.data?.message || 'Failed to update password.', success: '' });
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} mb={3} fontFamily='"Playfair Display", serif'>
        My Profile
      </Typography>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 4 }}>
        <Typography variant="h6" fontWeight={700} mb={3}>Personal Information</Typography>
        
        {profileStatus.error && <Alert severity="error" sx={{ mb: 3 }}>{profileStatus.error}</Alert>}
        {profileStatus.success && <Alert severity="success" sx={{ mb: 3 }}>{profileStatus.success}</Alert>}

        <Box component="form" onSubmit={handleProfileSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField label="First Name" name="firstName" fullWidth required value={formData.firstName} onChange={handleProfileChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Last Name" name="lastName" fullWidth required value={formData.lastName} onChange={handleProfileChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email Address" value={customer?.email || ''} fullWidth disabled helperText="Email cannot be changed" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Phone Number" name="phone" fullWidth required value={formData.phone} onChange={handleProfileChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Company Name" name="companyName" fullWidth value={formData.companyName} onChange={handleProfileChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="GST Number" name="gstNumber" fullWidth value={formData.gstNumber} onChange={handleProfileChange} />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" disabled={profileStatus.loading}>
                {profileStatus.loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700} mb={3}>Change Password</Typography>

        {passwordStatus.error && <Alert severity="error" sx={{ mb: 3 }}>{passwordStatus.error}</Alert>}
        {passwordStatus.success && <Alert severity="success" sx={{ mb: 3 }}>{passwordStatus.success}</Alert>}

        <Box component="form" onSubmit={handlePasswordSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField label="Current Password" name="currentPassword" type="password" fullWidth required value={passwordData.currentPassword} onChange={handlePasswordChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="New Password" name="newPassword" type="password" fullWidth required value={passwordData.newPassword} onChange={handlePasswordChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Confirm New Password" name="confirmPassword" type="password" fullWidth required value={passwordData.confirmPassword} onChange={handlePasswordChange} />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" disabled={passwordStatus.loading}>
                {passwordStatus.loading ? 'Updating...' : 'Update Password'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
