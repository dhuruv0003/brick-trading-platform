'use client';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { hydrateFromStorage } from '../../store/authSlice';

/**
 * Reads persisted auth (token/user) from localStorage and pushes it into
 * Redux — but only after mount, so the server-rendered HTML and the first
 * client render both start from the same neutral "logged out" state.
 * This prevents the admin login/dashboard hydration mismatch.
 */
export default function AuthHydrator() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(hydrateFromStorage());
  }, [dispatch]);

  return null;
}
