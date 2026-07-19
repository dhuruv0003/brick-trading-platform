'use client';
import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', p: 2 }}>
      <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', maxWidth: 600, width: '100%', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 3 }} />
        <Typography variant="h4" fontWeight={800} mb={2} fontFamily='"Playfair Display", serif'>
          Order Placed Successfully!
        </Typography>
        <Typography color="text.secondary" mb={4}>
          Thank you for your purchase. Your order has been received and is currently being processed. You will receive an email confirmation shortly.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button component={Link} href="/account/orders" variant="contained" size="large" sx={{ borderRadius: 2 }}>
            View Order Status
          </Button>
          <Button component={Link} href="/products" variant="outlined" size="large" sx={{ borderRadius: 2 }}>
            Continue Shopping
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
