'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Rating,
  TextField,
  MenuItem,
  useTheme,
  alpha,
  Paper,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import BusinessIcon from '@mui/icons-material/Business';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { inquiriesAPI, getApiErrorMessage } from '../services/api';
import { useSnackbar } from 'notistack';

export default function Home() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  // Inquiry Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    customerType: 'homeowner',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      enqueueSnackbar('Please fill in all required fields.', { variant: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      await inquiriesAPI.submit(formData);
      enqueueSnackbar('Inquiry submitted successfully! We will contact you soon.', { variant: 'success' });
      setFormData({ name: '', phone: '', email: '', customerType: 'homeowner', message: '' });
    } catch (err: any) {
      enqueueSnackbar(getApiErrorMessage(err, 'Failed to submit inquiry. Please try again.'), { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { name: 'Wire Cut Bricks', desc: 'Machine precision, smooth finish & superior load strength.', image: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400', slug: 'wire-cut-bricks' },
    { name: 'Table Mould Bricks', desc: 'Traditional handmade bricks with excellent thermal insulation.', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400', slug: 'table-mould-bricks' },
    { name: 'Fly Ash Bricks', desc: 'Eco-friendly lightweight blocks with high strength-to-weight ratio.', image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400', slug: 'fly-ash-bricks' },
    { name: 'Fire Bricks', desc: 'High-alumina refractory bricks with temperature resistance up to 1600°C.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400', slug: 'fire-bricks' },
  ];

  const testimonials = [
    { name: 'Rajesh Kumar', role: 'Civil Engineer, Buildmax', review: 'BrickPro wire cut bricks are extremely uniform. Delivery is always on time, which is critical for our project schedules.', rating: 5 },
    { name: 'Sunita Sharma', role: 'Homeowner', review: 'Great customer service! They recommended the perfect combination of bricks for my exterior facade and internal walls.', rating: 5 },
    { name: 'Arvind Patel', role: 'Contractor', review: 'Best bulk pricing in the city. Their own logistics fleet makes deliveries hassle-free even in tight industrial areas.', rating: 5 },
  ];

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      {/* ─── Hero Section ────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
          color: '#fff',
          position: 'relative',
          pt: { xs: 8, md: 12 },
          pb: { xs: 12, md: 16 },
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                  fontWeight: 900,
                  mb: 3,
                  lineHeight: 1.1,
                }}
              >
                Build with Strength.<br />
                Sourced from <span style={{ color: theme.palette.primary.main }}>Kiln</span> to <span style={{ color: theme.palette.primary.main }}>Site</span>.
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#d6d3d1',
                  mb: 5,
                  maxWidth: 600,
                  lineHeight: 1.6,
                  fontWeight: 400,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                }}
              >
                BrickPro supplies premium-grade bricks, blocks, and refractory materials directly to builders, developers, and homeowners. Fast, city-wide delivery guaranteed by our private fleet.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Button component={Link} href="/quote" variant="contained" size="large" sx={{ py: 1.8, px: 4 }}>
                    Request Free Quote
                  </Button>
                <Button component={Link} href="/products" variant="outlined" size="large" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', py: 1.8, px: 4, '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.05)' } }}>
                    Explore Products
                  </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 480,
                  height: { xs: 300, sm: 400 },
                  borderRadius: 6,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <CardMedia
                  component="img"
                  image="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=800"
                  alt="Brick Sourcing"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ─── Stats Section ───────────────────────────────────────────────── */}
      <Container maxWidth="xl" sx={{ mt: -6, position: 'relative', zIndex: 2 }}>
        <Paper
          sx={{
            p: 4,
            borderRadius: 4,
            boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
            backgroundColor: '#fff',
          }}
        >
          <Grid container spacing={3} justifyContent="center" textAlign="center">
            {[
              { val: '15+', label: 'Years of Trust' },
              { val: '500M+', label: 'Bricks Delivered' },
              { val: '10k+', label: 'Happy Customers' },
              { val: '50+', label: 'Fleet Vehicles' },
            ].map((stat, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.primary.main, mb: 0.5 }}>
                  {stat.val}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* ─── USPs / Features Section ─────────────────────────────────────── */}
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <Typography variant="h2" align="center" sx={{ mb: 2, fontWeight: 800 }}>
          Why Builders Choose BrickPro
        </Typography>
        <Typography variant="body1" align="center" sx={{ color: theme.palette.text.secondary, maxWidth: 600, mx: 'auto', mb: 8 }}>
          We control the entire supply chain to ensure premium quality, transparent pricing, and punctual deliveries.
        </Typography>

        <Grid container spacing={4}>
          {[
            { icon: <BusinessIcon fontSize="large" />, title: 'Direct Kiln Sourcing', desc: 'We source directly from select modern kilns to guarantee consistent baking quality, strength compliance, and uniform texture.' },
            { icon: <LocalShippingIcon fontSize="large" />, title: 'Private Logistics Fleet', desc: 'No third-party delays. Our dedicated tractor-trolleys and heavy-duty trucks deliver bricks straight to your site safely.' },
            { icon: <WorkspacePremiumIcon fontSize="large" />, title: 'Standards Compliant', desc: 'All products undergo strict laboratory testing. We supply IS:12894 and IS:1077 certified bricks for PWD & govt jobs.' },
          ].map((usp, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3, border: '1px solid #e7e5e4' }}>
                <Box sx={{ color: theme.palette.primary.main, mb: 2 }}>{usp.icon}</Box>
                <CardContent sx={{ p: 0, flexGrow: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                    {usp.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
                    {usp.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ─── Products Grid ──────────────────────────────────────────────── */}
      <Box sx={{ backgroundColor: '#f5f5f4', py: 10 }}>
        <Container maxWidth="xl">
          <Typography variant="h2" align="center" sx={{ mb: 2, fontWeight: 800 }}>
            Our Product Catalog
          </Typography>
          <Typography variant="body1" align="center" sx={{ color: theme.palette.text.secondary, maxWidth: 600, mx: 'auto', mb: 8 }}>
            Explore our wide range of construction bricks and block materials suited for different masonry styles.
          </Typography>

          <Grid container spacing={4}>
            {categories.map((cat, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ height: 200, position: 'relative' }}>
                    <CardMedia
                      component="img"
                      image={cat.image}
                      alt={cat.name}
                      sx={{ height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {cat.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6, mb: 2 }}>
                      {cat.desc}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 3, pt: 0 }}>
                    <Button component={Link} href={`/products`} variant="outlined" fullWidth sx={{ borderRadius: 2 }}>
                        View Details
                      </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── Testimonials ────────────────────────────────────────────────── */}
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <Typography variant="h2" align="center" sx={{ mb: 2, fontWeight: 800 }}>
          Client Success Stories
        </Typography>
        <Typography variant="body1" align="center" sx={{ color: theme.palette.text.secondary, maxWidth: 600, mx: 'auto', mb: 8 }}>
          Hear what leading developers, masons, and homeowners say about our products and services.
        </Typography>

        <Grid container spacing={4}>
          {testimonials.map((t, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Paper sx={{ p: 4, height: '100%', border: '1px solid #e7e5e4', borderRadius: 4 }}>
                <Rating value={t.rating} readOnly sx={{ mb: 2, color: theme.palette.primary.main }} />
                <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 3, color: theme.palette.text.primary, lineHeight: 1.8 }}>
                  "{t.review}"
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>{t.name[0]}</Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t.name}</Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>{t.role}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ─── Contact Form & Maps ────────────────────────────────────────── */}
      <Box sx={{ backgroundColor: '#1c1917', color: '#fff', py: 10 }}>
        <Container maxWidth="xl">
          <Grid container spacing={8} alignItems="center">
            {/* Quick Contact Info */}
            <Grid item xs={12} md={5}>
              <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, color: '#fff' }}>
                Need Help with Your Order?
              </Typography>
              <Typography variant="body1" sx={{ color: '#d6d3d1', mb: 6, lineHeight: 1.8 }}>
                Get custom specifications, discuss wholesale rates for big projects, or request custom transport routes. Fill out the form or reach out directly.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}><PhoneInTalkIcon /></Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#a8a29e' }}>Call Sales Hotline</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>+91-9876543210</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#16a34a' }}><WhatsAppIcon /></Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#a8a29e' }}>Chat on WhatsApp</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>+91-9876543210</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Quick Inquiry Form */}
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 5, borderRadius: 4, backgroundColor: '#fff', color: theme.palette.text.primary }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  Send an Inquiry
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
                  We will reply with a detailed price list and delivery timeline.
                </Typography>

                <form onSubmit={handleFormSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="name"
                        label="Full Name *"
                        fullWidth
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="phone"
                        label="Phone Number *"
                        fullWidth
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="email"
                        label="Email Address"
                        fullWidth
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="customerType"
                        label="Customer Profile"
                        select
                        fullWidth
                        value={formData.customerType}
                        onChange={handleInputChange}
                      >
                        <MenuItem value="homeowner">Homeowner / Owner</MenuItem>
                        <MenuItem value="builder">Builder / Developer</MenuItem>
                        <MenuItem value="contractor">Civil Contractor</MenuItem>
                        <MenuItem value="mason">Mason / Craftsperson</MenuItem>
                        <MenuItem value="dealer">Dealer / Shopkeeper</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="message"
                        label="Your Message *"
                        multiline
                        rows={4}
                        fullWidth
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us about the product and estimated quantities required..."
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={submitting}
                        sx={{ mt: 1 }}
                      >
                        {submitting ? 'Sending...' : 'Submit Inquiry'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
