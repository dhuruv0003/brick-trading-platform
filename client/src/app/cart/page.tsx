'use client';
import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Divider,
  IconButton,
  Container,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { getProductImageUrl, handleProductImageError } from '../../lib/productImage';
import useCart from '../../hooks/useCart';
import useCustomerAuth from '../../hooks/useCustomerAuth';
import useWishlist from '../../hooks/useWishlist';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { getQuantityRules, getProductPricingType } from '../../lib/quantityRules';

export default function CartPage() {
  const theme = useTheme();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { itemsList, total, remove, update, clear } = useCart();
  const { isInWishlist, add: addToWishlist, remove: removeFromWishlist } = useWishlist();

  const handleUpdateQuantity = (
    productId: string,
    newQuantity: number
  ) => {
    const result = update(productId, newQuantity);
    if (result?.clamped) {
      enqueueSnackbar(
        `Only ${result.limit} unit${result.limit === 1 ? '' : 's'} available in stock.`,
        { variant: 'warning' }
      );
    }
  };

  const handleMoveToWishlist = (product: any) => {
    remove(product._id);
    addToWishlist(product);
    enqueueSnackbar(`${product.name} moved to wishlist`, { variant: 'success' });
  };
  const { isAuthenticated } = useCustomerAuth();

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent('/checkout')}`);
      return;
    }
    router.push('/checkout');
  };

  // ── Empty cart state ───────────────────────────────────────────────────────
  if (itemsList.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: '#f5f5f4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 4,
          }}
        >
          <ShoppingCartOutlinedIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
        </Box>
        <Typography variant="h4" fontWeight={800} mb={2} fontFamily='"Playfair Display", serif'>
          Your Cart is Empty
        </Typography>
        <Typography color="text.secondary" mb={5} sx={{ maxWidth: 400, mx: 'auto', lineHeight: 1.7 }}>
          You haven't added anything to your cart yet. Browse our product catalog to get started.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            component={Link}
            href="/products"
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ borderRadius: 2, py: 1.5, px: 4 }}
          >
            Browse Products
          </Button>
          {!isAuthenticated && (
            <Button
              component={Link}
              href="/auth/login"
              variant="outlined"
              size="large"
              sx={{ borderRadius: 2, py: 1.5 }}
            >
              Login
            </Button>
          )}
        </Box>
      </Container>
    );
  }

  // ── Cart with items ────────────────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" fontWeight={800} mb={4} fontFamily='"Playfair Display", serif'>
        Shopping Cart
        <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 2, fontFamily: 'inherit' }}>
          ({itemsList.length} {itemsList.length === 1 ? 'item' : 'items'})
        </Typography>
      </Typography>

      <Grid container spacing={4}>
        {/* ── Items list ── */}
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            {itemsList.map((item, index) => (
              <React.Fragment key={item.product._id}>
                <Box sx={{ display: 'flex', p: { xs: 2, sm: 3 }, gap: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', sm: 'row' } }}>
                  {/* Product image */}
                  <Box
                    sx={{
                      width: { xs: '100%', sm: 110 },
                      height: { xs: 200, sm: 110 },
                      position: 'relative',
                      borderRadius: 2,
                      overflow: 'hidden',
                      flexShrink: 0,
                      bgcolor: 'background.default',
                    }}
                  >
                    {item.product.images?.length ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getProductImageUrl(item.product)}
                        alt={item.product.name}
                        onError={handleProductImageError}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          bgcolor: '#f5f5f4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="caption" color="text.disabled">No Image</Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Product details */}
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          component={Link}
                          href={`/products/${item.product.slug}`}
                          sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: 'primary.main' } }}
                        >
                          {item.product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {typeof item.product.category === 'string'
                            ? item.product.category
                            : item.product.category?.name || 'Construction Material'}
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={700} noWrap>
                        ₹{item.product.pricing?.retail?.toLocaleString('en-IN')}
                        <Typography component="span" variant="caption" color="text.secondary" ml={0.5}>
                          /{item.product.pricing?.unit || 'unit'}
                        </Typography>
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, flexWrap: 'wrap', gap: 1 }}>
                      {/* Quantity control */}
                      <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        {(() => {
                          const { step, minQuantity } = getQuantityRules(getProductPricingType(item.product));
                          return (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleUpdateQuantity(item.product._id, item.quantity - step)}
                                disabled={item.quantity <= minQuantity}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              <Typography sx={{ px: 2.5, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>
                                {item.quantity}
                              </Typography>
                              <IconButton size="small" onClick={() => handleUpdateQuantity(item.product._id, item.quantity + step)}>
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </>
                          );
                        })()}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                          ₹{((item.product.pricing?.retail || 0) * item.quantity).toLocaleString('en-IN')}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleMoveToWishlist(item.product)}
                          aria-label="Move to wishlist"
                          sx={{ color: isInWishlist(item.product._id) ? 'error.main' : 'text.secondary' }}
                        >
                          {isInWishlist(item.product._id) ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                        </IconButton>
                        <IconButton color="error" size="small" onClick={() => remove(item.product._id)} aria-label="Remove item">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Box>
                {index < itemsList.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 2 }}>
            <Button component={Link} href="/products" variant="text">
              ← Continue Shopping
            </Button>
            <Button color="error" variant="text" onClick={clear}>
              Clear Cart
            </Button>
          </Box>
        </Grid>

        {/* ── Order summary ── */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              position: { md: 'sticky' },
              top: { md: 100 },
            }}
          >
            <Typography variant="h6" fontWeight={700} mb={3}>
              Order Summary
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="text.secondary">
                Subtotal ({itemsList.length} {itemsList.length === 1 ? 'item' : 'items'})
              </Typography>
              <Typography fontWeight={600}>₹{total.toLocaleString('en-IN')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="text.secondary">Shipping</Typography>
              <Typography color="text.secondary">Calculated at checkout</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
              <Typography variant="h6" fontWeight={700}>Total</Typography>
              <Typography variant="h6" fontWeight={700} color="primary">
                ₹{total.toLocaleString('en-IN')}
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              fullWidth
              endIcon={<ArrowForwardIcon />}
              onClick={handleProceedToCheckout}
              sx={{ borderRadius: 2, py: 1.5, fontWeight: 700 }}
            >
              {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
            </Button>

            {!isAuthenticated && (
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1.5}>
                Your cart is saved. Login to complete your order.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
