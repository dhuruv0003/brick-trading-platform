'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useCustomerAuth from '../../hooks/useCustomerAuth';
import { PageLoader } from '../common/Loaders';

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
    return <PageLoader minHeight="100vh" />;
  }

  return <>{children}</>;
}
