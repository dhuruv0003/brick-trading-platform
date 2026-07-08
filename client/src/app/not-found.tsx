'use client';
import React from 'react';
import Link from 'next/link';
import { Box, Container, Typography, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

export default function NotFound() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm" sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h1" sx={{ fontWeight: 800, fontSize: { xs: '4rem', md: '6rem' }, color: 'primary.main', mb: 1 }}>
          404
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          This page could not be found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you're looking for may have been moved or doesn't exist.
        </Typography>
        <Button component={Link} href="/" variant="contained" startIcon={<HomeIcon />} size="large">
          Back to Home
        </Button>
      </Container>
    </Box>
  );
}
