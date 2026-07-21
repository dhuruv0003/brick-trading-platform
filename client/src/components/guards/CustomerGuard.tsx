'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useCustomerAuth from '../../hooks/useCustomerAuth';
import { PageLoader } from '../common/Loaders';

const COMPLETE_PROFILE_PATH = '/account/complete-profile';

export default function CustomerGuard({ children }: { children: React.ReactNode }) {
  const { customer, isAuthenticated, hydrated } = useCustomerAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Google sign-ups can reach us with no phone number on file (Google
  // doesn't provide one). Phone is mandatory before using the account or
  // checking out, so route everywhere except the completion page itself
  // there until it's filled in.
  const needsPhone = Boolean(customer && customer.authProvider === 'google' && !customer.phone);
  const isCompleteProfilePage = pathname === COMPLETE_PROFILE_PATH;

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (needsPhone && !isCompleteProfilePage) {
      router.push(COMPLETE_PROFILE_PATH);
    }
  }, [isAuthenticated, hydrated, needsPhone, isCompleteProfilePage, router, pathname]);

  if (!hydrated || !isAuthenticated) {
    return <PageLoader minHeight="100vh" />;
  }

  if (needsPhone && !isCompleteProfilePage) {
    return <PageLoader minHeight="100vh" />;
  }

  return <>{children}</>;
}