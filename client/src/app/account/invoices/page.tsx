'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Paper, Button, TablePagination } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { ordersAPI } from '../../../services/api';
import useAdminResource from '../../../hooks/useAdminResource';
import ResponsiveDataView from '../../../components/common/ResponsiveDataView';

export default function MyInvoicesPage() {
  const router = useRouter();

  const {
    items: orders, meta, isLoading, page, setPage, limit, setLimit,
  } = useAdminResource({
    key: 'my-invoices',
    listFn: 'getAll',
    api: {
      getAll: ordersAPI.getMyInvoices,
      create: async () => {},
      update: async () => {},
      delete: async () => {},
    },
  });

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Invoices</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Invoices are available here once your order has been delivered.
      </Typography>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <ResponsiveDataView
          isLoading={isLoading}
          rows={orders}
          rowKey={(o: any) => o._id}
          onRowClick={(o: any) => router.push(`/account/orders/${o._id}`)}
          emptyMessage="No invoices yet — they appear here once an order is delivered."
          renderMobileTitle={(o: any) => `#${o.orderNumber}`}
          renderMobileSubtitle={(o: any) => new Date(o.createdAt).toLocaleDateString('en-IN')}
          renderActions={(o: any) => (
            o.invoice?.fileUrl ? (
              <Button
                size="small"
                startIcon={<DownloadIcon />}
                href={o.invoice.fileUrl}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
              >
                Download
              </Button>
            ) : (
              <Typography variant="caption" color="text.secondary">Not ready yet</Typography>
            )
          )}
          columns={[
            { key: 'orderNumber', label: 'Order #', render: (o: any) => `#${o.orderNumber}` },
            { key: 'createdAt', label: 'Delivered On', render: (o: any) => new Date(o.updatedAt || o.createdAt).toLocaleDateString('en-IN') },
            { key: 'totalAmount', label: 'Amount', render: (o: any) => `₹${(o.totalAmount ?? 0).toLocaleString('en-IN')}` },
            { key: 'invoiceNumber', label: 'Invoice #', render: (o: any) => o.invoice?.number || '—' },
          ]}
        />
        {!isLoading && orders.length > 0 && (
          <TablePagination
            component="div"
            count={meta?.total ?? 0}
            page={page - 1}
            onPageChange={(_, newPage) => setPage(newPage + 1)}
            rowsPerPage={limit}
            onRowsPerPageChange={(e) => setLimit(parseInt(e.target.value, 10))}
            rowsPerPageOptions={[5, 10, 25]}
          />
        )}
      </Paper>
    </Box>
  );
}
