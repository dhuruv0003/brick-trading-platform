'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Container, Typography, Box, Grid2 as Grid, Chip, Button, Paper, Stack, Divider,
} from '@mui/material';
import { PageLoader } from '../../../components/common/Loaders';
import { ErrorState } from '../../../components/common/ErrorState';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EngineeringIcon from '@mui/icons-material/Engineering';
import { projectsAPI } from '../../../services/api';

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      try {
        const res = await projectsAPI.getOne(slug);
        setProject(res.data.data.project);
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return <PageLoader />;
  }

  if (notFound || !project) {
    return <ErrorState title="Project not found" backHref="/projects" backLabel="Back to Projects" />;
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box
        sx={{
          height: { xs: 260, md: 400 },
          backgroundImage: `url(${project.images?.[0]?.url || 'https://images.unsplash.com/photo-1541976590-713941681591?w=1200'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(28,25,23,0.55)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pb: 4 }}>
          <Chip label={project.category} color="primary" size="small" sx={{ alignSelf: 'flex-start', mb: 2, textTransform: 'capitalize' }} />
          <Typography variant="h3" sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.8rem' } }}>
            {project.title}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {project.description}
            </Typography>

            {project.highlights?.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Highlights
                </Typography>
                <Stack spacing={1}>
                  {project.highlights.map((h: string, i: number) => (
                    <Typography key={i} variant="body2" color="text.secondary">
                      • {h}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Project Details
              </Typography>
              <Stack spacing={2}>
                {(project.location?.city || project.location?.state) && (
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <LocationOnIcon fontSize="small" color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Location</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {[project.location?.city, project.location?.state].filter(Boolean).join(', ')}
                      </Typography>
                    </Box>
                  </Box>
                )}
                {project.completionDate && (
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <CalendarTodayIcon fontSize="small" color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Completed</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {new Date(project.completionDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                      </Typography>
                    </Box>
                  </Box>
                )}
                {project.bricksUsed?.quantity && (
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <EngineeringIcon fontSize="small" color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Bricks Used</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {project.bricksUsed.quantity.toLocaleString()} {project.bricksUsed.brickType || ''}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
              <Divider sx={{ my: 3 }} />
              <Button component={Link} href="/products" variant="contained" fullWidth>
                Start Your Project
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
