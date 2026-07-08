'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import useAuth from '../../hooks/useAuth';
import AdminShell from '../../components/admin/AdminShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, checking } = useAuth();
  const isLoginPage = pathname === '/admin/login';

  React.useEffect(() => {
    if (!checking && !isAuthenticated && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [checking, isAuthenticated, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (checking) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) return null; // redirecting

  return <AdminShell>{children}</AdminShell>;
}
