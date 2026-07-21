'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Paper, TextField, Button, Typography, Alert, InputAdornment, IconButton } from '@mui/material';
import { PageLoader } from '../../../components/common/Loaders';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import useAuth from '../../../hooks/useAuth';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, loading, isAuthenticated, hydrated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  // An admin who's already logged in shouldn't be able to just sit on the
  // login form (or land back on it via browser back/forward) — send them
  // straight to the dashboard instead. `hydrated` guards against a flash
  // of the login form before the persisted session has loaded.
  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace('/admin');
    }
  }, [hydrated, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const result = await login(email, password);
    if (result.success) {
      router.push('/admin');
    } else {
      setFormError(result.message);
    }
  };

  if (!hydrated || isAuthenticated) {
    return <PageLoader minHeight="100vh" />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
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
            <LockIcon sx={{ color: '#fff' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} fontFamily='"Playfair Display", serif'>
            Admin Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            BrickPro Content & Operations Console
          </Typography>
        </Box>

        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email address"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2.5 }}
            autoFocus
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
