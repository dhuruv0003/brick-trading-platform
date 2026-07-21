'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Popover,
  Button,
  Tooltip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import CollectionsIcon from '@mui/icons-material/Collections';
import ArticleIcon from '@mui/icons-material/Article';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import useAuth from '../../hooks/useAuth';
import useAdminNotifications from '../../hooks/useAdminNotifications';

const DRAWER_WIDTH = 260;

const NAV = [
  { label: 'Dashboard', path: '/admin', icon: <DashboardIcon />, roles: ['super_admin', 'admin', 'manager', 'staff'] },
  { label: 'Products', path: '/admin/products', icon: <Inventory2Icon />, roles: ['super_admin', 'admin', 'manager', 'staff'] },
  { label: 'Categories', path: '/admin/categories', icon: <CategoryIcon />, roles: ['super_admin', 'admin'] },
  { label: 'Gallery', path: '/admin/gallery', icon: <CollectionsIcon />, roles: ['super_admin', 'admin', 'manager', 'staff'] },
  { label: 'Blog', path: '/admin/blog', icon: <ArticleIcon />, roles: ['super_admin', 'admin', 'manager', 'staff'] },
  { label: 'Projects', path: '/admin/projects', icon: <WorkIcon />, roles: ['super_admin', 'admin', 'manager', 'staff'] },
  { label: 'Orders', path: '/admin/orders', icon: <ShoppingBagIcon />, roles: ['super_admin', 'admin', 'manager', 'staff'] },
  { label: 'Customers', path: '/admin/customers', icon: <PeopleIcon />, roles: ['super_admin', 'admin', 'manager'] },
  { label: 'Users', path: '/admin/users', icon: <PeopleIcon />, roles: ['super_admin', 'admin'] },
  { label: 'Settings', path: '/admin/settings', icon: <SettingsIcon />, roles: ['super_admin', 'admin'] },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useAdminNotifications();

  const timeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const visibleNav = NAV.filter((item) => !user?.role || item.roles.includes(user.role));

  const isActive = (path: string) => (path === '/admin' ? pathname === '/admin' : pathname?.startsWith(path));

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Playfair Display", serif' }}>
          Brick<span style={{ color: theme.palette.primary.main }}>Pro</span>
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1, px: 1.5, py: 2 }}>
        {visibleNav.map((item) => (
          <Link key={item.path} href={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItemButton
              selected={isActive(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: '#fff',
                  '& .MuiListItemIcon-root': { color: '#fff' },
                  '&:hover': { backgroundColor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
            </ListItemButton>
          </Link>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {isMobile && (
            <IconButton onClick={() => setMobileOpen(true)} edge="start">
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {NAV.find((n) => isActive(n.path))?.label || 'Admin'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton onClick={(e) => setNotifAnchorEl(e.currentTarget)}>
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Popover
              open={Boolean(notifAnchorEl)}
              anchorEl={notifAnchorEl}
              onClose={() => setNotifAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{ paper: { sx: { width: 360, maxHeight: 440 } } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Notifications
                </Typography>
                {unreadCount > 0 && (
                  <Button size="small" onClick={() => markAllRead()}>
                    Mark all read
                  </Button>
                )}
              </Box>
              <Divider />
              {notifications.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No notifications yet.
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0, maxHeight: 360, overflowY: 'auto' }}>
                  {notifications.map((n: any) => (
                    <Link key={n._id} href={n.link || '#'} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <ListItemButton
                        onClick={() => {
                          if (!n.isRead) markRead(n._id);
                          setNotifAnchorEl(null);
                        }}
                        sx={{
                          alignItems: 'flex-start',
                          bgcolor: n.isRead ? 'transparent' : 'action.hover',
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {!n.isRead && (
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                            )}
                            <Typography variant="body2" fontWeight={n.isRead ? 500 : 700} noWrap>
                              {n.title}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                            {n.message}
                          </Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.25 }}>
                            {timeAgo(n.createdAt)}
                          </Typography>
                        </Box>
                      </ListItemButton>
                    </Link>
                  ))}
                </List>
              )}
            </Popover>

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="body2" fontWeight={700}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.role?.replace('_', ' ')}
                </Typography>
              </Box>
              <Divider />
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  logout();
                }}
              >
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          anchor={isMobile ? 'right' : 'left'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: isMobile ? 'none' : `1px solid ${theme.palette.divider}`,
              borderLeft: isMobile ? `1px solid ${theme.palette.divider}` : 'none',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, p: { xs: 2, md: 3 } }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}