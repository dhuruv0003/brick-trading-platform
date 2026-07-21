'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Divider,
  Paper,
  useTheme,
  CardMedia,
} from '@mui/material';
import { PageLoader } from '../../../components/common/Loaders';
import { ErrorState } from '../../../components/common/ErrorState';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { blogAPI } from '../../../services/api';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const theme = useTheme();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPostDetail();
    }
  }, [slug]);

  const fetchPostDetail = async () => {
    setLoading(true);
    try {
      const res = await blogAPI.getOne(slug as string);
      setPost(res.data.data.post);
    } catch (err) {
      console.error('Error fetching blog post:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!post) {
    return <ErrorState title="Article not found" backHref="/blog" backLabel="Back to Blog" />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/blog')}
        sx={{ mb: 4, color: theme.palette.text.secondary }}
      >
        Back to Knowledge Hub
      </Button>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
          {post.title}
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, mb: 3, color: theme.palette.text.secondary }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayIcon sx={{ fontSize: '0.9rem' }} />
            <Typography variant="body2">
              {new Date(post.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PersonOutlineIcon sx={{ fontSize: '0.9rem' }} />
            <Typography variant="body2">{post.author?.name || 'Admin'}</Typography>
          </Box>
        </Box>

        <Box
          sx={{
            width: '100%',
            height: { xs: 250, sm: 450 },
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
            border: '1px solid #e7e5e4',
            mb: 5,
          }}
        >
          <CardMedia
            component="img"
            image={post.coverImage || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=800'}
            alt={post.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
      </Box>

      <Grid container spacing={6}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Typography
            component="div"
            variant="body1"
            sx={{
              lineHeight: 1.8,
              color: theme.palette.text.primary,
              '& p': { mb: 3 },
              '& h2': { mt: 4, mb: 2, fontWeight: 700, fontFamily: 'serif' },
              '& h3': { mt: 3, mb: 2, fontWeight: 700 },
              '& ul': { mb: 3, pl: 3 },
              '& li': { mb: 1 },
              '& img': { maxWidth: '100%', borderRadius: 2 },
            }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 4, border: '1px solid #e7e5e4', borderRadius: 4, bgcolor: '#fafaf9' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Category
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, fontWeight: 600 }}>
              {post.category}
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Need Professional Advice?
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.6 }}>
              Browse our full catalog for pricing, specs, and delivery details on every brick type.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => router.push('/products')}
            >
              Browse Products
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
