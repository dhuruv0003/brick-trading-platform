'use client';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Tabs,
  Tab,
  CircularProgress,
  Button,
  useTheme,
  InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { faqsAPI } from '../../services/api';
import Link from 'next/link';

export default function FAQPage() {
  const theme = useTheme();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchFAQs();
  }, [category]);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (category !== 'all') params.category = category;
      if (search) params.search = search;

      const res = await faqsAPI.getAll(params);
      const payload = res.data.data;
      const faqList = Array.isArray(payload) ? payload : (payload?.faqs || []);
      setFaqs(faqList);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFAQs();
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
          Frequently Asked Questions
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxW: 600, mx: 'auto' }}>
          Find fast answers regarding brick types, transport limits, delivery schedules, and wholesale policies.
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <form onSubmit={handleSearchSubmit}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for answers e.g. delivery time, wholesale pricing..."
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
        </form>
      </Box>

      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 5 }}>
        <Tabs
          value={category}
          onChange={(e, val) => setCategory(val)}
          textColor="primary"
          indicatorColor="primary"
          centered
        >
          <Tab value="all" label="All FAQs" />
          <Tab value="General" label="General" />
          <Tab value="Products" label="Quality & Products" />
          <Tab value="Logistics" label="Logistics & Delivery" />
          <Tab value="Billing" label="Pricing & Billing" />
        </Tabs>
      </Box>

      {/* FAQs List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : !Array.isArray(faqs) || faqs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
            No FAQs found matching your criteria.
          </Typography>
          <Button component={Link} href="/contact" variant="outlined" startIcon={<HelpOutlineIcon />}>
              Ask Our Experts
            </Button>
        </Box>
      ) : (
        <Box sx={{ mb: 8 }}>
          {faqs.map((faq, i) => (
            <Accordion key={faq._id || i} sx={{ mb: 2, border: '1px solid #e7e5e4', boxShadow: 'none', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ borderTop: '1px solid #e7e5e4', bgcolor: '#fdf8f3' }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.8 }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* CTA Box */}
      <Box sx={{ p: 5, border: '1px solid #e7e5e4', borderRadius: 4, textAlign: 'center', bgcolor: '#fafaf9' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
          Still Have Questions?
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
          Our custom CRM and support staff are here to assist with technical specifications or site constraints.
        </Typography>
        <Button component={Link} href="/contact" variant="contained">Get in Touch</Button>
      </Box>
    </Container>
  );
}
