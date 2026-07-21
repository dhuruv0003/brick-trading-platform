'use client';
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Standardized loading indicators.
 *
 * Before this file, loading spinners were hand-rolled per page with
 * inconsistent wrapper styles — some centered, some pinned to
 * `justifyContent: 'flex-end'` (right-aligned, likely a copy/paste bug),
 * some with no horizontal centering at all, sizes ranging from 20–40px with
 * no responsive scaling. These two components are now the single source of
 * truth for "something is loading" anywhere in the app:
 *
 *  - <PageLoader />    Full route/page-level loading state (nothing else on
 *                      the page yet). Fills the viewport height, minus the
 *                      fixed header, and centers on both axes.
 *  - <SectionLoader /> A loading state *within* an already-rendered layout
 *                      (a table, a panel, a tab, a card) — centers within
 *                      its own container instead of the viewport, with a
 *                      sensible minimum height so surrounding content
 *                      doesn't jump when the spinner appears/disappears.
 *
 * Both scale the spinner size down slightly on mobile — a 40px spinner
 * reads as oddly large on a 360px-wide screen next to normal body text.
 */

const SPINNER_SX_RESPONSIVE = { width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } };

type PageLoaderProps = {
  /** Optional helper text under the spinner, e.g. "Completing sign in..." */
  label?: string;
  /** Height to fill. Defaults to a full-page route loading state. */
  minHeight?: string | number;
};

export function PageLoader({ label, minHeight = '60vh' }: PageLoaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minHeight,
        width: '100%',
        px: 2,
        textAlign: 'center',
      }}
    >
      <CircularProgress sx={SPINNER_SX_RESPONSIVE} />
      {label && (
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      )}
    </Box>
  );
}

type SectionLoaderProps = {
  /** Minimum height of the loading area so layout doesn't shift. */
  minHeight?: string | number;
  /** Slightly smaller spinner + tighter padding for compact areas (dropdowns, small cards). */
  compact?: boolean;
};

export function SectionLoader({ minHeight = 200, compact = false }: SectionLoaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: compact ? 80 : minHeight,
        width: '100%',
        py: compact ? 2 : 4,
      }}
    >
      <CircularProgress size={compact ? 24 : undefined} sx={compact ? undefined : SPINNER_SX_RESPONSIVE} />
    </Box>
  );
}
