'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Box, Paper, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { customerAuthAPI } from '../../../services/api';
import GuestOnlyGuard from '../../../components/guards/GuestOnlyGuard';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await customerAuthAPI.forgotPassword({ email });
      setSuccessMsg(res.data.message || 'Reset link sent to your email.');
      setEmail('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to send reset link. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestOnlyGuard>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, maxWidth: 440, width: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <LockResetIcon sx={{ color: '#fff' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} fontFamily='"Playfair Display", serif'>
            Forgot Password?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Enter your email and we'll send you a reset link
          </Typography>
        </Box>

        {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email Address"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ mb: 3, borderRadius: 2 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
          </Button>

          <Typography variant="body2" align="center" color="text.secondary">
            Remembered your password?{' '}
            <Link href="/auth/login" style={{ textDecoration: 'none' }}>
              <Typography component="span" color="primary" fontWeight={700}>
                Sign in
              </Typography>
            </Link>
          </Typography>
        </Box>
      </Paper>
    </GuestOnlyGuard>
  );
}
