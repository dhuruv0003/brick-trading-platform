'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  Paper,
  Container,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import useCustomerAuth from '../../hooks/useCustomerAuth';

const NAV = [
  { label: 'Dashboard', path: '/account/dashboard', icon: <DashboardIcon /> },
  { label: 'Orders', path: '/account/orders', icon: <ShoppingBagIcon /> },
  { label: 'Wishlist', path: '/account/wishlist', icon: <FavoriteIcon /> },
  { label: 'Addresses', path: '/account/addresses', icon: <LocationOnIcon /> },
  { label: 'Profile', path: '/account/profile', icon: <PersonIcon /> },
  { label: 'Notifications', path: '/account/notifications', icon: <NotificationsIcon /> },
];

export default function CustomerShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const { customer, logout } = useCustomerAuth();

  const isActive = (path: string) => {
    if (path === '/account/dashboard') return pathname === '/account/dashboard';
    return pathname?.startsWith(path);
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            mx: 'auto',
            mb: 1.5,
          }}
        >
          {customer?.firstName?.charAt(0) || 'U'}
        </Box>
        <Typography variant="subtitle1" fontWeight={700}>
          {customer?.firstName} {customer?.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {customer?.email}
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, px: 1.5, py: 2 }}>
        {NAV.map((item) => (
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
              <ListItemIcon sx={{ minWidth: 40, color: isActive(item.path) ? '#fff' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
            </ListItemButton>
          </Link>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <ListItemButton onClick={logout} sx={{ borderRadius: 2, color: 'error.main' }}>
          <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* Mobile page title (no menu toggle here — the site header's single
          hamburger already covers account navigation on small screens) */}
      {isMobile && (
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2, fontSize: '1.15rem' }}>
          {NAV.find(n => isActive(n.path))?.label || 'Account'}
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexGrow: 1, gap: 4, alignItems: 'flex-start', minWidth: 0 }}>
        {/* Sidebar — desktop only; mobile users navigate via the header menu */}
        {!isMobile && (
          <Paper
            elevation={0}
            sx={{
              width: 280,
              flexShrink: 0,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              overflow: 'hidden',
              position: 'sticky',
              top: 100, // Account for header height + padding
            }}
          >
            {drawerContent}
          </Paper>
        )}

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, minWidth: 0, width: '100%' }}>
          {children}
        </Box>
      </Box>
    </Container>
  );
}
