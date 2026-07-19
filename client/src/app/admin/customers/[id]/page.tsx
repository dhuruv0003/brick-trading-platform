'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button, CircularProgress, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { adminCustomersAPI } from '../../../../services/api';
import dayjs from 'dayjs';

export default function AdminCustomerDetailsPage({ params }: { params: { id: string } }) {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await adminCustomersAPI.getOne(params.id);
        setCustomer(res.data.data.customer);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [params.id]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!customer) return <Typography>Customer not found</Typography>;

  return (
    <Box>
      <Button component={Link} href="/admin/customers" startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
        Back to Customers
      </Button>

      <Typography variant="h5" fontWeight={700} mb={3}>
        Customer Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Personal Details</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">First Name</Typography>
                <Typography variant="body1">{customer.firstName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Last Name</Typography>
                <Typography variant="body1">{customer.lastName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{customer.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Phone</Typography>
                <Typography variant="body1">{customer.phone || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Joined Date</Typography>
                <Typography variant="body1">{dayjs(customer.createdAt).format('DD MMM YYYY')}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Business Details</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Company Name</Typography>
                <Typography variant="body1">{customer.companyName || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">GST Number</Typography>
                <Typography variant="body1">{customer.gstNumber || 'N/A'}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
