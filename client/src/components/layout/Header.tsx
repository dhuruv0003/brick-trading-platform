'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Box,
  Container,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'Services', path: '/services' },
  { label: 'Industries', path: '/industries' },
  { label: 'Projects', path: '/projects' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Blog', path: '/blog' },
  { label: 'FAQ', path: '/faq' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

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
    return pathname.startsWith(path);
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: scrolled
            ? alpha(theme.palette.background.paper, 0.9)
            : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? theme.shadows[2] : 'none',
          borderBottom: scrolled ? `1px solid ${theme.palette.divider}` : 'none',
          transition: 'all 0.3s ease',
          top: 0,
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 80 }}>
            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                  }}
                >
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900, fontFamily: 'serif' }}>
                    B
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.text.primary,
                    fontFamily: '"Playfair Display", serif',
                    letterSpacing: '-0.03em',
                  }}
                >
                  Brick<span style={{ color: theme.palette.primary.main }}>Pro</span>
                </Typography>
              </Box>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {NAV_ITEMS.map((item) => (
                  <Button
                    key={item.path}
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
                      py: 1,
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

            {/* CTA Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {!isMobile && (
                <Button
                  component="a"
                  href="https://wa.me/919876543210"
                  target="_blank"
                  variant="outlined"
                  color="success"
                  startIcon={<WhatsAppIcon />}
                  sx={{
                    borderRadius: 2,
                    borderColor: alpha(theme.palette.success.main, 0.3),
                    '&:hover': {
                      borderColor: theme.palette.success.main,
                      backgroundColor: alpha(theme.palette.success.main, 0.05),
                    },
                  }}
                >
                  WhatsApp
                </Button>
              )}
              <Button component={Link} href="/quote" variant="contained" color="primary" sx={{ borderRadius: 2 }}>
                Request Quote
              </Button>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ color: theme.palette.text.primary }}
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
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, p: 3 },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Menu
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List sx={{ mb: 2 }}>
          {NAV_ITEMS.map((item) => (
            <ListItem key={item.path} disablePadding>
              <Link href={item.path} style={{ width: '100%', textDecoration: 'none' }}>
                <ListItemButton
                  onClick={handleDrawerToggle}
                  selected={isActive(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    color: isActive(item.path)
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: isActive(item.path) ? 700 : 500 }}
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          ))}
        </List>
        <Button
          component="a"
          href="https://wa.me/919876543210"
          target="_blank"
          variant="contained"
          color="success"
          fullWidth
          startIcon={<WhatsAppIcon />}
          sx={{ mb: 1.5, borderRadius: 2 }}
        >
          Chat on WhatsApp
        </Button>
      </Drawer>
    </>
  );
}
