'use client';
import React, { useState, Suspense } from 'react';
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
  Grid,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GoogleIcon from '@mui/icons-material/Google';
import useCustomerAuth from '../../../hooks/useCustomerAuth';
import GuestOnlyGuard from '../../../components/guards/GuestOnlyGuard';
import { PageLoader } from '../../../components/common/Loaders';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, loading } = useCustomerAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    gstNumber: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const redirect = searchParams?.get('redirect') || '/account/dashboard';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      companyName: formData.companyName || undefined,
      gstNumber: formData.gstNumber || undefined,
    });

    if (result.success) {
      router.push(redirect);
    } else {
      setFormError(result.message);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/customer/auth/google`;
  };

  return (
    <GuestOnlyGuard>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, maxWidth: 540, width: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
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
            <PersonAddIcon sx={{ color: '#fff' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} fontFamily='"Playfair Display", serif'>
            Create an Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Join BrickPro for seamless purchasing and tracking
          </Typography>
        </Box>

        {formError && <Alert severity="error" sx={{ mb: 3 }}>{formError}</Alert>}

        <Button
          variant="outlined"
          size="large"
          fullWidth
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          sx={{ mb: 3, borderRadius: 2, color: 'text.primary', borderColor: 'divider' }}
        >
          Sign up with Google
        </Button>

        <Divider sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">OR REGISTER WITH EMAIL</Typography>
        </Divider>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                name="firstName"
                fullWidth
                required
                value={formData.firstName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                name="lastName"
                fullWidth
                required
                value={formData.lastName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email Address"
                name="email"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                name="phone"
                fullWidth
                required
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                value={formData.password}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                value={formData.confirmPassword}
                onChange={handleChange}
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
            </Grid>
          </Grid>

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1.5, color: 'text.secondary' }}>
            Business Details (Optional)
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Company Name"
                name="companyName"
                fullWidth
                value={formData.companyName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="GST Number"
                name="gstNumber"
                fullWidth
                value={formData.gstNumber}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ mb: 3, borderRadius: 2 }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <Typography variant="body2" align="center" color="text.secondary">
            Already have an account?{' '}
            <Link href={`/auth/login?redirect=${encodeURIComponent(redirect)}`} style={{ textDecoration: 'none' }}>
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

export default function RegisterPage() {
  return (
    <Suspense
      fallback={<PageLoader />}
    >
      <RegisterForm />
    </Suspense>
  );
}
