'use client';
import React from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Button,
  TextField,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

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
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
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
                Your trusted partner for high-quality bricks. Sourced directly from modern kilns, transported with our own fleet, and distributed city-wide. Serving wholesale & retail projects.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                component="a"
                href="https://facebook.com"
                target="_blank"
                sx={{ color: '#fff', backgroundColor: 'rgba(255,255,255,0.05)', '&:hover': { backgroundColor: theme.palette.primary.main } }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                component="a"
                href="https://instagram.com"
                target="_blank"
                sx={{ color: '#fff', backgroundColor: 'rgba(255,255,255,0.05)', '&:hover': { backgroundColor: theme.palette.primary.main } }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                component="a"
                href="https://twitter.com"
                target="_blank"
                sx={{ color: '#fff', backgroundColor: 'rgba(255,255,255,0.05)', '&:hover': { backgroundColor: theme.palette.primary.main } }}
              >
                <TwitterIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, mb: 3 }}>
              Product Catalog
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography component={Link} href="/products?category=wire-cut-bricks" variant="body2" sx={{ color: '#a8a29e', textDecoration: 'none', '&:hover': { color: '#fff' } }}>
                  Wire Cut Bricks
                </Typography>
              <Typography component={Link} href="/products?category=table-mould-bricks" variant="body2" sx={{ color: '#a8a29e', textDecoration: 'none', '&:hover': { color: '#fff' } }}>
                  Table Mould Bricks
                </Typography>
              <Typography component={Link} href="/products?category=fly-ash-bricks" variant="body2" sx={{ color: '#a8a29e', textDecoration: 'none', '&:hover': { color: '#fff' } }}>
                  Fly Ash Bricks
                </Typography>
              <Typography component={Link} href="/products?category=fire-bricks" variant="body2" sx={{ color: '#a8a29e', textDecoration: 'none', '&:hover': { color: '#fff' } }}>
                  Fire Bricks
                </Typography>
              <Typography component={Link} href="/products?category=hollow-blocks" variant="body2" sx={{ color: '#a8a29e', textDecoration: 'none', '&:hover': { color: '#fff' } }}>
                  Hollow Blocks
                </Typography>
            </Box>
          </Grid>

          {/* Company Links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, mb: 3 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography component={Link} href="/about" variant="body2" sx={{ color: '#a8a29e', textDecoration: 'none', '&:hover': { color: '#fff' } }}>
                  About Us
                </Typography>
              <Typography component={Link} href="/services" variant="body2" sx={{ color: '#a8a29e', textDecoration: 'none', '&:hover': { color: '#fff' } }}>
                  Our Services
                </Typography>
              <Typography component={Link} href="/projects" variant="body2" sx={{ color: '#a8a29e', textDecoration: 'none', '&:hover': { color: '#fff' } }}>
                  Case Studies
                </Typography>
              <Typography component={Link} href="/gallery" variant="body2" sx={{ color: '#a8a29e', textDecoration: 'none', '&:hover': { color: '#fff' } }}>
                  Photo Gallery
                </Typography>
              <Typography component={Link} href="/faq" variant="body2" sx={{ color: '#a8a29e', textDecoration: 'none', '&:hover': { color: '#fff' } }}>
                  FAQs
                </Typography>
            </Box>
          </Grid>

          {/* Contact Details */}
          <Grid item xs={12} sm={4} md={4}>
            <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, mb: 3 }}>
              Contact Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <PhoneIcon sx={{ color: theme.palette.primary.main, mt: 0.3 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                    Call Us
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#a8a29e' }}>
                    +91-9876543210
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <EmailIcon sx={{ color: theme.palette.primary.main, mt: 0.3 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                    Email Us
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#a8a29e' }}>
                    info@brickpro.com
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <LocationOnIcon sx={{ color: theme.palette.primary.main, mt: 0.3 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                    Head Office
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#a8a29e' }}>
                    123 Brick Market, Industrial Area, City - 400001
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 4 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#78716c' }}>
            © {new Date().getFullYear()} BrickPro. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography variant="body2" sx={{ color: '#78716c', cursor: 'pointer', '&:hover': { color: '#a8a29e' } }}>
              Privacy Policy
            </Typography>
            <Typography variant="body2" sx={{ color: '#78716c', cursor: 'pointer', '&:hover': { color: '#a8a29e' } }}>
              Terms of Service
            </Typography>
            <Typography component={Link} href="/admin/login" variant="body2" sx={{ color: '#78716c', textDecoration: 'none', '&:hover': { color: '#a8a29e' } }}>
              Admin Portal
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
