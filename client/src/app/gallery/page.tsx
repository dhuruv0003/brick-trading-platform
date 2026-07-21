'use client';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  Tabs,
  Tab,
  Dialog,
  IconButton,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { galleryAPI } from '../../services/api';
import { SectionLoader } from '../../components/common/Loaders';
import { ErrorState } from '../../components/common/ErrorState';

export default function GalleryPage() {
  const theme = useTheme();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    fetchGallery();
  }, [category]);

  const fetchGallery = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {};
      if (category !== 'all') params.category = category;
      const res = await galleryAPI.getAll(params);
      const payload = res.data?.data;
      const items = Array.isArray(payload) ? payload : payload?.items;
      setImages(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setError('Failed to load gallery images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
          Product & Site Gallery
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxW: 600, mx: 'auto' }}>
          Visual showcasing of kiln baking, loading procedures, transport logistics, and completed site masonry.
        </Typography>
      </Box>

      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 5 }}>
        <Tabs
          value={category}
          onChange={(e, val) => setCategory(val)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab value="all" label="All Images" />
          <Tab value="products" label="Products" />
          <Tab value="factory" label="Kiln & Production" />
          <Tab value="transport" label="Logistics & Delivery" />
          <Tab value="projects" label="Active Projects" />
        </Tabs>
      </Box>

      {/* Gallery Grid */}
      {loading ? (
        <SectionLoader minHeight={320} />
      ) : error ? (
        <ErrorState message={error} minHeight={320} />
      ) : images.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary }}>
            No images found in this category.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {images.map((img, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={img._id || i}>
              <Card
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  borderRadius: 3,
                  '&:hover img': { transform: 'scale(1.08)' },
                }}
                onClick={() => setActiveImage(img.url)}
              >
                <CardMedia
                  component="img"
                  image={img.url}
                  alt={img.altText || img.title || 'Gallery image'}
                  sx={{
                    height: 250,
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                  }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Lightbox Dialog */}
      <Dialog
        open={!!activeImage}
        onClose={() => setActiveImage(null)}
        maxWidth="lg"
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden',
            position: 'relative',
          },
        }}
      >
        <IconButton
          onClick={() => setActiveImage(null)}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: '#fff',
            backgroundColor: 'rgba(0,0,0,0.5)',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
          }}
        >
          <CloseIcon />
        </IconButton>
        {activeImage && (
          <Box
            component="img"
            src={activeImage}
            alt="Enlarged view"
            sx={{
              width: '100%',
              maxHeight: '85vh',
              objectFit: 'contain',
              borderRadius: 2,
            }}
          />
        )}
      </Dialog>
    </Container>
  );
}
