'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  useTheme,
  InputAdornment,
  Divider,
  Drawer,
  IconButton,
  Badge,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { productsAPI, categoriesAPI } from '../../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, removeItem, updateQuantity, cartItemsList, toggleCart } from '../../store/cartSlice';
import { useSnackbar } from 'notistack';

export default function ProductsPage() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  // Cart / Quote Builder Selectors
  const cartItems = useSelector(cartItemsList);
  const isCartOpen = useSelector((state: any) => state.cart.isOpen);

  // API State
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [inStockOnly, setInStockOnly] = useState('all');

  useEffect(() => {
    fetchFilters();
    fetchProducts();
  }, [selectedCat, sortBy, inStockOnly]);

  const fetchFilters = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data.data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        sortBy,
      };
      if (selectedCat !== 'all') params.category = selectedCat;
      if (inStockOnly !== 'all') params.inStock = inStockOnly === 'true';
      if (search) params.search = search;

      const res = await productsAPI.getAll(params);
      setProducts(res.data.data || []);
    } catch (err) {
      enqueueSnackbar('Failed to fetch products.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedCat(newValue);
  };

  const handleAddToQuote = (product: any) => {
    dispatch(addItem({ product, quantity: 1000 })); // Default 1000 bricks
    enqueueSnackbar(`${product.name} added to quote builder!`, {
      variant: 'success',
      action: (key) => (
        <Button size="small" color="inherit" onClick={() => { dispatch(toggleCart()); }}>
          View Builder
        </Button>
      ),
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* ─── Breadcrumbs / Header ────────────────────────────────────────── */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>
          Product Catalog
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
          High-performance bricks and block materials sourced directly from kilns.
        </Typography>
      </Box>

      {/* ─── Filters & Search Toolbar ────────────────────────────────────── */}
      <Box sx={{ mb: 5 }}>
        <form onSubmit={handleSearchSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search products by name, type, specs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <Button type="submit" variant="contained" size="small">
                      Search
                    </Button>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2.5}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
                  <MenuItem value="name">Name (A-Z)</MenuItem>
                  <MenuItem value="-name">Name (Z-A)</MenuItem>
                  <MenuItem value="pricing.retail">Price: Low to High</MenuItem>
                  <MenuItem value="-pricing.retail">Price: High to Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={4} md={2.5}>
              <FormControl fullWidth>
                <InputLabel>Stock Status</InputLabel>
                <Select value={inStockOnly} label="Stock Status" onChange={(e) => setInStockOnly(e.target.value)}>
                  <MenuItem value="all">All Items</MenuItem>
                  <MenuItem value="true">In Stock Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Badge badgeContent={cartItems.length} color="primary">
                <Button
                  variant="outlined"
                  startIcon={<RequestQuoteIcon />}
                  onClick={() => dispatch(toggleCart())}
                  fullWidth
                >
                  Quote Builder
                </Button>
              </Badge>
            </Grid>
          </Grid>
        </form>
      </Box>

      {/* ─── Category Tabs ──────────────────────────────────────────────── */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 5 }}>
        <Tabs
          value={selectedCat}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab value="all" label="All Categories" />
          {categories.map((cat) => (
            <Tab key={cat._id} value={cat._id} label={cat.name} />
          ))}
        </Tabs>
      </Box>

      {/* ─── Products Grid ──────────────────────────────────────────────── */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : products.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
            No products match your search/filter criteria.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ position: 'relative', height: 220 }}>
                  <CardMedia
                    component="img"
                    image={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400'}
                    alt={product.name}
                    sx={{ height: '100%', objectFit: 'cover' }}
                  />
                  {!product.inStock && (
                    <Chip
                      label="Out of Stock"
                      color="error"
                      size="small"
                      sx={{ position: 'absolute', top: 12, right: 12 }}
                    />
                  )}
                  {product.isFeatured && (
                    <Chip
                      label="Featured"
                      color="primary"
                      size="small"
                      sx={{ position: 'absolute', top: 12, left: 12 }}
                    />
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': { color: theme.palette.primary.main },
                      }}
                    >
                      {product.name}
                    </Typography>
                  </Link>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2, height: 40, overflow: 'hidden' }}>
                    {product.shortDescription || product.description?.slice(0, 80) + '...'}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {product.specs?.type && <Chip label={product.specs.type} size="small" variant="outlined" />}
                    {product.specs?.size && <Chip label={product.specs.size} size="small" variant="outlined" />}
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.secondary.dark }}>
                    ₹{product.pricing?.retail?.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: theme.palette.text.secondary }}>/ {product.pricing?.unit || 'per 1000'}</span>
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={!product.inStock}
                    onClick={() => handleAddToQuote(product)}
                    startIcon={<RequestQuoteIcon />}
                  >
                    Add to Quote
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ─── Quote Builder Sidebar Drawer ────────────────────────────────── */}
      <Drawer anchor="right" open={isCartOpen} onClose={() => dispatch(toggleCart())}>
        <Box sx={{ width: { xs: '85vw', sm: 400 }, maxWidth: 400, p: { xs: 2, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Quote Builder
            </Typography>
            <IconButton onClick={() => dispatch(toggleCart())}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {cartItems.length === 0 ? (
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
              <RequestQuoteIcon sx={{ fontSize: 60, color: theme.palette.text.secondary }} />
              <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary }}>
                Builder is empty. Add bricks to request a quote.
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 3 }}>
                {cartItems.map((item: any) => (
                  <Box key={item.product._id} sx={{ mb: 3, borderBottom: '1px solid #f5f5f4', pb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                      {item.product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => dispatch(updateQuantity({ id: item.product._id, quantity: item.quantity - 1000 }))}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.quantity.toLocaleString()} pcs
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => dispatch(updateQuantity({ id: item.product._id, quantity: item.quantity + 1000 }))}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => dispatch(removeItem(item.product._id))}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Box sx={{ pt: 2 }}>
                <Button component={Link} href="/quote" variant="contained" fullWidth size="large" onClick={() => dispatch(toggleCart())}>
                    Proceed to Request Quote
                  </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </Container>
  );
}
