'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * The quote workflow has been replaced by the standard e-commerce Cart → Checkout → Order flow.
 * This route permanently redirects to /cart to preserve existing bookmarks and links.
 */
export default function QuoteRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/cart');
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography color="text.secondary">Redirecting to your cart…</Typography>
    </Box>
  );
}
