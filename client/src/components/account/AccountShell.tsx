'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Divider,
  BottomNavigation, BottomNavigationAction, Paper, useTheme, useMediaQuery, Container,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonIcon from '@mui/icons-material/Person';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LogoutIcon from '@mui/icons-material/Logout';
import useAuth from '../../hooks/useAuth';

// Deliberately plain, everyday labels — "My Orders" not "Order History",
// "My Account" not "Profile Settings" — for a tier-3 city audience that
// isn't necessarily familiar with e-commerce/admin terminology.
const NAV = [
  { label: 'Home', path: '/account/dashboard', icon: <HomeIcon /> },
  { label: 'Shop', path: '/products', icon: <StorefrontIcon /> },
  { label: 'My Orders', path: '/account/orders', icon: <ShoppingBagIcon /> },
  { label: 'My Account', path: '/account/profile', icon: <PersonIcon /> },
];

export default function AccountShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isActive = (path: string) => pathname === path || (path !== '/account/dashboard' && pathname?.startsWith(path));
  const currentNavIndex = Math.max(0, NAV.findIndex((n) => isActive(n.path)));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: isMobile ? 8 : 0 }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Playfair Display", serif' }}>
            Brick<span style={{ color: theme.palette.primary.main }}>Pro</span>
          </Typography>

          {/* Desktop-only top nav — mobile relies on the bottom bar instead */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {NAV.map((item) => (
                <Link key={item.path} href={item.path} style={{ textDecoration: 'none' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      px: 2, py: 1, borderRadius: 2, fontWeight: 600,
                      color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                      bgcolor: isActive(item.path) ? 'primary.light' : 'transparent',
                      opacity: isActive(item.path) ? 1 : 0.85,
                    }}
                  >
                    {item.label}
                  </Typography>
                </Link>
              ))}
            </Box>
          )}

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" fontWeight={700}>{user?.name}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.phone}</Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                logout('/account/login');
              }}
            >
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
        {children}
      </Container>

      {/* Mobile: bottom nav bar — much easier to use one-handed on a phone
          than a hamburger-menu drawer, and always visible without an extra tap. */}
      {isMobile && (
        <Paper elevation={3} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200 }}>
          <BottomNavigation showLabels value={currentNavIndex}>
            {NAV.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                icon={item.icon}
                component={Link}
                href={item.path}
                sx={{ minWidth: 0, px: 0.5 }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
