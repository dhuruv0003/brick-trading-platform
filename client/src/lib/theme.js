'use client';
import { createTheme, alpha, responsiveFontSizes } from '@mui/material/styles';

const BRAND = {
  orange: '#c2410c',
  orangeLight: '#ea580c',
  orangeDark: '#9a3412',
  amber: '#d97706',
  brick: '#b45309',
  charcoal: '#1c1917',
  slate: '#292524',
  warmGray: '#57534e',
  cream: '#fdf8f3',
  white: '#ffffff',
};

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: BRAND.orange,
      light: BRAND.orangeLight,
      dark: BRAND.orangeDark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: BRAND.amber,
      light: '#fbbf24',
      dark: BRAND.brick,
      contrastText: '#ffffff',
    },
    background: {
      default: BRAND.cream,
      paper: BRAND.white,
    },
    text: {
      primary: BRAND.charcoal,
      secondary: BRAND.warmGray,
    },
    success: { main: '#16a34a' },
    warning: { main: '#d97706' },
    error: { main: '#dc2626' },
    info: { main: '#0284c7' },
    divider: '#e7e5e4',
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    h1: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h3: { fontWeight: 700, lineHeight: 1.3 },
    h4: { fontWeight: 700, lineHeight: 1.4 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500, lineHeight: 1.6 },
    body1: { lineHeight: 1.7 },
    button: { fontWeight: 600, letterSpacing: '0.01em', textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0px 1px 3px rgba(0,0,0,0.06)',
    '0px 2px 8px rgba(0,0,0,0.08)',
    '0px 4px 16px rgba(0,0,0,0.1)',
    '0px 8px 24px rgba(0,0,0,0.12)',
    '0px 12px 32px rgba(0,0,0,0.14)',
    '0px 16px 48px rgba(0,0,0,0.16)',
    ...Array(18).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.95rem',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${BRAND.orangeLight} 0%, ${BRAND.orange} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${BRAND.orange} 0%, ${BRAND.orangeDark} 100%)`,
            transform: 'translateY(-1px)',
            boxShadow: `0 8px 24px ${alpha(BRAND.orange, 0.35)}`,
          },
          '&.Mui-disabled': {
            background: alpha('#000', 0.12),
            backgroundImage: 'none',
            color: alpha('#000', 0.38),
          },
          transition: 'all 0.2s ease',
        },
        outlinedPrimary: {
          borderWidth: 2,
          '&:hover': { borderWidth: 2, backgroundColor: alpha(BRAND.orange, 0.05) },
          '&.Mui-disabled': {
            borderWidth: 2,
            borderColor: alpha('#000', 0.26),
            color: alpha('#000', 0.38),
          },
        },
        sizeLarge: { padding: '14px 32px', fontSize: '1rem' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
        colorPrimary: {
          backgroundColor: alpha(BRAND.orange, 0.1),
          color: BRAND.orangeDark,
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#fff',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: BRAND.orange,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: BRAND.orange,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: 'none' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 16 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 700,
            backgroundColor: '#fafaf9',
            color: BRAND.charcoal,
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4 },
        bar: { borderRadius: 4 },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '0.95rem',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRadius: '0 16px 16px 0' },
      },
    },
  },
});

// Scales h1-h6 (and other typography variants) down at smaller breakpoints
// instead of using MUI's fixed desktop-size defaults (e.g. h1 = 96px) at
// every screen width — this was the root cause of oversized headings
// across the site on mobile, since no per-breakpoint fontSize overrides
// existed anywhere in the typography config above.
theme = responsiveFontSizes(theme, { breakpoints: ['sm', 'md', 'lg'], factor: 2 });

export { theme };

export const darkTheme = responsiveFontSizes(
  createTheme({
    ...theme,
    palette: {
      ...theme.palette,
      mode: 'dark',
      background: {
        default: '#0c0a09',
        paper: '#1c1917',
      },
      text: {
        primary: '#fafaf9',
        secondary: '#a8a29e',
      },
      divider: '#292524',
    },
  }),
);

export default theme;
