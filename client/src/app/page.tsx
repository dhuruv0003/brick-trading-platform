'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Skeleton,
  useTheme,
  alpha,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedIcon from '@mui/icons-material/Verified';
import { productsAPI, categoriesAPI } from '../services/api';
import { useSnackbar } from 'notistack';
import useCart, { getProductQuantityRules } from '../hooks/useCart';
import useWishlist from '../hooks/useWishlist';
import ProductCard from '../components/products/ProductCard';

const FALLBACK_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400';

// ── Skeleton loader for product grids ──
function ProductCardSkeleton() {
  return (
    <Card sx={{ height: '100%' }}>
      <Skeleton variant="rectangular" height={220} />
      <CardContent>
        <Skeleton height={28} sx={{ mb: 1 }} />
        <Skeleton height={18} sx={{ mb: 0.5 }} />
        <Skeleton height={18} width="60%" sx={{ mb: 2 }} />
        <Skeleton height={32} />
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { add: addToCart } = useCart();
  const { isInWishlist, add: addToWishlist, remove: removeFromWishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [bestSellersLoading, setBestSellersLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchFeaturedProducts();
    fetchBestSellers();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data.data.categories || []);
    } catch {
      // fail silently, categories strip just won't show
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      // Reuse the same productsAPI with isFeatured filter — no duplicate API
      const res = await productsAPI.getAll({ isFeatured: true, limit: 8 });
      setFeaturedProducts(res.data.data || []);
    } catch {
      setFeaturedProducts([]);
    } finally {
      setFeaturedLoading(false);
    }
  };

  const fetchBestSellers = async () => {
    try {
      // Sort by -soldCount to get best sellers; fall back to -createdAt (latest)
      const res = await productsAPI.getAll({ sortBy: '-soldCount', limit: 8 });
      setBestSellers(res.data.data || []);
    } catch {
      setBestSellers([]);
    } finally {
      setBestSellersLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const handleAddToCart = (product: any) => {
    if (!product.inStock) return;
    const { minQuantity } = getProductQuantityRules(product);
    addToCart(product, minQuantity);
    enqueueSnackbar(`${product.name} added to cart!`, {
      variant: 'success',
      action: (
        <Button size="small" color="inherit" component={Link} href="/cart">
          View Cart
        </Button>
      ),
    });
  };

  const handleToggleWishlist = (product: any) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const usps = [
    {
      icon: <BusinessIcon fontSize="large" />,
      title: 'Direct Kiln Sourcing',
      desc: 'We source directly from select modern kilns to guarantee consistent quality, strength compliance, and uniform texture.',
    },
    {
      icon: <LocalShippingIcon fontSize="large" />,
      title: 'Private Logistics Fleet',
      desc: 'No third-party delays. Our dedicated fleet delivers bricks straight to your construction site, on time.',
    },
    {
      icon: <WorkspacePremiumIcon fontSize="large" />,
      title: 'Standards Compliant',
      desc: 'All products undergo strict lab testing. IS:12894 and IS:1077 certified bricks for government and private projects.',
    },
  ];

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      {/* ─── Hero Section ──────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
          color: '#fff',
          position: 'relative',
          pt: { xs: 8, md: 12 },
          pb: { xs: 6, md: 10 },
          overflow: 'hidden',
        }}
      >
        {/* Subtle background pattern */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(180,83,9,0.12) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        <Container maxWidth="xl" sx={{ position: 'relative' }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                label="Premium Construction Materials"
                icon={<VerifiedIcon />}
                sx={{ mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.15), color: theme.palette.primary.light, fontWeight: 600 }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.25rem', sm: '3rem', md: '4rem' },
                  fontWeight: 900,
                  mb: 3,
                  lineHeight: 1.1,
                }}
              >
                Premium Bricks,{' '}
                <span style={{ color: theme.palette.primary.main }}>Delivered</span>{' '}
                to Your Site.
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#d6d3d1',
                  mb: 4,
                  maxWidth: 560,
                  lineHeight: 1.7,
                  fontWeight: 400,
                  fontSize: { xs: '1rem', md: '1.125rem' },
                }}
              >
                Shop premium-grade bricks, blocks, and refractory materials directly. Fast city-wide delivery guaranteed by our private fleet.
              </Typography>

              {/* Search bar */}
              <Box component="form" onSubmit={handleSearch} sx={{ mb: 4, maxWidth: 500 }}>
                <TextField
                  fullWidth
                  placeholder="Search bricks, blocks, fly ash..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.08)',
                      borderRadius: 3,
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                    },
                    '& input': { color: '#fff', '&::placeholder': { color: '#a8a29e' } },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#a8a29e' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          type="submit"
                          variant="contained"
                          size="small"
                          sx={{ borderRadius: 2, mr: -0.5 }}
                        >
                          Search
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Button
                  component={Link}
                  href="/products"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ py: 1.5, px: 4, borderRadius: 2, fontWeight: 700 }}
                >
                  Browse Products
                </Button>
                <Button
                  component={Link}
                  href="/products"
                  variant="outlined"
                  size="large"
                  sx={{
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.3)',
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.06)' },
                  }}
                >
                  Shop Now
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 520,
                  height: 400,
                  borderRadius: 6,
                  overflow: 'hidden',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <CardMedia
                  component="img"
                  image="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=800"
                  alt="Premium bricks"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ─── Stats Bar ─────────────────────────────────────────────────────── */}
      <Container maxWidth="xl" sx={{ mt: -4, position: 'relative', zIndex: 2, mb: 2 }}>
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
            backgroundColor: '#fff',
          }}
        >
          <Grid container spacing={2} justifyContent="center" textAlign="center">
            {[
              { val: '15+', label: 'Years of Trust' },
              { val: '500M+', label: 'Bricks Delivered' },
              { val: '10k+', label: 'Happy Customers' },
              { val: '50+', label: 'Fleet Vehicles' },
            ].map((stat, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.primary.main, mb: 0.5, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
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

      {/* ─── Categories Strip ───────────────────────────────────────────────── */}
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 8 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              Shop by Category
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              Find the perfect material for your project
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/products"
            endIcon={<ArrowForwardIcon />}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            All Products
          </Button>
        </Box>

        {categoriesLoading ? (
          <Grid container spacing={3}>
            {[...Array(4)].map((_, i) => (
              <Grid item xs={6} sm={4} md={3} key={i}>
                <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        ) : categories.length === 0 ? null : (
          <Grid container spacing={3}>
            {categories.slice(0, 6).map((cat) => (
              <Grid item xs={6} sm={4} md={2} key={cat._id}>
                <Card
                  component={Link}
                  href={`/products?category=${cat._id}`}
                  sx={{
                    textDecoration: 'none',
                    display: 'block',
                    borderRadius: 3,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <Box sx={{ position: 'relative', height: { xs: 100, sm: 130 } }}>
                    <CardMedia
                      component="img"
                      image={cat.image || FALLBACK_CATEGORY_IMAGE}
                      alt={cat.name}
                      sx={{ height: '100%', objectFit: 'cover' }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                      {cat.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        <Button
          component={Link}
          href="/products"
          endIcon={<ArrowForwardIcon />}
          sx={{ mt: 3, display: { xs: 'flex', sm: 'none' } }}
        >
          View All Products
        </Button>
      </Container>

      {/* ─── Featured Products ──────────────────────────────────────────────── */}
      <Box sx={{ backgroundColor: '#f5f5f4', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                Featured Products
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                Hand-picked products for your construction needs
              </Typography>
            </Box>
            <Button
              component={Link}
              href="/products?isFeatured=true"
              endIcon={<ArrowForwardIcon />}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              View All
            </Button>
          </Box>

          {featuredLoading ? (
            <Grid container spacing={3}>
              {[...Array(4)].map((_, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <ProductCardSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : featuredProducts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography color="text.secondary">No featured products available at the moment.</Typography>
              <Button component={Link} href="/products" variant="contained" sx={{ mt: 2 }}>
                Browse All Products
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {featuredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    showWishlistToggle
                    isInWishlist={isInWishlist(product._id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          <Box sx={{ textAlign: 'center', mt: 4, display: { xs: 'block', sm: 'none' } }}>
            <Button component={Link} href="/products" endIcon={<ArrowForwardIcon />}>
              View All Products
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ─── Best Sellers ───────────────────────────────────────────────────── */}
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              Best Sellers
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              Most popular products ordered by our customers
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/products?sortBy=-soldCount"
            endIcon={<ArrowForwardIcon />}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            View All
          </Button>
        </Box>

        {bestSellersLoading ? (
          <Grid container spacing={3}>
            {[...Array(4)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <ProductCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : bestSellers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">No products available at the moment.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {bestSellers.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  showWishlistToggle
                  isInWishlist={isInWishlist(product._id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ textAlign: 'center', mt: 4, display: { xs: 'block', sm: 'none' } }}>
          <Button component={Link} href="/products" endIcon={<ArrowForwardIcon />}>
            View All Products
          </Button>
        </Box>
      </Container>

      {/* ─── Why BrickPro ──────────────────────────────────────────────────── */}
      <Box sx={{ backgroundColor: '#f5f5f4', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="xl">
          <Typography variant="h3" align="center" sx={{ mb: 2, fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
            Why Builders Choose BrickPro
          </Typography>
          <Typography variant="body1" align="center" sx={{ color: theme.palette.text.secondary, maxWidth: 600, mx: 'auto', mb: 7 }}>
            We control the entire supply chain to ensure premium quality, transparent pricing, and punctual deliveries.
          </Typography>

          <Grid container spacing={4}>
            {usps.map((usp, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3, border: '1px solid #e7e5e4', borderRadius: 3 }}>
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
      </Box>

      {/* ─── CTA Banner ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          py: { xs: 7, md: 10 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#fff', mb: 2, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
            Ready to Start Building?
          </Typography>
          <Typography variant="h6" sx={{ color: alpha('#fff', 0.85), mb: 5, fontWeight: 400 }}>
            Browse our full catalog and place your order in minutes.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/products"
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#fff',
                backgroundImage: 'none',
                color: theme.palette.primary.main,
                fontWeight: 700,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                '&:hover': { bgcolor: alpha('#fff', 0.9), backgroundImage: 'none' },
              }}
            >
              Browse Products
            </Button>
            <Button
              component={Link}
              href="/auth/register"
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: '#fff',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Create Account
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
