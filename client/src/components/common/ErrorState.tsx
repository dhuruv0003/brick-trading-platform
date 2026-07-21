'use client';
import React from 'react';
import Link from 'next/link';
import { Box, Typography, Button, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * Standardized "something went wrong" / "not found" state.
 *
 * Before this component, error/not-found states were hand-rolled per page:
 * some were nicely centered with a heading + back button (products, blog,
 * projects detail pages), others were a bare, unstyled <Alert> or a single
 * line of <Typography> with no padding or centering at all — rendering
 * flush at the top-left of the content area on mobile especially
 * (account order detail, admin order detail, admin customer detail).
 *
 * This is the single source of truth going forward. Works both as a
 * standalone full route (blog/[slug], products/[slug]) and nested inside
 * an existing shell/layout with its own padding (account/admin pages) —
 * it centers itself within whatever space it's given rather than assuming
 * a full viewport.
 */
type ErrorStateProps = {
  /** Short heading, e.g. "Order not found" */
  title?: string;
  /** Full sentence detail, e.g. the actual error message from the API. Rendered as an Alert. */
  message?: string;
  /** If set, shows a "back" button linking here. */
  backHref?: string;
  backLabel?: string;
  minHeight?: string | number;
  maxWidth?: number | string;
};

export function ErrorState({
  title,
  message,
  backHref,
  backLabel = 'Go Back',
  minHeight = '40vh',
  maxWidth = 480,
}: ErrorStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight,
        width: '100%',
        px: 2,
        py: { xs: 4, sm: 6 },
      }}
    >
      <Box sx={{ maxWidth, width: '100%' }}>
        {title && (
          <Typography variant="h5" fontWeight={700} sx={{ mb: message ? 2 : 3 }}>
            {title}
          </Typography>
        )}
        {message && (
          <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
            {message}
          </Alert>
        )}
        {backHref && (
          <Button component={Link} href={backHref} variant="contained" startIcon={<ArrowBackIcon />}>
            {backLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
}
