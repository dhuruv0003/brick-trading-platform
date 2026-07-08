'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Grid2 as Grid,
  Paper,
  Box,
  Typography,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Skeleton,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import StarIcon from '@mui/icons-material/Star';
import { dashboardAPI } from '../../services/api';

const STATUS_COLORS: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  new: 'info',
  contacted: 'warning',
  converted: 'success',
  closed: 'default',
  lost: 'error',
};

function StatCard({ icon, label, value, growth }: { icon: React.ReactNode; label: string; value: React.ReactNode; growth?: number }) {
  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        {typeof growth === 'number' && (
          <Chip
            size="small"
            icon={growth >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
            label={`${growth >= 0 ? '+' : ''}${growth}%`}
            color={growth >= 0 ? 'success' : 'error'}
            variant="outlined"
          />
        )}
      </Box>
      <Typography variant="h4" fontWeight={800}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: async () => (await dashboardAPI.getStats()).data.data,
  });

  const stats = data?.stats;
  const recentLeads = data?.recentLeads ?? [];

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
        Dashboard Overview
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={128} />
          ) : (
            <StatCard icon={<PeopleAltIcon />} label="Total Leads" value={stats?.totalLeads ?? 0} growth={stats?.leadGrowth} />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={128} />
          ) : (
            <StatCard icon={<PeopleAltIcon />} label="New Leads" value={stats?.newLeads ?? 0} />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={128} />
          ) : (
            <StatCard icon={<RequestQuoteIcon />} label="Pending Quotes" value={stats?.pendingQuotes ?? 0} />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={128} />
          ) : (
            <StatCard icon={<Inventory2Icon />} label="Active Products" value={stats?.totalProducts ?? 0} />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Recent Leads
              </Typography>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Customer Type</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4}>
                        <Skeleton />
                      </TableCell>
                    </TableRow>
                  ))}
                {!isLoading && recentLeads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                        No leads yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {recentLeads.map((lead: any) => (
                  <TableRow key={lead._id} hover>
                    <TableCell>{lead.name}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{lead.customerType?.replace('_', ' ')}</TableCell>
                    <TableCell>
                      <Chip size="small" label={lead.status} color={STATUS_COLORS[lead.status] || 'default'} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Leads by Status
            </Typography>
            {isLoading && <Skeleton variant="rounded" height={140} />}
            {!isLoading &&
              (data?.leadsByStatus ?? []).map((s: any) => (
                <Box key={s._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Chip size="small" label={s._id} color={STATUS_COLORS[s._id] || 'default'} sx={{ textTransform: 'capitalize' }} />
                  <Typography variant="body2" fontWeight={700}>
                    {s.count}
                  </Typography>
                </Box>
              ))}
            {!isLoading && (data?.leadsByStatus ?? []).length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No data yet.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
