'use client';
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Paper,
  Avatar,
  useTheme,
} from '@mui/material';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { inquiriesAPI } from '../../services/api';
import { useSnackbar } from 'notistack';

export default function ContactPage() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    customerType: 'homeowner',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      enqueueSnackbar('Please fill in all required fields.', { variant: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      await inquiriesAPI.submit(formData);
      enqueueSnackbar('Your message has been submitted. Our team will contact you shortly.', { variant: 'success' });
      setFormData({ name: '', phone: '', email: '', customerType: 'homeowner', message: '' });
    } catch (err) {
      enqueueSnackbar('Failed to submit message. Please try again.', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
          Contact Our Sales Office
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxW: 600, mx: 'auto' }}>
          Reach out for price lists, dispatch questions, or customized logistics coordination.
        </Typography>
      </Box>

      <Grid container spacing={6} sx={{ mb: 8 }}>
        {/* Contact info details */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mb: 5 }}>
            <Paper sx={{ p: 3, display: 'flex', gap: 2.5, alignItems: 'center', border: '1px solid #e7e5e4' }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}><PhoneInTalkIcon /></Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary }}>Sales Hotline</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>+91-9876543210</Typography>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, display: 'flex', gap: 2.5, alignItems: 'center', border: '1px solid #e7e5e4' }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}><EmailIcon /></Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary }}>Email Support</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>info@brickpro.com</Typography>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, display: 'flex', gap: 2.5, alignItems: 'center', border: '1px solid #e7e5e4' }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}><LocationOnIcon /></Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary }}>Headquarters</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>123 Brick Market, Industrial Area, City</Typography>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, display: 'flex', gap: 2.5, alignItems: 'center', border: '1px solid #e7e5e4' }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}><AccessTimeIcon /></Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary }}>Business Hours</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Mon - Sat: 9:00 AM - 6:00 PM</Typography>
              </Box>
            </Paper>
          </Box>
        </Grid>

        {/* Inquiry Form */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 5, border: '1px solid #e7e5e4', borderRadius: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Send a Message
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
              Fill in your details and we will answer your message promptly.
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="name"
                    label="Full Name *"
                    fullWidth
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="phone"
                    label="Phone Number *"
                    fullWidth
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="email"
                    label="Email Address"
                    fullWidth
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="customerType"
                    label="Customer Profile"
                    select
                    fullWidth
                    value={formData.customerType}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    placeholder="Enter details about your inquiry..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting}>
                    {submitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>

      {/* Google Map Iframe */}
      <Box
        sx={{
          width: '100%',
          height: 400,
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
          border: '1px solid #e7e5e4',
        }}
      >
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d116345.54516301323!2d77.10028148810777!3d28.647279860645084!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x52c2b7494e204d!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1688200000000!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        />
      </Box>
    </Container>
  );
}
