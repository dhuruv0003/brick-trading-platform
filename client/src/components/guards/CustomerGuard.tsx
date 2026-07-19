'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useCustomerAuth from '../../hooks/useCustomerAuth';
import { Box, CircularProgress } from '@mui/material';

export default function CustomerGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrated } = useCustomerAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, hydrated, router, pathname]);

  if (!hydrated || !isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
