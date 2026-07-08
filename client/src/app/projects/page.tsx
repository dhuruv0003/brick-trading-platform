'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Container, Typography, Box, Grid2 as Grid, Card, CardContent, CardMedia, Chip, Button,
  CircularProgress, useTheme, MenuItem, TextField,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { projectsAPI } from '../../services/api';

const CATEGORIES = [
  { value: 'all', label: 'All Projects' },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'government', label: 'Government' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'industrial', label: 'Industrial' },
];

export default function ProjectsPage() {
  const theme = useTheme();
  const [projects, setProjects] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 24 };
      if (category !== 'all') params.category = category;
      const res = await projectsAPI.getAll(params);
      setProjects(res.data.data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: 'text.primary', color: '#fff', py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2.2rem', md: '3rem' } }}>
            Our Projects
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400, maxWidth: 640 }}>
            A track record of reliable, on-time brick supply for homes, commercial builds, and government
            infrastructure across the city.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 5, flexWrap: 'wrap' }}>
          {CATEGORIES.map((c) => (
            <Chip
              key={c.value}
              label={c.label}
              clickable
              onClick={() => setCategory(c.value)}
              color={category === c.value ? 'primary' : 'default'}
              variant={category === c.value ? 'filled' : 'outlined'}
            />
          ))}
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && projects.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" color="text.secondary">
              No projects found in this category yet.
            </Typography>
          </Box>
        )}

        {!loading && projects.length > 0 && (
          <Grid container spacing={4}>
            {projects.map((project: any) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project._id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'box-shadow 0.2s ease',
                    '&:hover': { boxShadow: theme.shadows[3] },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={project.images?.[0]?.url || 'https://images.unsplash.com/photo-1541976590-713941681591?w=600'}
                    alt={project.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Chip
                      label={project.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ alignSelf: 'flex-start', mb: 1.5, textTransform: 'capitalize' }}
                    />
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                      {project.title}
                    </Typography>
                    {(project.location?.city || project.location?.state) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5, color: 'text.secondary' }}>
                        <LocationOnIcon fontSize="small" />
                        <Typography variant="body2">
                          {[project.location?.city, project.location?.state].filter(Boolean).join(', ')}
                        </Typography>
                      </Box>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                      {project.shortDescription || project.description?.slice(0, 120)}
                    </Typography>
                    <Button component={Link} href={`/projects/${project.slug}`} size="small" sx={{ alignSelf: 'flex-start' }}>
                      View Project
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
