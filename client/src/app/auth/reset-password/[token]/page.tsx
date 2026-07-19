'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Paper, TextField, Button, Typography, Alert, InputAdornment, IconButton } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { customerAuthAPI } from '../../../../services/api';
import GuestOnlyGuard from '../../../../components/guards/GuestOnlyGuard';

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      await customerAuthAPI.resetPassword(params.token, { password });
      router.push('/auth/login?reset=success');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to reset password. Token may be invalid or expired.');
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
          Reset Password
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Create a new strong password
        </Typography>
      </Box>

      {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Confirm New Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ borderRadius: 2 }}>
          {loading ? 'Saving...' : 'Save New Password'}
        </Button>
      </Box>
    </Paper>
    </GuestOnlyGuard>
  );
}
