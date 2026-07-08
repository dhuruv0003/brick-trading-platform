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

const GROUPS = ['general', 'contact', 'social', 'seo', 'email'];

export default function AdminSettingsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('general');
  const [values, setValues] = useState<Record<string, any>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => (await settingsAPI.getAll()).data.data.settings,
  });

  useEffect(() => {
    if (data) {
      const map: Record<string, any> = {};
      data.forEach((s: any) => { map[s.key] = s; });
      setValues(map);
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
    saveMutation.mutate({ key: item.key, value: item.value, type: item.type || 'string', group: item.group, label: item.label, isPublic: item.isPublic });
  };

  const groupSettings = (group: string) => Object.values(values).filter((s: any) => s.group === group);

  // Well-known settings scaffolds so admin can add them even if not yet in DB
  const KNOWN_FIELDS: Record<string, { key: string; label: string; multiline?: boolean }[]> = {
    general: [
      { key: 'company_name', label: 'Company Name' },
      { key: 'company_tagline', label: 'Tagline' },
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
          {!isLoading && (
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
