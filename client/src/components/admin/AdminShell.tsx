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
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import CollectionsIcon from '@mui/icons-material/Collections';
import ArticleIcon from '@mui/icons-material/Article';
import WorkIcon from '@mui/icons-material/Work';
import RateReviewIcon from '@mui/icons-material/RateReview';
import HelpIcon from '@mui/icons-material/Help';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import useAuth from '../../hooks/useAuth';

const DRAWER_WIDTH = 260;

const NAV = [
  { label: 'Dashboard', path: '/admin', icon: <DashboardIcon />, roles: ['super_admin', 'admin', 'manager', 'staff'] },
  { label: 'Products', path: '/admin/products', icon: <Inventory2Icon />, roles: ['super_admin', 'admin', 'manager', 'staff'] },
  { label: 'Categories', path: '/admin/categories', icon: <CategoryIcon />, roles: ['super_admin', 'admin'] },
  { label: 'Gallery', path: '/admin/gallery', icon: <CollectionsIcon />, roles: ['super_admin', 'admin', 'manager', 'staff'] },
  { label: 'Blog', path: '/admin/blog', icon: <ArticleIcon />, roles: ['super_admin', 'admin', 'manager', 'staff'] },
  { label: 'Projects', path: '/admin/projects', icon: <WorkIcon />, roles: ['super_admin', 'admin', 'manager', 'staff'] },
  { label: 'Testimonials', path: '/admin/testimonials', icon: <RateReviewIcon />, roles: ['super_admin', 'admin'] },
  { label: 'FAQs', path: '/admin/faqs', icon: <HelpIcon />, roles: ['super_admin', 'admin', 'manager'] },
  { label: 'Leads', path: '/admin/leads', icon: <ContactMailIcon />, roles: ['super_admin', 'admin', 'manager', 'staff'] },
  { label: 'Quotes', path: '/admin/quotes', icon: <RequestQuoteIcon />, roles: ['super_admin', 'admin', 'manager', 'staff'] },
  { label: 'Orders', path: '/admin/orders', icon: <ShoppingBagIcon />, roles: ['super_admin', 'admin', 'manager', 'staff'] },
  { label: 'Users', path: '/admin/users', icon: <PeopleIcon />, roles: ['super_admin', 'admin'] },
  { label: 'Settings', path: '/admin/settings', icon: <SettingsIcon />, roles: ['super_admin', 'admin'] },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();

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
          <Box>
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
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, p: { xs: 2, md: 3 } }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
