'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardMedia,
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  useTheme,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import useCustomerAuth from '../../hooks/useCustomerAuth';
import { getProductImageUrl, handleProductImageError } from '../../lib/productImage';

interface ProductCardProps {
  product: any;
  /** Called when "Add to Cart" is clicked. Button is hidden if omitted. */
  onAddToCart?: (product: any) => void;
  /** Show a "Buy Now" button that goes directly to checkout (auth-aware). */
  showBuyNow?: boolean;
  /** Enables the heart/wishlist toggle in the top-right corner of the image. */
  showWishlistToggle?: boolean;
  isInWishlist?: boolean;
  onToggleWishlist?: (product: any) => void;
}

/**
 * Shared product card used across the product catalog grid, homepage sections,
 * search results, categories, wishlist, and related products.
 *
 * Cart controls are opt-in via props so pages that don't need them
 * (e.g. a simple category embed) aren't forced to wire up the cart hook.
 */
export default function ProductCard({
  product,
  onAddToCart,
  showBuyNow = false,
  showWishlistToggle = false,
  isInWishlist = false,
  onToggleWishlist,
}: ProductCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useCustomerAuth();

  const isOutOfStock = !product.inStock;

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent('/checkout')}`);
      return;
    }
    // Add to cart first, then go to checkout
    onAddToCart?.(product);
    router.push('/checkout');
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <Box sx={{ position: 'relative', height: 220, overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={getProductImageUrl(product)}
          alt={product.name}
          onError={handleProductImageError}
          sx={{
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'scale(1.04)' },
          }}
        />
        {/* Out of Stock badge — top right */}
        {isOutOfStock && (
          <Chip
            label="Out of Stock"
            color="error"
            size="small"
            sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 600 }}
          />
        )}
        {/* Featured badge — top left */}
        {product.isFeatured && !isOutOfStock && (
          <Chip
            label="Featured"
            color="primary"
            size="small"
            sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 600 }}
          />
        )}
        {/* Wishlist toggle — bottom right */}
        {showWishlistToggle && (
          <IconButton
            onClick={() => onToggleWishlist?.(product)}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'rgba(255,255,255,0.92)',
              '&:hover': { bgcolor: '#fff' },
            }}
          >
            {isInWishlist ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
          </IconButton>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 0.75,
              cursor: 'pointer',
              fontSize: { xs: '0.95rem', sm: '1rem' },
              lineHeight: 1.3,
              '&:hover': { color: theme.palette.primary.main },
            }}
          >
            {product.name}
          </Typography>
        </Link>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary, mb: 1.5, height: 38, overflow: 'hidden' }}
        >
          {product.shortDescription ||
            (product.description ? `${product.description.slice(0, 80)}...` : '')}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
          {product.specs?.type && (
            <Chip label={product.specs.type} size="small" variant="outlined" />
          )}
          {product.specs?.size && (
            <Chip label={product.specs.size} size="small" variant="outlined" />
          )}
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.secondary.dark }}>
          ₹{product.pricing?.retail?.toLocaleString('en-IN')}{' '}
          <span style={{ fontSize: '0.78rem', fontWeight: 500, color: theme.palette.text.secondary }}>
            / {product.pricing?.unit || 'unit'}
          </span>
        </Typography>
      </CardContent>

      {(onAddToCart || showBuyNow) && (
        <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
          {onAddToCart && (
            <Button
              variant="contained"
              fullWidth={!showBuyNow}
              disabled={isOutOfStock}
              onClick={() => onAddToCart(product)}
              startIcon={<AddShoppingCartIcon />}
              sx={{ flex: showBuyNow ? 1 : undefined }}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          )}
          {showBuyNow && (
            <Button
              variant="outlined"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              startIcon={<FlashOnIcon />}
              sx={{ flex: 1 }}
            >
              Buy Now
            </Button>
          )}
        </Box>
      )}
    </Card>
  );
}
