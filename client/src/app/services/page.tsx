'use client';
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  useTheme,
  Paper,
} from '@mui/material';
import Link from 'next/link';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import GroupIcon from '@mui/icons-material/Group';
import ConstructionIcon from '@mui/icons-material/Construction';

export default function ServicesPage() {
  const theme = useTheme();

  const services = [
    {
      icon: <BusinessCenterIcon fontSize="large" color="primary" />,
      title: 'Wholesale Supply',
      desc: 'High-volume brick orders for large-scale township projects, commercial complexes, and industrial sites. We guarantee consistent monthly supply quotas directly from partnership kilns.',
    },
    {
      icon: <GroupIcon fontSize="large" color="primary" />,
      title: 'Retail Supply',
      desc: 'Small-scale brick shipments for residential builds, facade tiling renovations, and boundary walls. Homeowners get the same kiln-fresh quality as major commercial builders.',
    },
    {
      icon: <LocalShippingIcon fontSize="large" color="primary" />,
      title: 'Logistics & Offloading',
      desc: 'Our private fleet of tractor-trolleys and dump trucks handles delivery navigation and site offloading. Avoid contractor delays and third-party transport coordination costs.',
    },
    {
      icon: <ConstructionIcon fontSize="large" color="primary" />,
      title: 'Custom Brand Molding',
      desc: 'For massive projects, we can arrange custom brick stamps/embossments (frogs) at the kiln stage, helping you establish proprietary quality marks on masonry structures.',
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
          Our Services
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxW: 600, mx: 'auto' }}>
          Providing comprehensive supply-chain and distribution capabilities for developers and builders.
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        {services.map((svc, i) => (
          <Grid item xs={12} sm={6} key={i}>
            <Paper sx={{ p: 4, height: '100%', border: '1px solid #e7e5e4', borderRadius: 4 }}>
              <Box sx={{ mb: 2 }}>{svc.icon}</Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                {svc.title}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.8, mb: 3 }}>
                {svc.desc}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 6, bgcolor: '#1c1917', color: '#fff', borderRadius: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
          Ready to Coordinate Your Site Delivery?
        </Typography>
        <Typography variant="body2" sx={{ color: '#a8a29e', maxW: 600, mx: 'auto', mb: 4, lineHeight: 1.8 }}>
          Talk directly with our transport managers to check narrow lane accessibility, dump truck restrictions, and batch dispatch timelines.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button component={Link} href="/products" variant="contained">Browse Products</Button>
          <Button component={Link} href="/contact" variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>Contact Logistics</Button>
        </Box>
      </Paper>
    </Container>
  );
}
