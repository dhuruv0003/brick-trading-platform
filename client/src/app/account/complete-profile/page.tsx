'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import useCustomerAuth from '../../../hooks/useCustomerAuth';
import { customerAuthAPI } from '../../../services/api';
import { updateCustomer } from '../../../store/customerSlice';

const PHONE_REGEX = /^[+]?[\d\s\-().]{7,20}$/;

export default function CompleteProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { customer } = useCustomerAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmed = phone.trim();
    if (!trimmed) {
      setFormError('Phone number is required.');
      return;
    }
    if (!PHONE_REGEX.test(trimmed)) {
      setFormError('Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    try {
      const response = await customerAuthAPI.updateProfile({ phone: trimmed });
      dispatch(updateCustomer(response.data.data.customer));
      router.push('/account/dashboard');
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Could not save your phone number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Paper elevation={0} sx={{ p: 5, maxWidth: 420, width: '100%', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <PhoneIcon sx={{ color: '#fff' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} fontFamily='"Playfair Display", serif'>
            One last step
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {customer?.firstName ? `Welcome, ${customer.firstName}. ` : ''}
            Add your phone number to finish setting up your account.
          </Typography>
        </Box>

        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Phone number"
            type="tel"
            fullWidth
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            sx={{ mb: 3 }}
            autoFocus
            placeholder="+91 98765 43210"
          />
          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
            {loading ? 'Saving...' : 'Continue'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}