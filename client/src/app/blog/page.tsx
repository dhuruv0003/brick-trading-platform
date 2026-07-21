'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SectionLoader } from '../../components/common/Loaders';
import { ErrorState } from '../../components/common/ErrorState';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Chip,
  useTheme,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { blogAPI } from '../../services/api';

export default function BlogPage() {
  const theme = useTheme();
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [selectedCat]);

  const fetchCategories = async () => {
    try {
      const res = await blogAPI.getCategories();
      setCategories(res.data.data?.categories || []);
    } catch (err) {
      console.error('Error fetching blog categories:', err);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { status: 'published' };
      if (selectedCat !== 'all') params.category = selectedCat;
      if (search) params.search = search;

      const res = await blogAPI.getAll(params);
      setPosts(res.data.data || []);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('Failed to load articles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
          BrickPro Knowledge Hub
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxW: 600, mx: 'auto' }}>
          Educational resources, brick compliance reports, masonry guidelines, and material guides for developers.
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 5 }}>
        <form onSubmit={handleSearchSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search blog articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <Button type="submit" variant="contained">
                      Search
                    </Button>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { md: 'flex-end' } }}>
              <Chip
                label="All Topics"
                clickable
                color={selectedCat === 'all' ? 'primary' : 'default'}
                onClick={() => setSelectedCat('all')}
              />
              {categories.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  clickable
                  color={selectedCat === cat ? 'primary' : 'default'}
                  onClick={() => setSelectedCat(cat)}
                />
              ))}
            </Grid>
          </Grid>
        </form>
      </Box>

      {/* Articles Grid */}
      {loading ? (
        <SectionLoader minHeight={320} />
      ) : error ? (
        <ErrorState message={error} minHeight={320} />
      ) : posts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary }}>
            No blog articles found.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {posts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  image={post.coverImage || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400'}
                  alt={post.title}
                  sx={{ height: 200, objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 1.5, color: theme.palette.text.secondary }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarTodayIcon sx={{ fontSize: '0.9rem' }} />
                      <Typography variant="caption">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonOutlineIcon sx={{ fontSize: '0.9rem' }} />
                      <Typography variant="caption">{post.author?.name || 'Admin'}</Typography>
                    </Box>
                  </Box>
                  <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mb: 1.5,
                        cursor: 'pointer',
                        lineHeight: 1.4,
                        '&:hover': { color: theme.palette.primary.main },
                      }}
                    >
                      {post.title}
                    </Typography>
                  </Link>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2, flexGrow: 1, lineHeight: 1.6 }}>
                    {post.excerpt || post.content?.replace(/<[^>]*>/g, '').slice(0, 120) + '...'}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Chip label={post.category} size="small" color="primary" />
                    <Button component={Link} href={`/blog/${post.slug}`} size="small">Read Article</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
