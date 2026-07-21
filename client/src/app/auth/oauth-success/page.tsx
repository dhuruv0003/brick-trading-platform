'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { customerAuthAPI } from '../../../services/api';
import { customerLoginSuccess } from '../../../store/customerSlice';
import { PageLoader } from '../../../components/common/Loaders';

function OAuthSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const processOAuth = async () => {
      const token = searchParams?.get('token');
      if (!token) {
        router.push('/auth/login?error=oauth_failed');
        return;
      }

      // Briefly store token to allow interceptor to fetch profile
      localStorage.setItem('brickpro_customer_token', token);

      try {
        const response = await customerAuthAPI.getMe();
        const customer = response.data.data.customer;

        // Fully hydrate Redux. OAuth has no "remember me" checkbox, so
        // treat Google sign-ins as persistent (localStorage) by default —
        // matching the UX users expect from "Continue with Google".
        dispatch(customerLoginSuccess({ customer, token, rememberMe: true }));
        router.push('/account/dashboard');
      } catch (error) {
        console.error('OAuth profile fetch failed:', error);
        localStorage.removeItem('brickpro_customer_token');
        router.push('/auth/login?error=oauth_failed');
      }
    };

    processOAuth();
  }, [searchParams, router, dispatch]);

  return <PageLoader minHeight="50vh" label="Completing sign in..." />;
}

export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={<PageLoader minHeight="50vh" />}>
      <OAuthSuccessHandler />
    </Suspense>
  );
}
