'use client';
import React, { useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
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
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            autoHideDuration={3000}
            preventDuplicate
            // Previously there was no way to dismiss a toast early — the
            // user had to wait out the full autoHideDuration. This adds a
            // close (X) button to every snackbar so it can be dismissed
            // immediately on tap/click.
            action={(snackbarId) => (
              <IconButton size="small" onClick={() => closeSnackbar(snackbarId)} sx={{ color: 'inherit' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          >
            {children}
          </SnackbarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
