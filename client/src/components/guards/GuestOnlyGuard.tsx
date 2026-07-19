'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useCustomerAuth from '../../hooks/useCustomerAuth';
import useAuth from '../../hooks/useAuth';
import { Box, CircularProgress } from '@mui/material';

export default function GuestOnlyGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated: isCustomerAuthenticated, hydrated: customerHydrated } = useCustomerAuth();
  const { isAuthenticated: isAdminAuthenticated, hydrated: adminHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (customerHydrated && isCustomerAuthenticated) {
      router.push('/account/dashboard');
    } else if (adminHydrated && isAdminAuthenticated) {
      router.push('/admin');
    }
  }, [isCustomerAuthenticated, customerHydrated, isAdminAuthenticated, adminHydrated, router]);

  if (!customerHydrated || !adminHydrated || isCustomerAuthenticated || isAdminAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
