import { useState, useEffect, useCallback, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { adminNotificationsAPI } from '../services/api';
import useAuth from './useAuth';
import { getSocket, disconnectSocket } from '../lib/socket';

/**
 * Real-time in-app notifications for admin/manager/staff users (e.g. "new
 * order placed"). Mirrors `useNotifications.js` (the customer-facing
 * equivalent) — same fetch/poll/socket/mark-read shape, scoped to the
 * shared 'admin' socket room and /admin/notifications endpoints instead of
 * a per-customer room.
 */
export default function useAdminNotifications() {
  const { user, isAuthenticated } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const listenerAttached = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await adminNotificationsAPI.getAll();
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch admin notifications', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initial load
  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Socket connection — join the shared admin room + listen for realtime pushes
  useEffect(() => {
    if (!isAuthenticated || !user) {
      disconnectSocket();
      listenerAttached.current = false;
      return;
    }

    const socket = getSocket();
    if (!socket) return;

    socket.emit('joinAdmin');

    if (!listenerAttached.current) {
      socket.on('notification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        enqueueSnackbar(notification.title, {
          variant: 'info',
          autoHideDuration: 6000,
        });
      });
      listenerAttached.current = true;
    }

    // Re-join room on reconnect (e.g. after network drop)
    socket.on('connect', () => {
      socket.emit('joinAdmin');
    });

    return () => {
      // Don't fully disconnect on every unmount (component may remount
      // during navigation) — only tear down when the effect deps change
      // due to logout, handled in the guard above.
    };
  }, [isAuthenticated, user, enqueueSnackbar]);

  // Disconnect socket entirely when the app fully unmounts
  useEffect(() => {
    return () => disconnectSocket();
  }, []);

  const markRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await adminNotificationsAPI.markRead(id);
    } catch {
      fetchNotifications(); // resync on failure
    }
  }, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await adminNotificationsAPI.markAllRead();
    } catch {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    refresh: fetchNotifications,
  };
}
