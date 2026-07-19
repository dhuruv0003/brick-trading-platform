'use client';
import React from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const footerLink = {
  color: '#a8a29e',
  textDecoration: 'none',
  '&:hover': { color: '#fff' },
  display: 'block',
  mb: 1.5,
  fontSize: '0.875rem',
  transition: 'color 0.2s',
};

export default function Footer() {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1c1917',
        color: '#f5f5f4',
        pt: 8,
        pb: 4,
        borderTop: `4px solid ${theme.palette.primary.main}`,
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Brand */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                color: '#fff',
                fontFamily: '"Playfair Display", serif',
                mb: 2,
              }}
            >
              Brick<span style={{ color: theme.palette.primary.main }}>Pro</span>
            </Typography>
            <Typography variant="body2" sx={{ color: '#a8a29e', mb: 3, maxWidth: 320, lineHeight: 1.8 }}>
              Your trusted e-commerce destination for premium bricks and construction materials. Sourced directly from kilns, delivered to your site.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[
                { icon: <FacebookIcon />, href: 'https://facebook.com' },
                { icon: <InstagramIcon />, href: 'https://instagram.com' },
                { icon: <TwitterIcon />, href: 'https://twitter.com' },
              ].map(({ icon, href }, i) => (
                <IconButton
                  key={i}
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: '#fff',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    '&:hover': { backgroundColor: theme.palette.primary.main },
                    transition: 'background-color 0.2s',
                  }}
                >
                  {icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Shop */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, mb: 3 }}>
              Shop
            </Typography>
            <Box component="nav">
              {[
                { label: 'All Products', path: '/products' },
                { label: 'Wire Cut Bricks', path: '/products?category=wire-cut-bricks' },
                { label: 'Fly Ash Bricks', path: '/products?category=fly-ash-bricks' },
                { label: 'Fire Bricks', path: '/products?category=fire-bricks' },
                { label: 'Hollow Blocks', path: '/products?category=hollow-blocks' },
              ].map(({ label, path }) => (
                <Typography key={label} component={Link} href={path} sx={footerLink}>
                  {label}
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Explore */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, mb: 3 }}>
              Explore
            </Typography>
            <Box component="nav">
              {[
                { label: 'About Us', path: '/about' },
                { label: 'Our Blog', path: '/blog' },
                { label: 'Gallery', path: '/gallery' },
                { label: 'FAQ', path: '/faq' },
              ].map(({ label, path }) => (
                <Typography key={label} component={Link} href={path} sx={footerLink}>
                  {label}
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Account */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, mb: 3 }}>
              My Account
            </Typography>
            <Box component="nav">
              {[
                { label: 'My Orders', path: '/account/orders' },
                { label: 'Wishlist', path: '/account/wishlist' },
                { label: 'Addresses', path: '/account/addresses' },
                { label: 'Profile', path: '/account/profile' },
                { label: 'Login / Register', path: '/auth/login' },
              ].map(({ label, path }) => (
                <Typography key={label} component={Link} href={path} sx={footerLink}>
                  {label}
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} sm={3} md={3}>
            <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, mb: 3 }}>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <PhoneIcon sx={{ color: theme.palette.primary.main, mt: 0.3, flexShrink: 0 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>Call Us</Typography>
                  <Typography variant="body2" sx={{ color: '#a8a29e' }}>+91-9876543210</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <EmailIcon sx={{ color: theme.palette.primary.main, mt: 0.3, flexShrink: 0 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>Email Us</Typography>
                  <Typography variant="body2" sx={{ color: '#a8a29e' }}>support@brickpro.com</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <LocationOnIcon sx={{ color: theme.palette.primary.main, mt: 0.3, flexShrink: 0 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>Head Office</Typography>
                  <Typography variant="body2" sx={{ color: '#a8a29e' }}>
                    123 Brick Market, Industrial Area, City – 400001
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 4 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: '#78716c' }}>
            © {new Date().getFullYear()} BrickPro. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { label: 'Privacy Policy', path: '/privacy' },
              { label: 'Terms & Conditions', path: '/terms' },
              { label: 'Contact', path: '/contact' },
              { label: 'Admin Portal', path: '/admin/login' },
            ].map(({ label, path }) => (
              <Typography
                key={label}
                component={Link}
                href={path}
                variant="body2"
                sx={{ color: '#78716c', textDecoration: 'none', '&:hover': { color: '#a8a29e' } }}
              >
                {label}
              </Typography>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
