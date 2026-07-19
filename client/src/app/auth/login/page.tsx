'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import GoogleIcon from '@mui/icons-material/Google';
import useCustomerAuth from '../../../hooks/useCustomerAuth';
import GuestOnlyGuard from '../../../components/guards/GuestOnlyGuard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading, isAuthenticated } = useCustomerAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const redirect = searchParams?.get('redirect') || '/account/dashboard';
  const errorParam = searchParams?.get('error');

  useEffect(() => {
    if (errorParam === 'oauth_failed') {
      setFormError('Google sign-in failed. Please try again.');
    } else if (errorParam === 'session_expired') {
      setFormError('Your session has expired for security reasons. Please log in again.');
    } else if (searchParams?.get('reset') === 'success') {
      setFormSuccess('Password reset successfully. You can now login.');
    }
  }, [errorParam, searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect);
    }
  }, [isAuthenticated, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    const result = await login(email, password, rememberMe);
    if (!result.success) {
      setFormError(result.message);
    }
    // if success, useEffect will handle redirect
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/customer/auth/google`;
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
            <LockIcon sx={{ color: '#fff' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} fontFamily='"Playfair Display", serif'>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Sign in to your BrickPro account
          </Typography>
        </Box>

        {formError && <Alert severity="error" sx={{ mb: 3 }}>{formError}</Alert>}
        {formSuccess && <Alert severity="success" sx={{ mb: 3 }}>{formSuccess}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email Address"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2.5 }}
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 1.5 }}
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
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                />
              }
              label={<Typography variant="body2" color="text.secondary">Remember me</Typography>}
            />
            <Link href="/auth/forgot-password" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary" fontWeight={600}>
                Forgot Password?
              </Typography>
            </Link>
          </Box>

          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ mb: 3, borderRadius: 2 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">OR</Typography>
          </Divider>

          <Button
            variant="outlined"
            size="large"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ mb: 3, borderRadius: 2, color: 'text.primary', borderColor: 'divider' }}
          >
            Continue with Google
          </Button>

          <Typography variant="body2" align="center" color="text.secondary">
            Don't have an account?{' '}
            <Link href={`/auth/register?redirect=${encodeURIComponent(redirect)}`} style={{ textDecoration: 'none' }}>
              <Typography component="span" color="primary" fontWeight={700}>
                Sign up
              </Typography>
            </Link>
          </Typography>
        </Box>
      </Paper>
    </GuestOnlyGuard>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
