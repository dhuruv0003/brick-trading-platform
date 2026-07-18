'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import useAuth from '../../hooks/useAuth';
import AccountShell from '../../components/account/AccountShell';

const PUBLIC_ACCOUNT_PATHS = ['/account/login', '/account/register'];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, checking } = useAuth();
  const isPublicPage = PUBLIC_ACCOUNT_PATHS.includes(pathname || '');

  React.useEffect(() => {
    if (checking) return;

    if (!isAuthenticated && !isPublicPage) {
      router.replace('/account/login');
      return;
    }
    // A staff/admin account trying to open the customer portal — send them
    // to the admin panel they actually have access to, rather than showing
    // a confusing empty customer dashboard.
    if (isAuthenticated && user?.role !== 'customer' && !isPublicPage) {
      router.replace('/admin');
    }
  }, [checking, isAuthenticated, isPublicPage, user, router]);

  if (isPublicPage) return <>{children}</>;

  if (checking) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || user?.role !== 'customer') return null; // redirecting

  return <AccountShell>{children}</AccountShell>;
}
