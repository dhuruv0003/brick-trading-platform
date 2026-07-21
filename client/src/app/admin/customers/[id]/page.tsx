'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import { PageLoader } from '../../../../components/common/Loaders';
import { ErrorState } from '../../../../components/common/ErrorState';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { adminCustomersAPI } from '../../../../services/api';
import dayjs from 'dayjs';

export default function AdminCustomerDetailsPage() {
  const params = useParams<{ id: string }>();
  const customerId = params?.id as string;
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await adminCustomersAPI.getOne(customerId);
        setCustomer(res.data.data.customer);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [customerId]);

  if (loading) return (
<PageLoader />
  );
  if (error) return <ErrorState title="Something went wrong" message={error} backHref="/admin/customers" backLabel="Back to Customers" />;
  if (!customer) return <ErrorState title="Customer not found" backHref="/admin/customers" backLabel="Back to Customers" />;

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