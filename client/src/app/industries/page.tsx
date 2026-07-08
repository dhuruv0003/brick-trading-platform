'use client';
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  useTheme,
  Paper,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ApartmentIcon from '@mui/icons-material/Apartment';
import EngineeringIcon from '@mui/icons-material/Engineering';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

export default function IndustriesPage() {
  const theme = useTheme();

  const industries = [
    {
      icon: <HomeIcon fontSize="large" color="primary" />,
      title: 'Residential Projects',
      desc: 'Supplying high-quality face bricks, wire cut bricks, and lightweight hollow blocks to individual homeowners, villa builders, and housing societies. We specialize in custom delivery parameters for narrow residential sectors.',
    },
    {
      icon: <ApartmentIcon fontSize="large" color="primary" />,
      title: 'Commercial Developers',
      desc: 'Providing massive material reserves for high-rise commercial structures, retail plazas, and office spaces. Our partners enjoy tiered contract pricing, stable monthly supply schedules, and strict compliance tests.',
    },
    {
      icon: <EngineeringIcon fontSize="large" color="primary" />,
      title: 'Infrastructure & Civil',
      desc: 'Robust bricks engineered for load-bearing retaining walls, canals, bridges, and culvert structures. High durability parameters guarantee resistance against groundwater salinity and heavy environmental stress.',
    },
    {
      icon: <AccountBalanceIcon fontSize="large" color="primary" />,
      title: 'Government Works',
      desc: 'Official empanelled supplier for municipal corporations, railways, and public departments. We provide certified laboratory test results (load testing, water absorption) to meet government project specifications.',
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
          Industries We Serve
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxW: 600, mx: 'auto' }}>
          Custom logistics solutions and masonry materials tailored to specific sectoral requirements.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {industries.map((ind, i) => (
          <Grid item xs={12} sm={6} key={i}>
            <Paper sx={{ p: 4, height: '100%', border: '1px solid #e7e5e4', borderRadius: 4 }}>
              <Box sx={{ mb: 2 }}>{ind.icon}</Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                {ind.title}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.8 }}>
                {ind.desc}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
