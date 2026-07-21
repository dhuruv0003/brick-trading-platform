'use client';
import React from 'react';
import {
  Box, Typography, Paper, Alert, List, ListItem, ListItemButton,
  ListItemText, IconButton, Button, Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CampaignIcon from '@mui/icons-material/Campaign';
import PersonIcon from '@mui/icons-material/Person';
import { useRouter } from 'next/navigation';
import useNotifications from '../../../hooks/useNotifications';
import { SectionLoader } from '../../../components/common/Loaders';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const TYPE_ICONS: Record<string, React.ReactNode> = {
  order: <ShoppingBagIcon />,
  promotion: <CampaignIcon />,
  profile: <PersonIcon />,
  alert: <NotificationsIcon />,
};

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, unreadCount, loading, markRead, markAllRead, remove } = useNotifications();

  const handleClick = (n: any) => {
    if (!n.isRead) markRead(n._id);
    if (n.link) router.push(n.link);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={800} fontFamily='"Playfair Display", serif'>
          Notifications
          {unreadCount > 0 && (
            <Typography component="span" variant="body1" color="primary.main" sx={{ ml: 1.5 }}>
              ({unreadCount} unread)
            </Typography>
          )}
        </Typography>
        {unreadCount > 0 && (
          <Button size="small" onClick={markAllRead}>Mark all as read</Button>
        )}
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {loading ? (
          <SectionLoader />
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              You have no notifications yet. We'll let you know here when there's an update on your orders.
            </Alert>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((n: any, i: number) => (
              <React.Fragment key={n._id}>
                {i > 0 && <Divider />}
                <ListItem
                  disablePadding
                  secondaryAction={
                    <IconButton edge="end" size="small" onClick={() => remove(n._id)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{ bgcolor: n.isRead ? 'transparent' : 'action.hover' }}
                >
                  <ListItemButton onClick={() => handleClick(n)} sx={{ py: 2, px: 3 }}>
                    <Box sx={{ mr: 2, color: 'primary.main', mt: 0.5 }}>
                      {TYPE_ICONS[n.type] || TYPE_ICONS.alert}
                    </Box>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={n.isRead ? 500 : 700}>
                          {n.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
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
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
