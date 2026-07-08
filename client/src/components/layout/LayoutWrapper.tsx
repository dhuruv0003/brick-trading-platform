'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import { Box } from '@mui/material';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Header />}
      <Box component="main" sx={{ flexGrow: 1, minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
      {!isAdmin && <Footer />}
    </>
  );
}
