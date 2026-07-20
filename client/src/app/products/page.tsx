'use client';
import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box, Container, Typography, Grid, Button, TextField, FormControl,
  InputLabel, Select, MenuItem, Tabs, Tab, CircularProgress, useTheme,
  InputAdornment, Skeleton, Pagination, Chip, Switch, FormControlLabel,
  Slider, Paper, Collapse,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FilterListIcon from '@mui/icons-material/FilterList';
import Link from 'next/link';
import { productsAPI, categoriesAPI } from '../../services/api';
import { useSnackbar } from 'notistack';
import useCart, { getProductQuantityRules } from '../../hooks/useCart';
import useWishlist from '../../hooks/useWishlist';
import ProductCard from '../../components/products/ProductCard';
import { getProductImageUrl, handleProductImageError } from '../../lib/productImage';

const DEFAULT_LIMIT = 12;
const PRICE_RANGE_MAX = 5000;

function ProductGridSkeleton() {
  return (
    <Grid container spacing={3}>
      {[...Array(DEFAULT_LIMIT)].map((_, i) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
          <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2, mb: 1 }} />
          <Skeleton height={24} sx={{ mb: 0.5 }} />
          <Skeleton height={18} width="70%" sx={{ mb: 1 }} />
          <Skeleton height={36} />
        </Grid>
      ))}
    </Grid>
  );
}

// Suggestions dropdown
function SearchSuggestions({ suggestions, onSelect }: { suggestions: any[]; onSelect: (name: string) => void }) {
  if (!suggestions.length) return null;
  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1300,
        maxHeight: 260, overflowY: 'auto', borderRadius: 2, mt: 0.5,
      }}
    >
      {suggestions.map((p) => (
        <Box
          key={p._id}
          onClick={() => onSelect(p.name)}
          sx={{
            px: 2, py: 1.25, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          {p.images?.length > 0 && (
            <Box
              component="img"
              src={getProductImageUrl(p)}
              alt={p.name}
              onError={handleProductImageError}
              sx={{ width: 36, height: 36, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
            />
          )}
          <Box>
            <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              ₹{p.pricing?.retail?.toLocaleString('en-IN')} / {p.pricing?.unit}
            </Typography>
          </Box>
        </Box>
      ))}
    </Paper>
  );
}

function ProductsContent() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const { add: addToCart, count: cartCount } = useCart();
  const { isInWishlist, add: addToWishlist, remove: removeFromWishlist } = useWishlist();

  // ── Read initial state from URL ─────────────────────────────────────────
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'name');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') || 'all');
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get('featured') === 'true');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get('priceMin') || 0),
    Number(searchParams.get('priceMax') || PRICE_RANGE_MAX),
  ]);
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [showFilters, setShowFilters] = useState(false);

  // ── Data state ─────────────────────────────────────────────────────────
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // ── Instant search suggestions ─────────────────────────────────────────
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // ── Push filters to URL ────────────────────────────────────────────────
  const syncURL = useCallback(
    (overrides: Record<string, any> = {}) => {
      const params = new URLSearchParams();
      const state = { search, category: selectedCat, sortBy, inStock: inStockOnly, page, ...overrides };
      if (state.search) params.set('search', state.search);
      if (state.category && state.category !== 'all') params.set('category', state.category);
      if (state.sortBy && state.sortBy !== 'name') params.set('sortBy', state.sortBy);
      if (state.inStock && state.inStock !== 'all') params.set('inStock', state.inStock);
      if (featuredOnly || overrides.featured) params.set('featured', 'true');
      if (priceRange[0] > 0 || overrides.priceMin > 0) params.set('priceMin', String(overrides.priceMin ?? priceRange[0]));
      if (priceRange[1] < PRICE_RANGE_MAX || overrides.priceMax < PRICE_RANGE_MAX) params.set('priceMax', String(overrides.priceMax ?? priceRange[1]));
      if (state.page > 1) params.set('page', String(state.page));
      router.replace(`/products?${params.toString()}`, { scroll: false });
    },
    [search, selectedCat, sortBy, inStockOnly, featuredOnly, priceRange, page, router]
  );

  // ── Fetch products ─────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (overrides: Record<string, any> = {}) => {
    setLoading(true);
    setSuggestions([]);
    setShowSuggestions(false);
    try {
      const params: any = {
        sortBy: overrides.sortBy ?? sortBy,
        page: overrides.page ?? page,
        limit: DEFAULT_LIMIT,
      };
      const cat = overrides.category ?? selectedCat;
      const inStock = overrides.inStock ?? inStockOnly;
      const featured = overrides.featured ?? featuredOnly;
      const pMin = overrides.priceMin ?? priceRange[0];
      const pMax = overrides.priceMax ?? priceRange[1];
      const q = overrides.search ?? search;

      if (cat !== 'all') params.category = cat;
      if (inStock !== 'all') params.inStock = inStock;
      if (featured) params.isFeatured = true;
      if (q.trim()) params.search = q.trim();
      if (pMin > 0) params.priceMin = pMin;
      if (pMax < PRICE_RANGE_MAX) params.priceMax = pMax;

      const res = await productsAPI.getAll(params);
      setProducts(res.data.data || []);
      setTotalPages(res.data.meta?.totalPages || 1);
      setTotalProducts(res.data.meta?.total || 0);
    } catch {
      enqueueSnackbar('Failed to load products.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [sortBy, page, selectedCat, inStockOnly, featuredOnly, priceRange, search, enqueueSnackbar]);

  // ── Instant search (debounced suggestions) ─────────────────────────────
  const fetchSuggestions = useCallback(async (term: string) => {
    if (term.trim().length < 2) { setSuggestions([]); return; }
    try {
      const res = await productsAPI.getAll({ search: term.trim(), limit: 6 });
      setSuggestions(res.data.data || []);
    } catch { /* silent */ }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 280);
  };

  const handleSelectSuggestion = (name: string) => {
    setSearch(name);
    setShowSuggestions(false);
    setSuggestions([]);
    const newPage = 1;
    setPage(newPage);
    syncURL({ search: name, page: newPage });
    fetchProducts({ search: name, page: newPage });
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { categoriesAPI.getAll().then(r => setCategories(r.data.data.categories || [])).catch(() => {}); }, []);

  // Initial load
  useEffect(() => { fetchProducts(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filter handlers — update state, sync URL, refetch ──────────────────
  const handleCategoryChange = (_: React.SyntheticEvent, val: string) => {
    setSelectedCat(val); setPage(1);
    syncURL({ category: val, page: 1 });
    fetchProducts({ category: val, page: 1 });
  };

  const handleSortChange = (val: string) => {
    setSortBy(val); setPage(1);
    syncURL({ sortBy: val, page: 1 });
    fetchProducts({ sortBy: val, page: 1 });
  };

  const handleStockChange = (val: string) => {
    setInStockOnly(val); setPage(1);
    syncURL({ inStock: val, page: 1 });
    fetchProducts({ inStock: val, page: 1 });
  };

  const handleFeaturedChange = (checked: boolean) => {
    setFeaturedOnly(checked); setPage(1);
    syncURL({ featured: checked, page: 1 });
    fetchProducts({ featured: checked, page: 1 });
  };

  const handlePriceCommit = (_: any, val: number | number[]) => {
    const [min, max] = val as [number, number];
    setPriceRange([min, max]); setPage(1);
    syncURL({ priceMin: min, priceMax: max, page: 1 });
    fetchProducts({ priceMin: min, priceMax: max, page: 1 });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setPage(1);
    syncURL({ page: 1 });
    fetchProducts({ page: 1 });
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, val: number) => {
    setPage(val);
    syncURL({ page: val });
    fetchProducts({ page: val });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setSearch(''); setSelectedCat('all'); setSortBy('name');
    setInStockOnly('all'); setFeaturedOnly(false);
    setPriceRange([0, PRICE_RANGE_MAX]); setPage(1);
    router.replace('/products', { scroll: false });
    fetchProducts({ search: '', category: 'all', sortBy: 'name', inStock: 'all', featured: false, priceMin: 0, priceMax: PRICE_RANGE_MAX, page: 1 });
  };

  const handleAddToCart = (product: any) => {
    if (!product.inStock) return;
    const { minQuantity } = getProductQuantityRules(product);
    addToCart(product, minQuantity);
    enqueueSnackbar(`${product.name} added to cart!`, {
      variant: 'success',
      action: <Button size="small" color="inherit" component={Link} href="/cart">View Cart</Button>,
    });
  };

  const handleToggleWishlist = (product: any) => {
    isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product);
  };

  const activeFilterCount = [
    selectedCat !== 'all', inStockOnly !== 'all', featuredOnly,
    priceRange[0] > 0 || priceRange[1] < PRICE_RANGE_MAX,
  ].filter(Boolean).length;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Box sx={{ mb: { xs: 3, md: 5 } }}>
        <Typography variant="h2" sx={{ fontWeight: 800, mb: 0.5, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
          Product Catalog
        </Typography>
        <Typography variant="body1" color="text.secondary">
          High-performance bricks and block materials sourced directly from kilns.
        </Typography>
      </Box>

      {/* ── Search bar ──────────────────────────────────────────────────── */}
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={7}>
            <Box ref={searchBoxRef} sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                placeholder="Search products by name, type, specs..."
                value={search}
                onChange={handleSearchChange}
                onFocus={() => suggestions.length && setShowSuggestions(true)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button type="submit" variant="contained" size="small">Search</Button>
                    </InputAdornment>
                  ),
                }}
              />
              {showSuggestions && (
                <SearchSuggestions suggestions={suggestions} onSelect={handleSelectSuggestion} />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={(e) => handleSortChange(e.target.value)}>
                <MenuItem value="name">Name (A–Z)</MenuItem>
                <MenuItem value="-name">Name (Z–A)</MenuItem>
                <MenuItem value="pricing.retail">Price: Low to High</MenuItem>
                <MenuItem value="-pricing.retail">Price: High to Low</MenuItem>
                <MenuItem value="-soldCount">Best Sellers</MenuItem>
                <MenuItem value="-createdAt">Newest First</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters((v) => !v)}
              endIcon={activeFilterCount > 0 ? <Chip label={activeFilterCount} size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} /> : undefined}
              sx={{ flex: 1, whiteSpace: 'nowrap' }}
            >
              Filters
            </Button>
            <Button component={Link} href="/cart" variant="outlined" size="small" startIcon={<ShoppingCartIcon />} sx={{ flex: 1, whiteSpace: 'nowrap' }}>
              {cartCount > 0 ? `Cart (${cartCount})` : 'Cart'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* ── Collapsible advanced filters ────────────────────────────────── */}
      <Collapse in={showFilters}>
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Stock Status</InputLabel>
                <Select value={inStockOnly} label="Stock Status" onChange={(e) => handleStockChange(e.target.value)}>
                  <MenuItem value="all">All Items</MenuItem>
                  <MenuItem value="true">In Stock Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={<Switch checked={featuredOnly} onChange={(e) => handleFeaturedChange(e.target.checked)} color="primary" />}
                label="Featured Products Only"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Price Range: ₹{priceRange[0].toLocaleString('en-IN')} – ₹{priceRange[1] >= PRICE_RANGE_MAX ? `${PRICE_RANGE_MAX.toLocaleString('en-IN')}+` : priceRange[1].toLocaleString('en-IN')}
              </Typography>
              <Slider
                value={priceRange}
                min={0} max={PRICE_RANGE_MAX} step={50}
                onChange={(_, val) => setPriceRange(val as [number, number])}
                onChangeCommitted={handlePriceCommit}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `₹${v.toLocaleString('en-IN')}`}
              />
            </Grid>
            {activeFilterCount > 0 && (
              <Grid item xs={12}>
                <Button size="small" color="error" onClick={clearAllFilters}>Clear All Filters</Button>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Collapse>

      {/* ── Category Tabs ────────────────────────────────────────────────── */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
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

      {/* ── Results count ───────────────────────────────────────────────── */}
      {!loading && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {totalProducts > 0 ? `Showing ${products.length} of ${totalProducts} products` : ''}
        </Typography>
      )}

      {/* ── Product grid ────────────────────────────────────────────────── */}
      {loading ? (
        <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: { xs: 8, md: 12 }, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <ShoppingCartIcon sx={{ fontSize: 72, color: 'text.disabled' }} />
          <Typography variant="h5" fontWeight={700}>No products found</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
            {search
              ? `No results for "${search}". Try a different term or clear filters.`
              : 'No products match your filters.'}
          </Typography>
          <Button variant="contained" onClick={clearAllFilters}>Clear All Filters</Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {products.map((product) => (
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

          {/* ── Pagination ──────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <ProductsContent />
    </Suspense>
  );
}
