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
  useTheme,
  Alert,
  Chip,
  Skeleton,
  Breadcrumbs,
  Tooltip,
  IconButton,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { productsAPI } from '../../../services/api';
import { useSnackbar } from 'notistack';
import useCart from '../../../hooks/useCart';
import useCustomerAuth from '../../../hooks/useCustomerAuth';
import useWishlist from '../../../hooks/useWishlist';
import ProductCard from '../../../components/products/ProductCard';
import ReviewsSection from '../../../components/products/ReviewsSection';
import { getQuantityRules, getProductPricingType, describeRule } from '../../../lib/quantityRules';
import { ErrorState } from '../../../components/common/ErrorState';
import { handleProductImageError } from '../../../lib/productImage';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=800';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const theme = useTheme();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const { add: addToCart } = useCart();
  const { isAuthenticated } = useCustomerAuth();
  const { isInWishlist, add: addToWishlist, remove: removeFromWishlist } = useWishlist();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(500);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const pricingType = getProductPricingType(data?.product);
  const quantityRules = getQuantityRules(pricingType);

  useEffect(() => {
    if (slug) fetchProductDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchProductDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await productsAPI.getOne(slug as string);
      setData(res.data.data);
      setSelectedImageIndex(0);
      // Reset quantity to this product's minimum valid quantity (500 for
      // per-brick products, 1 for a bundle) rather than a hardcoded 1.
      setQuantity(getQuantityRules(getProductPricingType(res.data.data?.product)).minQuantity);
    } catch {
      setError('Product not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!data?.product) return;
    const result = addToCart(data.product, quantity);
    if (result?.clamped) {
      enqueueSnackbar(`Only ${result.limit} unit${result.limit === 1 ? '' : 's'} available — added the maximum in stock.`, { variant: 'warning' });
      return;
    }
    enqueueSnackbar(`${data.product.name} added to cart!`, {
      variant: 'success',
      action: (
        <Button size="small" color="inherit" component={Link} href="/cart">
          View Cart
        </Button>
      ),
    });
  };

  const handleBuyNow = () => {
    if (!data?.product) return;
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent('/checkout')}`);
      return;
    }
    addToCart(data.product, quantity);
    router.push('/checkout');
  };

  const handleRelatedAddToCart = (product: any) => {
    if (!product.inStock) return;
    addToCart(product); // defaults to the product's minimum valid quantity
    enqueueSnackbar(`${product.name} added to cart!`, { variant: 'success' });
  };

  const handleToggleWishlist = (product: any) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={450} sx={{ borderRadius: 4 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton height={48} sx={{ mb: 2 }} />
            <Skeleton height={24} sx={{ mb: 1 }} />
            <Skeleton height={24} width="80%" sx={{ mb: 3 }} />
            <Skeleton height={120} sx={{ mb: 3 }} />
            <Skeleton height={52} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !data) {
    return <ErrorState message={error || 'Failed to load product.'} backHref="/products" backLabel="Back to Products" />;
  }

  const { product, related } = data;
  const isOutOfStock = !product.inStock;
  const inWishlist = isInWishlist(product._id);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: product.shortDescription || product.description, url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      enqueueSnackbar('Link copied to clipboard!', { variant: 'success' });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
      {/* ── Breadcrumbs ─────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>Home</Typography>
          </Link>
          <Link href="/products" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>Products</Typography>
          </Link>
          {product.category && (
            <Link href={`/products?category=${product.category._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                {product.category.name}
              </Typography>
            </Link>
          )}
          <Typography variant="body2" fontWeight={600} color="text.primary">{product.name}</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Share this product">
            <IconButton onClick={handleShare} size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
              <ShareIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy link">
            <IconButton
              size="small"
              sx={{ border: '1px solid', borderColor: 'divider' }}
              onClick={async () => {
                await navigator.clipboard.writeText(window.location.href);
                enqueueSnackbar('Link copied!', { variant: 'success' });
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={{ xs: 3, md: 6 }} sx={{ mb: 8 }}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              width: '100%',
              height: { xs: 280, sm: 420 },
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
              border: '1px solid #e7e5e4',
              mb: 2,
              position: 'relative',
            }}
          >
            <img
              src={product.images?.[selectedImageIndex]?.url || product.images?.[0]?.url || FALLBACK_IMAGE}
              alt={product.name}
              onError={handleProductImageError}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {isOutOfStock && (
              <Chip
                label="Out of Stock"
                color="error"
                sx={{ position: 'absolute', top: 16, right: 16, fontWeight: 600 }}
              />
            )}
          </Box>
          {/* Thumbnail strip */}
          {product.images?.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {product.images.map((img: any, i: number) => (
                <Box
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '2px solid',
                    borderColor: i === selectedImageIndex ? 'primary.main' : '#e7e5e4',
                    cursor: 'pointer',
                    opacity: i === selectedImageIndex ? 1 : 0.7,
                    transition: 'opacity 0.15s, border-color 0.15s',
                    flexShrink: 0,
                    '&:hover': { opacity: 1 },
                  }}
                >
                  <img src={img.url} alt={`${product.name} ${i + 1}`} onError={handleProductImageError} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              ))}
            </Box>
          )}
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
            {product.name}
          </Typography>

          {product.isFeatured && (
            <Chip label="Featured" color="primary" size="small" sx={{ mb: 2, fontWeight: 600 }} />
          )}

          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
            {product.description}
          </Typography>

          {/* Pricing Tiers */}
          {product.pricing && (
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f4' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Order Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Unit Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Retail (&lt; 5,000 pcs)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      ₹{product.pricing.retail?.toLocaleString()} / {product.pricing.unit}
                    </TableCell>
                  </TableRow>
                  {product.pricing.wholesale && (
                    <TableRow>
                      <TableCell>Wholesale (5,000–20,000 pcs)</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                        ₹{product.pricing.wholesale?.toLocaleString()} / {product.pricing.unit}
                      </TableCell>
                    </TableRow>
                  )}
                  {product.pricing.bulk && (
                    <TableRow>
                      <TableCell>Bulk (&gt; 20,000 pcs)</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>
                        ₹{product.pricing.bulk?.toLocaleString()} / {product.pricing.unit}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Quantity + Actions */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Quantity
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setQuantity((q) => Math.max(quantityRules.minQuantity, q - quantityRules.step))}
                disabled={quantity <= quantityRules.minQuantity}
                sx={{ minWidth: 40, px: 1 }}
              >
                −
              </Button>
              <Typography sx={{ fontWeight: 700, minWidth: 60, textAlign: 'center' }}>{quantity}</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const limit = data?.product?.stockQuantity > 0 ? data.product.stockQuantity : Infinity;
                  setQuantity((q) => Math.min(limit, q + quantityRules.step));
                }}
                disabled={data?.product?.stockQuantity > 0 && quantity >= data.product.stockQuantity}
                sx={{ minWidth: 40, px: 1 }}
              >
                +
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
              {describeRule(pricingType)}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddShoppingCartIcon />}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                sx={{ flex: 1, minWidth: 160, py: 1.5, borderRadius: 2 }}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<FlashOnIcon />}
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                sx={{ flex: 1, minWidth: 140, py: 1.5, borderRadius: 2 }}
              >
                Buy Now
              </Button>
            </Box>

            {isOutOfStock && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This product is currently out of stock. Please check back later.
              </Alert>
            )}

            {/* Wishlist toggle */}
            <Button
              variant="text"
              sx={{ mt: 1.5, color: inWishlist ? 'error.main' : 'text.secondary' }}
              onClick={() => handleToggleWishlist(product)}
            >
              {inWishlist ? '♥ Remove from Wishlist' : '♡ Add to Wishlist'}
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Specifications */}
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
                      <Typography
                        variant="caption"
                        sx={{ color: theme.palette.text.secondary, display: 'block', textTransform: 'capitalize' }}
                      >
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

      {/* ─── Reviews Section ──────────────────────────────────────────────── */}
      <Divider sx={{ mb: 5 }} />
      <ReviewsSection productSlug={product.slug} productId={product._id} />

      {/* ─── Related Products ──────────────────────────────────────────────── */}
      {related && related.length > 0 && (
        <Box>
          <Divider sx={{ mb: 5 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
            Related Products
          </Typography>
          <Grid container spacing={3}>
            {related.map((rp: any) => (
              <Grid item xs={12} sm={6} md={3} key={rp._id}>
                <ProductCard
                  product={rp}
                  onAddToCart={handleRelatedAddToCart}
                  showWishlistToggle
                  isInWishlist={isInWishlist(rp._id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
}
