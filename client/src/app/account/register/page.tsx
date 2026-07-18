'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box, Paper, TextField, Button, Typography, Alert } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useDispatch } from 'react-redux';
import { authAPI, getApiErrorMessage } from '../../../services/api';
import { loginSuccess } from '../../../store/authSlice';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      const { token, data } = res.data;
      dispatch(loginSuccess({ token, user: data.user }));
      router.push('/account/dashboard');
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Could not create your account. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', px: 2, py: 4 }}>
      <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, maxWidth: 440, width: '100%', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <PersonAddIcon sx={{ color: '#fff' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} fontFamily='"Playfair Display", serif'>
            Create Your Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Order bricks and building material online, track deliveries, and re-order in seconds.
          </Typography>
        </Box>

        {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField label="Full Name" fullWidth required value={form.name} onChange={handleChange('name')} sx={{ mb: 2.5 }} autoFocus />
          <TextField label="Mobile Number" fullWidth required value={form.phone} onChange={handleChange('phone')} sx={{ mb: 2.5 }} helperText="We'll use this to update you about your orders." />
          <TextField label="Email address" type="email" fullWidth required value={form.email} onChange={handleChange('email')} sx={{ mb: 2.5 }} />
          <TextField label="Password" type="password" fullWidth required value={form.password} onChange={handleChange('password')} sx={{ mb: 3 }} helperText="At least 8 characters." />
          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ py: 1.3 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ textAlign: 'center', mt: 3 }}>
          Already have an account?{' '}
          <Link href="/account/login" style={{ color: 'inherit', fontWeight: 700 }}>
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
