'use client';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { authAPI } from '../services/api';
import { loginStart, loginSuccess, loginFailure, logout as logoutAction } from '../store/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, token, isAuthenticated, loading, error, hydrated } = useSelector((state) => state.auth);
  const [checking, setChecking] = useState(true);

  const login = useCallback(
    async (email, password) => {
      dispatch(loginStart());
      try {
        const res = await authAPI.login({ email, password });
        const { token, data } = res.data;
        dispatch(loginSuccess({ token, user: data.user }));
        return { success: true };
      } catch (err) {
        const message = err.response?.data?.message || 'Login failed. Please try again.';
        dispatch(loginFailure(message));
        return { success: false, message };
      }
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore network errors on logout
    }
    dispatch(logoutAction());
    router.push('/admin/login');
  }, [dispatch, router]);

  // Verify token is still valid, but only once localStorage hydration has
  // happened — otherwise this can fire with token=null before hydration
  // completes and incorrectly log out an already-authenticated admin.
  useEffect(() => {
    if (!hydrated) return undefined;

    let cancelled = false;
    const verify = async () => {
      if (!token) {
        setChecking(false);
        return;
      }
      try {
        await authAPI.getMe();
      } catch {
        if (!cancelled) dispatch(logoutAction());
      } finally {
        if (!cancelled) setChecking(false);
      }
    };
    verify();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  return { user, token, isAuthenticated, loading, error, checking, hydrated, login, logout };
}

export default useAuth;
