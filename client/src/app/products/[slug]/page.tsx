'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  TextField,
  CircularProgress,
  useTheme,
  Card,
  CardContent,
  CardMedia,
  Alert,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { productsAPI, inquiriesAPI } from '../../../services/api';
import { useDispatch } from 'react-redux';
import { addItem } from '../../../store/cartSlice';
import { useSnackbar } from 'notistack';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const theme = useTheme();
  const dispatch = useDispatch();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Inquiry form states
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProductDetail();
    }
  }, [slug]);

  const fetchProductDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await productsAPI.getOne(slug as string);
      setData(res.data.data);
    } catch (err) {
      setError('Product not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToQuote = () => {
    if (data?.product) {
      dispatch(addItem({ product: data.product, quantity: 1000 }));
      enqueueSnackbar('Added to Quote Builder!', { variant: 'success' });
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryPhone || !inquiryMsg) {
      enqueueSnackbar('Please fill in all required fields.', { variant: 'warning' });
      return;
    }
    setSubmittingInquiry(true);
    try {
      await inquiriesAPI.submit({
        name: inquiryName,
        phone: inquiryPhone,
        message: inquiryMsg,
        product: data.product._id,
        customerType: 'homeowner',
      });
      enqueueSnackbar('Inquiry submitted successfully!', { variant: 'success' });
      setInquiryName('');
      setInquiryPhone('');
      setInquiryMsg('');
    } catch (err) {
      enqueueSnackbar('Failed to submit inquiry.', { variant: 'error' });
    } finally {
      setSubmittingInquiry(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 15 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 4 }}>{error || 'Failed to load product.'}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/products')} variant="contained">
          Back to Products
        </Button>
      </Container>
    );
  }

  const { product, related } = data;

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Back link */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/products')}
        sx={{ mb: 4, color: theme.palette.text.secondary }}
      >
        Back to Catalog
      </Button>

      <Grid container spacing={6} sx={{ mb: 8 }}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              width: '100%',
              height: { xs: 300, sm: 450 },
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
              border: '1px solid #e7e5e4',
              mb: 3,
            }}
          >
            <CardMedia
              component="img"
              image={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=800'}
              alt={product.name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        </Grid>

        {/* Product Specs & Direct Order */}
        <Grid item xs={12} md={6}>
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
            {product.name}
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, lineHeight: 1.8 }}>
            {product.description}
          </Typography>

          {/* Pricing Tiers Table */}
          {product.pricing && (
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Order Quantity</TableCell>
                    <TableCell>Unit Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Retail Rate (&lt; 5,000 pcs)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>₹{product.pricing.retail?.toLocaleString()} / {product.pricing.unit}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Wholesale Rate (5,000 - 20,000 pcs)</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>₹{product.pricing.wholesale?.toLocaleString()} / {product.pricing.unit}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Bulk Rate (&gt; 20,000 pcs)</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>₹{product.pricing.bulk?.toLocaleString()} / {product.pricing.unit}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Action CTAs */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 5 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<RequestQuoteIcon />}
              onClick={handleAddToQuote}
            >
              Add to Quote Builder
            </Button>
            <Button
              component="a"
              href={`https://wa.me/919876543210?text=Hi, I am interested in ${product.name}.`}
              target="_blank"
              variant="outlined"
              color="success"
              size="large"
              startIcon={<WhatsAppIcon />}
            >
              Order via WhatsApp
            </Button>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Specifications list */}
          {product.specs && (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Technical Specifications
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(product.specs).map(([key, val]) => {
                  if (typeof val !== 'string' || !val) return null;
                  return (
                    <Grid item xs={6} sm={4} key={key}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1')}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {val}
                      </Typography>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </Grid>
      </Grid>

      <Grid container spacing={6}>
        {/* Direct Product Inquiry Form */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 4, border: '1px solid #e7e5e4', borderRadius: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Product Inquiry
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
              Ask a question about {product.name} directly.
            </Typography>

            <form onSubmit={handleInquirySubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Your Name *"
                  fullWidth
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                />
                <TextField
                  label="Phone Number *"
                  fullWidth
                  value={inquiryPhone}
                  onChange={(e) => setInquiryPhone(e.target.value)}
                />
                <TextField
                  label="Message *"
                  multiline
                  rows={3}
                  fullWidth
                  value={inquiryMsg}
                  onChange={(e) => setInquiryMsg(e.target.value)}
                  placeholder={`Hi, I want to inquire about availability and delivery costs for ${product.name}...`}
                />
                <Button type="submit" variant="contained" disabled={submittingInquiry}>
                  {submittingInquiry ? 'Sending...' : 'Send Inquiry'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>

        {/* Related Products */}
        <Grid item xs={12} md={7}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
            Related Products
          </Typography>
          {related?.length === 0 ? (
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              No other products found in this category.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {related?.map((rp: any) => (
                <Grid item xs={12} sm={6} key={rp._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      image={rp.images?.[0]?.url || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400'}
                      alt={rp.name}
                      sx={{ height: 160, objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                        {rp.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                        {rp.shortDescription || rp.description?.slice(0, 60) + '...'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                        ₹{rp.pricing?.retail?.toLocaleString()} / {rp.pricing?.unit}
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        onClick={() => router.push(`/products/${rp.slug}`)}
                      >
                        View Product
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
