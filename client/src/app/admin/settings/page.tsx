'use client';
import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Box, Typography, Paper, Grid2 as Grid, TextField, Button, Tabs, Tab, Switch, FormControlLabel,
  Skeleton, Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { settingsAPI } from '../../../services/api';

const GROUPS = ['homepage', 'general', 'contact', 'social', 'seo', 'email'];

// Keys the storefront actually reads (homepage stats, footer contact/social
// info, etc.) — these must be marked isPublic so they come back from
// GET /settings/public. Anything not in this list defaults to private,
// matching the original scaffold's behavior for admin-only fields.
const PUBLIC_KEYS = new Set([
  'homepage_stats',
  'company_name', 'company_tagline', 'company_address',
  'phone_primary', 'phone_whatsapp', 'email_primary',
  'facebook_url', 'instagram_url', 'linkedin_url', 'twitter_url',
]);

const DEFAULT_STATS = [
  { val: '15+', label: 'Years of Trust' },
  { val: '500M+', label: 'Bricks Delivered' },
  { val: '10k+', label: 'Happy Customers' },
  { val: '50+', label: 'Fleet Vehicles' },
];

export default function AdminSettingsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('homepage');
  const [values, setValues] = useState<Record<string, any>>({});
  const [stats, setStats] = useState(DEFAULT_STATS);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => (await settingsAPI.getAll()).data.data.settings,
  });

  useEffect(() => {
    if (data) {
      const map: Record<string, any> = {};
      data.forEach((s: any) => { map[s.key] = s; });
      setValues(map);

      const rawStats = map['homepage_stats']?.value;
      const parsed = typeof rawStats === 'string' ? JSON.parse(rawStats) : rawStats;
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Always keep exactly 4 rows in the editor, padding with blanks if fewer were saved.
        const padded = [...parsed, ...DEFAULT_STATS].slice(0, 4);
        setStats(padded);
      }
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (payload: any) => settingsAPI.upsert(payload),
    onSuccess: () => {
      enqueueSnackbar('Setting saved', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
    onError: (err: any) => enqueueSnackbar(err.response?.data?.message || 'Save failed', { variant: 'error' }),
  });

  const handleChange = (key: string, value: any, group: string, type = 'string') => {
    setValues((v) => ({ ...v, [key]: { ...(v[key] || {}), key, value, group, type } }));
  };

  const handleSaveField = (key: string) => {
    const item = values[key];
    if (!item) return;
    saveMutation.mutate({
      key: item.key,
      value: item.value,
      type: item.type || 'string',
      group: item.group,
      label: item.label,
      isPublic: PUBLIC_KEYS.has(key) ? true : item.isPublic,
    });
  };

  const handleSaveStats = () => {
    saveMutation.mutate({
      key: 'homepage_stats',
      value: stats,
      type: 'json',
      group: 'homepage',
      label: 'Homepage Stats Bar',
      isPublic: true,
    });
  };

  const groupSettings = (group: string) => Object.values(values).filter((s: any) => s.group === group);

  // Well-known settings scaffolds so admin can add them even if not yet in DB
  const KNOWN_FIELDS: Record<string, { key: string; label: string; multiline?: boolean }[]> = {
    general: [
      { key: 'company_name', label: 'Company Name' },
      { key: 'company_tagline', label: 'Tagline (shown in footer)', multiline: true },
      { key: 'company_address', label: 'Address', multiline: true },
    ],
    contact: [
      { key: 'phone_primary', label: 'Primary Phone' },
      { key: 'phone_whatsapp', label: 'WhatsApp Number' },
      { key: 'email_primary', label: 'Contact Email' },
      { key: 'google_maps_url', label: 'Google Maps Embed URL', multiline: true },
    ],
    social: [
      { key: 'facebook_url', label: 'Facebook URL' },
      { key: 'instagram_url', label: 'Instagram URL' },
      { key: 'twitter_url', label: 'Twitter / X URL' },
      { key: 'linkedin_url', label: 'LinkedIn URL' },
    ],
    seo: [
      { key: 'meta_title', label: 'Default Meta Title' },
      { key: 'meta_description', label: 'Default Meta Description', multiline: true },
      { key: 'google_analytics_id', label: 'Google Analytics ID' },
    ],
    email: [
      { key: 'admin_notification_email', label: 'Admin Notification Email' },
    ],
  };

  const fieldsForGroup = (group: string): { key: string; label: string; multiline?: boolean }[] => {
    const known = KNOWN_FIELDS[group] || [];
    const knownKeys = new Set(known.map((f) => f.key));
    const extra = groupSettings(group).filter((s: any) => !knownKeys.has(s.key));
    return [...known, ...extra.map((s: any) => ({ key: s.key, label: s.label || s.key }))];
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Settings</Typography>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          {GROUPS.map((g) => <Tab key={g} value={g} label={g} sx={{ textTransform: 'capitalize' }} />)}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {isLoading && <Skeleton variant="rounded" height={200} />}
          {!isLoading && tab === 'homepage' && (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                Stats Bar
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Shown on the homepage just below the hero banner (e.g. &quot;15+ Years of Trust&quot;).
              </Typography>
              <Grid container spacing={2}>
                {stats.map((stat, i) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={i}>
                    <Box sx={{ display: 'flex', gap: 1.5, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <TextField
                        label="Value"
                        placeholder="e.g. 15+"
                        value={stat.val}
                        onChange={(e) => setStats((s) => s.map((row, idx) => (idx === i ? { ...row, val: e.target.value } : row)))}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Label"
                        placeholder="e.g. Years of Trust"
                        value={stat.label}
                        onChange={(e) => setStats((s) => s.map((row, idx) => (idx === i ? { ...row, label: e.target.value } : row)))}
                        sx={{ flex: 2 }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{ mt: 2.5 }}
                onClick={handleSaveStats}
                disabled={saveMutation.isPending}
              >
                Save Stats
              </Button>
            </Box>
          )}
          {!isLoading && tab !== 'homepage' && (
            <Grid container spacing={2.5}>
              {fieldsForGroup(tab).map((field) => (
                <Grid size={12} key={field.key}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <TextField
                      label={field.label}
                      fullWidth
                      multiline={field.multiline}
                      minRows={field.multiline ? 2 : 1}
                      value={values[field.key]?.value ?? ''}
                      onChange={(e) => handleChange(field.key, e.target.value, tab)}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<SaveIcon />}
                      sx={{ mt: 0.5, flexShrink: 0 }}
                      onClick={() => handleSaveField(field.key)}
                      disabled={saveMutation.isPending}
                    >
                      Save
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
