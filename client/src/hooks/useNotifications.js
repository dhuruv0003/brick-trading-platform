import { useState, useEffect, useCallback, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { notificationsAPI } from '../services/api';
import useCustomerAuth from './useCustomerAuth';
import { getSocket, disconnectSocket } from '../lib/socket';

export default function useNotifications() {
  const { customer, isAuthenticated } = useCustomerAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const listenerAttached = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initial load
  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Socket connection — join room + listen for realtime pushes
  useEffect(() => {
    if (!isAuthenticated || !customer?._id) {
      disconnectSocket();
      listenerAttached.current = false;
      return;
    }

    const socket = getSocket();
    if (!socket) return;

    socket.emit('join', customer._id);

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
      socket.emit('join', customer._id);
    });

    return () => {
      // Don't fully disconnect on every unmount (component may remount
      // during navigation) — only tear down when the effect deps change
      // due to logout, handled in the guard above.
    };
  }, [isAuthenticated, customer?._id, enqueueSnackbar]);

  // Disconnect socket entirely when the app fully unmounts
  useEffect(() => {
    return () => disconnectSocket();
  }, []);

  const markRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await notificationsAPI.markRead(id);
    } catch {
      fetchNotifications(); // resync on failure
    }
  }, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await notificationsAPI.markAllRead();
    } catch {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const remove = useCallback(async (id) => {
    const wasUnread = notifications.find((n) => n._id === id)?.isRead === false;
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await notificationsAPI.delete(id);
    } catch {
      fetchNotifications();
    }
  }, [notifications, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    remove,
    refresh: fetchNotifications,
  };
}
