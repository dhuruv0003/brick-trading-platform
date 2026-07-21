'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { SectionLoader } from '../common/Loaders';
import {
  Box, Typography, Rating, Paper, Button, TextField, Avatar, Divider,
  Alert, Chip, LinearProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Pagination,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';
import { reviewsAPI } from '../../services/api';
import useCustomerAuth from '../../hooks/useCustomerAuth';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';

interface Props {
  productSlug: string;
  productId: string;
}

export default function ReviewsSection({ productSlug, productId }: Props) {
  const { isAuthenticated, customer } = useCustomerAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [reviews, setReviews] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ averageRating: 0, reviewCount: 0, distribution: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formRating, setFormRating] = useState<number | null>(5);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await reviewsAPI.getForProduct(productSlug, { page: p, limit: 5 });
      setReviews(res.data.data.reviews);
      setSummary(res.data.data.summary);
      setTotalPages(res.data.data.meta?.totalPages || 1);
      setPage(p);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [productSlug]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const myReview = reviews.find((r) => r.customer?._id === customer?._id || r.customer === customer?._id);

  const openForm = (review?: any) => {
    if (review) {
      setEditId(review._id);
      setFormRating(review.rating);
      setFormTitle(review.title || '');
      setFormComment(review.comment || '');
    } else {
      setEditId(null);
      setFormRating(5);
      setFormTitle('');
      setFormComment('');
    }
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!formRating) { enqueueSnackbar('Please select a rating.', { variant: 'warning' }); return; }
    setSubmitting(true);
    try {
      if (editId) {
        await reviewsAPI.update(editId, { rating: formRating, title: formTitle, comment: formComment });
        enqueueSnackbar('Review updated!', { variant: 'success' });
      } else {
        await reviewsAPI.create({ productId, rating: formRating, title: formTitle, comment: formComment });
        enqueueSnackbar('Review submitted!', { variant: 'success' });
      }
      setFormOpen(false);
      fetchReviews(1);
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to submit review.', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete your review?')) return;
    try {
      await reviewsAPI.delete(id);
      enqueueSnackbar('Review deleted.', { variant: 'success' });
      fetchReviews(1);
    } catch {
      enqueueSnackbar('Failed to delete review.', { variant: 'error' });
    }
  };

  const DIST_BARS = [5, 4, 3, 2, 1];

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" fontWeight={800} mb={3}>Customer Reviews</Typography>

      {/* ── Summary ─────────────────────────────────────────────────────── */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Overall rating */}
          <Box sx={{ textAlign: 'center', minWidth: 100 }}>
            <Typography variant="h2" fontWeight={800} color="primary.main">
              {summary.averageRating > 0 ? summary.averageRating.toFixed(1) : '—'}
            </Typography>
            <Rating value={summary.averageRating} precision={0.1} readOnly size="small" />
            <Typography variant="caption" color="text.secondary" display="block">
              {summary.reviewCount} {summary.reviewCount === 1 ? 'review' : 'reviews'}
            </Typography>
          </Box>

          {/* Distribution bars */}
          <Box sx={{ flex: 1, minWidth: 180 }}>
            {DIST_BARS.map((star) => {
              const count = summary.distribution[star] || 0;
              const pct = summary.reviewCount > 0 ? (count / summary.reviewCount) * 100 : 0;
              return (
                <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="caption" sx={{ minWidth: 14 }}>{star}</Typography>
                  <Rating value={1} max={1} readOnly size="small" sx={{ color: 'warning.main' }} />
                  <LinearProgress
                    variant="determinate" value={pct}
                    sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: 'warning.main' } }}
                  />
                  <Typography variant="caption" sx={{ minWidth: 20, textAlign: 'right' }}>{count}</Typography>
                </Box>
              );
            })}
          </Box>

          {/* CTA */}
          <Box>
            {isAuthenticated ? (
              myReview ? (
                <Chip label="You've reviewed this" color="success" size="small" />
              ) : (
                <Button variant="contained" onClick={() => openForm()}>Write a Review</Button>
              )
            ) : (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2">
                  <a href="/auth/login" style={{ color: 'inherit', fontWeight: 600 }}>Log in</a> to leave a review.
                </Typography>
              </Alert>
            )}
          </Box>
        </Box>
      </Paper>

      {/* ── Review list ─────────────────────────────────────────────────── */}
      {loading ? (
        <SectionLoader compact />
      ) : reviews.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No reviews yet. {isAuthenticated && !myReview && 'Be the first to review this product!'}
        </Alert>
      ) : (
        <>
          {reviews.map((review, i) => {
            const isOwn = review.customer?._id === customer?._id || review.customer === customer?._id;
            const name = review.customer?.firstName
              ? `${review.customer.firstName} ${review.customer.lastName || ''}`
              : 'Customer';
            const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

            return (
              <Box key={review._id}>
                {i > 0 && <Divider sx={{ my: 2 }} />}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>{initials}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{name}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Rating value={review.rating} readOnly size="small" />
                          {review.isVerifiedPurchase && (
                            <Chip
                              icon={<VerifiedIcon />} label="Verified Purchase" size="small"
                              color="success" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }}
                            />
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(review.createdAt).format('DD MMM YYYY')}
                        </Typography>
                        {isOwn && (
                          <>
                            <IconButton size="small" onClick={() => openForm(review)}><EditIcon fontSize="small" /></IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDelete(review._id)}><DeleteIcon fontSize="small" /></IconButton>
                          </>
                        )}
                      </Box>
                    </Box>
                    {review.title && (
                      <Typography variant="body1" fontWeight={600} mt={0.75}>{review.title}</Typography>
                    )}
                    {review.comment && (
                      <Typography variant="body2" color="text.secondary" mt={0.5}>{review.comment}</Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={totalPages} page={page} onChange={(_, p) => fetchReviews(p)} size="small" />
            </Box>
          )}
        </>
      )}

      {/* ── Write / Edit Review Dialog ───────────────────────────────────── */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Your Review' : 'Write a Review'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>Your Rating *</Typography>
            <Rating
              value={formRating}
              onChange={(_, val) => setFormRating(val)}
              size="large"
              sx={{ color: 'warning.main' }}
            />
          </Box>
          <TextField
            label="Title (optional)"
            fullWidth value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            inputProps={{ maxLength: 100 }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Your Review (optional)"
            fullWidth multiline rows={4}
            value={formComment}
            onChange={(e) => setFormComment(e.target.value)}
            inputProps={{ maxLength: 1000 }}
            helperText={`${formComment.length}/1000`}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setFormOpen(false)} disabled={submitting}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting || !formRating}>
            {submitting ? 'Submitting…' : (editId ? 'Update Review' : 'Submit Review')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
