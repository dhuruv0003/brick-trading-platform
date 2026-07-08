'use client';
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Paper,
  useTheme,
} from '@mui/material';
import Timeline from '@mui/icons-material/Timeline';
import ShieldIcon from '@mui/icons-material/Shield';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

export default function AboutPage() {
  const theme = useTheme();

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      {/* ─── Hero Header ────────────────────────────────────────────────── */}
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
          Our Story
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxW: 600, mx: 'auto' }}>
          Distributing strength and trust across construction projects since 2011.
        </Typography>
      </Box>

      {/* ─── Intro Grid ─────────────────────────────────────────────────── */}
      <Grid container spacing={8} sx={{ mb: 10 }} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
            Kiln-to-Site Logistics
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
            BrickPro was founded on a simple premise: construction developers need premium bricks without dealing with intermediary delays, inflated transportation tariffs, or inconsistent baking batches.
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
            By maintaining exclusive partnerships with premium automated brick kilns and building our own fleet of heavy-duty transport vehicles, we streamline the supply chain directly to your building site.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              width: '100%',
              height: 350,
              borderRadius: 4,
              backgroundImage: 'url(https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
            }}
          />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 10 }} />

      {/* ─── Mission / Vision ────────────────────────────────────────────── */}
      <Grid container spacing={4} sx={{ mb: 10 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: '100%', border: '1px solid #e7e5e4', borderRadius: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ShieldIcon color="primary" /> Our Mission
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.8 }}>
              To supply consistent, laboratory-tested bricks and concrete block materials at transparent wholesale prices, helping property developers construct durable foundations for residential and public infrastructure projects.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: '100%', border: '1px solid #e7e5e4', borderRadius: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <WorkspacePremiumIcon color="primary" /> Our Core Vision
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.8 }}>
              To lead the regional building supplies distribution sector by shifting kilns toward eco-efficient operations (Fly Ash blocks) and integrating digital logistics tracking to eliminate construction downtime.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ─── operational Timeline ────────────────────────────────────────── */}
      <Box sx={{ mb: 10 }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 6 }}>
          Operational Milestones
        </Typography>
        <Grid container spacing={4}>
          {[
            { year: '2011', title: 'Company Inception', desc: 'Started with 2 delivery trucks sourcing table mould bricks for local masons.' },
            { year: '2015', title: 'Fleet Expansion', desc: 'Purchased 15 tractor-trolleys and signed exclusive supply rights with three regional kiln sites.' },
            { year: '2019', title: 'Eco Transition', desc: 'Introduced standard Fly Ash bricks conforming to green construction specs.' },
            { year: '2024', title: 'Govt Contractor Empanelment', desc: 'Began official bulk supply empanelment for major public corporation building blocks.' },
          ].map((milestone, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper sx={{ p: 3, height: '100%', borderRadius: 3, borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 800, mb: 1 }}>
                  {milestone.year}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  {milestone.title}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
                  {milestone.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ─── Certifications ──────────────────────────────────────────────── */}
      <Box sx={{ p: 6, bgcolor: '#f5f5f4', borderRadius: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
          Certified Quality Guarantee
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, maxW: 550, mx: 'auto', mb: 4, lineHeight: 1.8 }}>
          Our brick supplies regularly undergo structural load testing and water absorption checks. All test reports conform strictly to IS:1077 (for red clay bricks) and IS:12894 (for fly ash block parameters).
        </Typography>
      </Box>
    </Container>
  );
}
