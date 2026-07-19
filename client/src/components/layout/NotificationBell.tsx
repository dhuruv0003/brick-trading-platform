'use client';
import React, { useState } from 'react';
import {
  IconButton, Badge, Popover, Box, Typography, List, ListItem,
  ListItemText, ListItemButton, Button, Divider, CircularProgress,
  IconButton as MuiIconButton,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CampaignIcon from '@mui/icons-material/Campaign';
import PersonIcon from '@mui/icons-material/Person';
import { useRouter } from 'next/navigation';
import useNotifications from '../../hooks/useNotifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const TYPE_ICONS: Record<string, React.ReactNode> = {
  order: <ShoppingBagIcon fontSize="small" />,
  promotion: <CampaignIcon fontSize="small" />,
  profile: <PersonIcon fontSize="small" />,
  alert: <NotificationsIcon fontSize="small" />,
};

export default function NotificationBell() {
  const router = useRouter();
  const { notifications, unreadCount, loading, markRead, markAllRead, remove } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const open = Boolean(anchorEl);

  const handleClick = (n: any) => {
    if (!n.isRead) markRead(n._id);
    setAnchorEl(null);
    if (n.link) router.push(n.link);
  };

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ position: 'relative' }}>
        <Badge badgeContent={unreadCount} color="error" max={9}>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 380, maxWidth: '90vw', borderRadius: 3, mt: 1 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllRead}>Mark all read</Button>
          )}
        </Box>
        <Divider />

        {loading ? (
          <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">No notifications yet.</Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflowY: 'auto', p: 0 }}>
            {notifications.slice(0, 15).map((n: any) => (
              <ListItem
                key={n._id}
                disablePadding
                secondaryAction={
                  <MuiIconButton
                    edge="end" size="small"
                    onClick={(e) => { e.stopPropagation(); remove(n._id); }}
                  >
                    <CloseIcon fontSize="small" />
                  </MuiIconButton>
                }
                sx={{ bgcolor: n.isRead ? 'transparent' : 'action.hover' }}
              >
                <ListItemButton onClick={() => handleClick(n)} sx={{ py: 1.5 }}>
                  <Box sx={{ mr: 1.5, mt: 0.25, color: 'primary.main' }}>
                    {TYPE_ICONS[n.type] || TYPE_ICONS.alert}
                  </Box>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={n.isRead ? 500 : 700}>
                        {n.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25 }}>
                          {n.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {dayjs(n.createdAt).fromNow()}
                        </Typography>
                      </>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}

        <Divider />
        <Box sx={{ p: 1.5, textAlign: 'center' }}>
          <Button
            size="small"
            onClick={() => { setAnchorEl(null); router.push('/account/notifications'); }}
          >
            View All Notifications
          </Button>
        </Box>
      </Popover>
    </>
  );
}
