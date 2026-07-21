'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useCustomerAuth from '../../hooks/useCustomerAuth';
import { PageLoader } from '../common/Loaders';

// Guards the customer-facing /auth/* pages (login, register, forgot/reset
// password) so an already-logged-in customer is redirected to their
// dashboard instead of seeing the guest forms.
//
// This must only ever look at customer auth. Admin auth is a completely
// separate flow (see /admin/login) and must never influence this guard —
// otherwise an admin who is still logged in gets silently redirected to
// /admin the moment they click "Login/Register" on the main site, and
// never sees the customer login form at all.
export default function GuestOnlyGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated: isCustomerAuthenticated, hydrated: customerHydrated } = useCustomerAuth();
  const router = useRouter();

  useEffect(() => {
    if (customerHydrated && isCustomerAuthenticated) {
      router.push('/account/dashboard');
    }
  }, [isCustomerAuthenticated, customerHydrated, router]);

  if (!customerHydrated || isCustomerAuthenticated) {
    return <PageLoader minHeight="100vh" />;
  }

  return <>{children}</>;
}