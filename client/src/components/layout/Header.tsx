'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  Container,
  useTheme,
  useMediaQuery,
  alpha,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NotificationBell from './NotificationBell';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InventoryIcon from '@mui/icons-material/Inventory';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import InfoIcon from '@mui/icons-material/Info';
import ArticleIcon from '@mui/icons-material/Article';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import HelpIcon from '@mui/icons-material/Help';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import useCart from '../../hooks/useCart';
import useCustomerAuth from '../../hooks/useCustomerAuth';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'About', path: '/about' },
  { label: 'Blog', path: '/blog' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Contact', path: '/contact' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const { count: cartCount } = useCart();
  const { customer, isAuthenticated, logout } = useCustomerAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path.split('#')[0]);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    router.push('/');
  };

  const mobileDrawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Drawer header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5, pb: 2 }}>
        <Link href="/" style={{ textDecoration: 'none' }} onClick={handleDrawerToggle}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: theme.palette.text.primary, fontFamily: '"Playfair Display", serif' }}
          >
            Brick<span style={{ color: theme.palette.primary.main }}>Pro</span>
          </Typography>
        </Link>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* Auth status */}
      {isAuthenticated && customer ? (
        <Box sx={{ px: 2.5, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontWeight: 700 }}>
              {customer.firstName?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                {customer.firstName} {customer.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {customer.email}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 1, px: 2.5, py: 2 }}>
          <Button component={Link} href="/auth/login" variant="outlined" fullWidth onClick={handleDrawerToggle} startIcon={<LoginIcon />}>
            Login
          </Button>
          <Button component={Link} href="/auth/register" variant="contained" fullWidth onClick={handleDrawerToggle} startIcon={<PersonAddIcon />}>
            Register
          </Button>
        </Box>
      )}

      <Divider />

      {/* Navigation */}
      <List sx={{ px: 1.5, py: 1.5, flexGrow: 1 }}>
        {[
          { label: 'Home', path: '/', icon: <HomeIcon /> },
          { label: 'Products', path: '/products', icon: <InventoryIcon /> },
          { label: 'About', path: '/about', icon: <InfoIcon /> },
          { label: 'Blog', path: '/blog', icon: <ArticleIcon /> },
          { label: 'Gallery', path: '/gallery', icon: <PhotoLibraryIcon /> },
          { label: 'FAQ', path: '/faq', icon: <HelpIcon /> },
          { label: 'Contact', path: '/contact', icon: <ContactMailIcon /> },
          { label: 'Cart', path: '/cart', icon: <ShoppingCartIcon />, badge: cartCount },
          ...(isAuthenticated ? [
            { label: 'Wishlist', path: '/account/wishlist', icon: <FavoriteIcon /> },
            { label: 'Orders', path: '/account/orders', icon: <ShoppingBagIcon /> },
            { label: 'Profile', path: '/account/profile', icon: <PersonIcon /> },
          ] : []),
        ].map((item) => (
          <ListItem key={item.path + item.label} disablePadding>
            <Link href={item.path} style={{ width: '100%', textDecoration: 'none' }}>
              <ListItemButton
                onClick={handleDrawerToggle}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  color: theme.palette.text.primary,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                />
                {'badge' in item && (item.badge as number) > 0 && (
                  <Badge badgeContent={item.badge} color="error" />
                )}
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Logout */}
      {isAuthenticated && (
        <Box sx={{ p: 1.5 }}>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: 'error.main' }}>
            <ListItemIcon sx={{ minWidth: 36, color: 'error.main' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
          </ListItemButton>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: scrolled
            ? alpha(theme.palette.background.paper, 0.95)
            : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? theme.shadows[2] : 'none',
          borderBottom: scrolled ? `1px solid ${theme.palette.divider}` : 'none',
          transition: 'all 0.3s ease',
          top: 0,
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: { xs: 64, md: 80 }, gap: 1 }}>
            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none', minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    width: { xs: 30, md: 36 },
                    height: { xs: 30, md: 36 },
                    flexShrink: 0,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                  }}
                >
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900, fontFamily: 'serif', fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
                    B
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  noWrap
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.text.primary,
                    fontFamily: '"Playfair Display", serif',
                    letterSpacing: '-0.03em',
                    fontSize: { xs: '1.15rem', sm: '1.35rem', md: '1.5rem' },
                  }}
                >
                  Brick<span style={{ color: theme.palette.primary.main }}>Pro</span>
                </Typography>
              </Box>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                {NAV_ITEMS.map((item) => (
                  <Button
                    key={item.label}
                    component={Link}
                    href={item.path}
                    sx={{
                      color: isActive(item.path)
                        ? theme.palette.primary.main
                        : theme.palette.text.primary,
                      fontWeight: isActive(item.path) ? 700 : 500,
                      backgroundColor: isActive(item.path)
                        ? alpha(theme.palette.primary.main, 0.05)
                        : 'transparent',
                      px: 1.5,
                      py: 0.75,
                      fontSize: '0.875rem',
                      '&:hover': {
                        color: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Icons & CTA */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 }, flexShrink: 0 }}>
              {/* Cart */}
              <IconButton
                component={Link}
                href="/cart"
                aria-label="Shopping cart"
                sx={{ color: theme.palette.text.primary }}
              >
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

              {/* Authenticated user */}
              {isAuthenticated && customer ? (
                <>
                  <IconButton
                    component={Link}
                    href="/account/wishlist"
                    aria-label="Wishlist"
                    sx={{ color: theme.palette.text.primary, display: { xs: 'none', sm: 'inline-flex' } }}
                  >
                    <FavoriteIcon />
                  </IconButton>
                  <Box sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: theme.palette.text.primary }}>
                    <NotificationBell />
                  </Box>
                  <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
                      {customer.firstName?.charAt(0) || <AccountCircleIcon />}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{ sx: { width: 210, mt: 1, borderRadius: 2 } }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight={700} noWrap>
                        {customer.firstName} {customer.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {customer.email}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem component={Link} href="/account/dashboard" onClick={handleMenuClose}>
                      Dashboard
                    </MenuItem>
                    <MenuItem component={Link} href="/account/orders" onClick={handleMenuClose}>
                      Orders
                    </MenuItem>
                    <MenuItem component={Link} href="/account/wishlist" onClick={handleMenuClose}>
                      Wishlist
                    </MenuItem>
                    <MenuItem component={Link} href="/account/addresses" onClick={handleMenuClose}>
                      Addresses
                    </MenuItem>
                    <MenuItem component={Link} href="/account/profile" onClick={handleMenuClose}>
                      Profile
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontWeight: 600 }}>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  component={Link}
                  href="/auth/login"
                  variant="text"
                  sx={{
                    color: theme.palette.text.primary,
                    display: { xs: 'none', sm: 'inline-flex' },
                    fontWeight: 600,
                  }}
                >
                  Login
                </Button>
              )}

              {/* Desktop: Shop Now CTA */}
              {!isMobile && (
                <Button
                  component={Link}
                  href="/products"
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                  }}
                >
                  Shop Now
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="Open menu"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ color: theme.palette.text.primary, flexShrink: 0 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: '82vw', maxWidth: 340 },
        }}
      >
        {mobileDrawer}
      </Drawer>
    </>
  );
}