'use client';
import React from 'react';
import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Paper, Card, CardContent,
  Stack, Typography, Skeleton, useTheme, useMediaQuery,
} from '@mui/material';

/**
 * ResponsiveDataView
 * ------------------
 * A plain MUI <Table> works fine on desktop but overflows/squashes badly on
 * phone-width screens (columns get crushed, horizontal scrolling is
 * confusing for non-technical users). This component renders the same data
 * as:
 *   - a normal table on desktop/tablet (>= sm breakpoint), and
 *   - a stack of cards on mobile, one card per row, with each column shown
 *     as a labeled line — nothing to scroll sideways, nothing gets cut off.
 *
 * This is intentionally generic (rows + column definitions) so it can be
 * reused across any list page (admin or customer) rather than each page
 * hand-rolling its own mobile layout.
 *
 * Usage:
 *   <ResponsiveDataView
 *     columns={[
 *       { key: 'orderNumber', label: 'Order #' },
 *       { key: 'status', label: 'Status', render: (row) => <Chip label={row.status} /> },
 *     ]}
 *     rows={orders}
 *     rowKey={(row) => row._id}
 *     isLoading={isLoading}
 *     emptyMessage="No orders yet."
 *     onRowClick={(row) => router.push(`/account/orders/${row._id}`)}
 *     renderMobileTitle={(row) => `#${row.orderNumber}`}
 *   />
 */

export interface ResponsiveColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  // Hide this column's card row on mobile if it's already shown as the title/subtitle.
  hideOnMobile?: boolean;
}

interface ResponsiveDataViewProps<T> {
  columns: ResponsiveColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  // What to show as the bold title on each mobile card (defaults to first column).
  renderMobileTitle?: (row: T) => React.ReactNode;
  renderMobileSubtitle?: (row: T) => React.ReactNode;
  // Optional trailing actions (buttons/menu) rendered on both table rows and cards.
  renderActions?: (row: T) => React.ReactNode;
}

export default function ResponsiveDataView<T>({
  columns,
  rows,
  rowKey,
  isLoading = false,
  skeletonRows = 5,
  emptyMessage = 'No records found.',
  onRowClick,
  renderMobileTitle,
  renderMobileSubtitle,
  renderActions,
}: ResponsiveDataViewProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isLoading) {
    return isMobile ? (
      <Stack spacing={1.5}>
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={92} />
        ))}
      </Stack>
    ) : (
      <Table>
        <TableBody>
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={columns.length + (renderActions ? 1 : 0)}>
                <Skeleton height={36} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (!rows.length) {
    return (
      <Box sx={{ py: 5, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  // ---------- Mobile: stacked cards ----------
  if (isMobile) {
    return (
      <Stack spacing={1.5} sx={{ p: { xs: 1.5, sm: 0 } }}>
        {rows.map((row) => {
          const title = renderMobileTitle ? renderMobileTitle(row) : (columns[0].render ? columns[0].render(row) : (row as any)[columns[0].key]);
          const subtitle = renderMobileSubtitle ? renderMobileSubtitle(row) : null;
          const visibleColumns = columns.filter((c) => !c.hideOnMobile);

          return (
            <Card
              key={rowKey(row)}
              elevation={0}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                cursor: onRowClick ? 'pointer' : 'default',
                '&:active': onRowClick ? { backgroundColor: 'action.hover' } : undefined,
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: subtitle ? 0.25 : 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
                  {renderActions && <Box onClick={(e) => e.stopPropagation()}>{renderActions(row)}</Box>}
                </Stack>
                {subtitle && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {subtitle}
                  </Typography>
                )}
                <Stack spacing={0.75} sx={{ mt: 1 }}>
                  {visibleColumns.slice(1).map((col) => {
                    const value = col.render ? col.render(row) : (row as any)[col.key];
                    if (value === undefined || value === null || value === '') return null;
                    return (
                      <Stack key={col.key} direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">{col.label}</Typography>
                        <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 500 }}>{value}</Typography>
                      </Stack>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    );
  }

  // ---------- Desktop/tablet: normal table ----------
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key} align={col.align || 'left'}>{col.label}</TableCell>
            ))}
            {renderActions && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={rowKey(row)}
              hover
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align || 'left'}>
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </TableCell>
              ))}
              {renderActions && (
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  {renderActions(row)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
