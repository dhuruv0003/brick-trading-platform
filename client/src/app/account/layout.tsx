'use client';
import React from 'react';
import CustomerGuard from '../../components/guards/CustomerGuard';
import CustomerShell from '../../components/customer/CustomerShell';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerGuard>
      <CustomerShell>
        {children}
      </CustomerShell>
    </CustomerGuard>
  );
}
