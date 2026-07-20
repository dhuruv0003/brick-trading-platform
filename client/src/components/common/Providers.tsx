'use client';
import React, { useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { SnackbarProvider, closeSnackbar } from 'notistack';
import { theme } from '../../lib/theme';
import { store } from '../../store';
import AuthHydrator from './AuthHydrator';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000,
          },
        },
      })
  );

  return (
    <ReduxProvider store={store}>
      <AuthHydrator />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {/*
            Tap-to-dismiss: notistack renders its snackbar stack inside this
            same React subtree (portals don't break React event bubbling),
            so a single click handler here catches taps on any toast. Tapping
            the toast body (not its own action button/link) closes it —
            this is what covers "swipe to dismiss" on mobile without needing
            a gesture library, since a tap is the reliable cross-device
            equivalent. The explicit X button below still works too, and is
            the only option when several toasts are stacked and you want to
            close just one.
          */}
          <Box
            onClick={(e: React.MouseEvent) => {
              const target = e.target as HTMLElement;
              const toast = target.closest('[class*="notistack-MuiContent"]');
              if (toast && !target.closest('button, a')) {
                closeSnackbar();
              }
            }}
          >
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              autoHideDuration={3000}
              preventDuplicate
              // A close (X) button on every toast, so nobody has to wait
              // out the full autoHideDuration or hunt for a way to clear it.
              action={(snackbarId) => (
                <IconButton
                  size="small"
                  aria-label="Dismiss"
                  onClick={() => closeSnackbar(snackbarId)}
                  sx={{ color: 'inherit', ml: 1 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            >
              {children}
            </SnackbarProvider>
          </Box>
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
