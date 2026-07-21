'use client';
import React from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { PageLoader } from '../../../components/common/Loaders';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Link from 'next/link';
import useWishlist from '../../../hooks/useWishlist';
import useCart, { getProductQuantityRules } from '../../../hooks/useCart';
import ProductCard from '../../../components/products/ProductCard';
import { useSnackbar } from 'notistack';

export default function WishlistPage() {
  const { products, loading, remove, isInWishlist } = useWishlist();
  const { add: addToCart } = useCart();
  const { enqueueSnackbar } = useSnackbar();

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

  if (loading) return (
    <PageLoader />
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} mb={3} fontFamily='"Playfair Display", serif'>
        My Wishlist
        {products.length > 0 && (
          <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 1.5 }}>
            ({products.length} {products.length === 1 ? 'item' : 'items'})
          </Typography>
        )}
      </Typography>

      {products.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <FavoriteBorderIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} mb={1}>Your wishlist is empty</Typography>
          <Typography color="text.secondary" mb={3}>
            Save products you love to come back to them later.
          </Typography>
          <Button variant="contained" component={Link} href="/products">
            Browse Products
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {products.map((product: any) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <ProductCard
                product={product}
                onAddToCart={handleAddToCart}
                showWishlistToggle
                isInWishlist={isInWishlist(product._id)}
                onToggleWishlist={() => remove(product._id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
