'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import { useSelector, useDispatch } from 'react-redux';
import { cartItemsList, clearCart, updateQuantity, removeItem } from '../../store/cartSlice';
import { quotesAPI, getApiErrorMessage } from '../../services/api';
import { useSnackbar } from 'notistack';

const STEPS = ['Select Items & Quantities', 'Project Location & Details', 'Submit Contact Info'];

/**
 * Computes a single cart item's line total, honoring whether the product's
 * price is quoted "per piece" or "per 1000" units — using the wrong
 * multiplier for a "per piece" product previously produced totals that were
 * 1000x too small (e.g. ₹28 instead of ₹28,000 for 1000 pieces @ ₹28/pc).
 */
function computeLineTotal(item: any): number {
  const unitPrice = item.product?.pricing?.retail || 0;
  const isPerThousand = (item.product?.pricing?.unit || '').toLowerCase().includes('1000');
  const multiplier = isPerThousand ? item.quantity / 1000 : item.quantity;
  return unitPrice * multiplier;
}

function formatInr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export default function QuoteRequestPage() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const cartItems = useSelector(cartItemsList);
  const [activeStep, setActiveStep] = useState(0);

  // Form State
  const [locationDetails, setLocationDetails] = useState({
    projectLocation: '',
    projectType: 'residential',
    notes: '',
  });
  const [contactDetails, setContactDetails] = useState({
    name: '',
    phone: '',
    email: '',
    customerType: 'homeowner',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleNext = () => {
    if (activeStep === 0 && cartItems.length === 0) {
      enqueueSnackbar('Please add at least one item to your quote request.', { variant: 'warning' });
      return;
    }
    if (activeStep === 1 && !locationDetails.projectLocation) {
      enqueueSnackbar('Please provide the project delivery location.', { variant: 'warning' });
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationDetails({ ...locationDetails, [e.target.name]: e.target.value });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactDetails({ ...contactDetails, [e.target.name]: e.target.value });
  };

  const handleSubmitQuote = async () => {
    if (!contactDetails.name || !contactDetails.phone) {
      enqueueSnackbar('Name and Phone Number are required.', { variant: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      // Price is per-piece for some products (e.g. "₹28 / per piece") and
      // per-1000-units for others (e.g. "₹6,500 / per 1000 bricks") — the
      // multiplier MUST match pricing.unit, or a per-piece product's total
      // silently comes out 1000x too small (e.g. 1000 pcs @ ₹28/piece was
      // computing ₹28 instead of ₹28,000).
      const itemsWithTotals = cartItems.map((item: any) => ({
        product: item.product._id,
        productName: item.product.name,
        quantity: item.quantity,
        unit: item.product.pricing?.unit || 'pieces',
        priceType: 'retail', // default
        unitPrice: item.product.pricing?.retail || 0,
        totalPrice: computeLineTotal(item),
      }));

      const grandTotal = itemsWithTotals.reduce((sum, item) => sum + item.totalPrice, 0);

      const payload = {
        name: contactDetails.name,
        phone: contactDetails.phone,
        email: contactDetails.email,
        customerType: contactDetails.customerType,
        projectLocation: locationDetails.projectLocation,
        projectType: locationDetails.projectType,
        notes: locationDetails.notes,
        items: itemsWithTotals,
        subtotal: grandTotal,
        totalEstimate: grandTotal,
      };

      const res = await quotesAPI.submit(payload);
      // The quote object is nested at data.data.quote (not data.data
      // directly) — reading quoteNumber one level too shallow is what
      // produced the "#undefined" toast.
      const quoteNumber = res.data?.data?.quote?.quoteNumber;
      enqueueSnackbar(
        quoteNumber ? `Quote request #${quoteNumber} submitted successfully!` : 'Quote request submitted successfully!',
        { variant: 'success' },
      );
      dispatch(clearCart());
      router.push('/products');
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err, 'Failed to submit quote request.'), { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h2" align="center" sx={{ fontWeight: 800, mb: 2 }}>
        Request a Bulk Quote
      </Typography>
      <Typography variant="body1" align="center" sx={{ color: theme.palette.text.secondary, mb: 6 }}>
        Complete the steps below and our sales architect will build a customized proposal for your delivery area.
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 4, border: '1px solid #e7e5e4', borderRadius: 4 }}>
        {/* STEP 1: SELECT ITEMS */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Selected Brick Materials
            </Typography>

            {cartItems.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                  Your quote list is currently empty.
                </Typography>
                <Button variant="contained" onClick={() => router.push('/products')}>
                  Browse Product Catalog
                </Button>
              </Box>
            ) : (
              <List disablePadding>
                {cartItems.map((item: any) => {
                  const isPerThousand = (item.product.pricing?.unit || '').toLowerCase().includes('1000');
                  const step = isPerThousand ? 1000 : 1;
                  const lineTotal = computeLineTotal(item);

                  return (
                    <Card key={item.product._id} variant="outlined" sx={{ mb: 2, borderRadius: 2, '&:hover': { transform: 'none' } }}>
                      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '16px !important', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {item.product.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                            Type: {item.product.specs?.type || 'Standard'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            ₹{(item.product.pricing?.retail || 0).toLocaleString('en-IN')} / {item.product.pricing?.unit || 'unit'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <TextField
                            type="number"
                            label="Quantity"
                            value={item.quantity}
                            onChange={(e) => dispatch(updateQuantity({ id: item.product._id, quantity: parseInt(e.target.value) || 0 }))}
                            sx={{ width: 120 }}
                            InputProps={{ inputProps: { min: step, step } }}
                          />
                          <Box sx={{ textAlign: 'right', minWidth: 90 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                              {formatInr(lineTotal)}
                            </Typography>
                          </Box>
                          <IconButton color="error" onClick={() => dispatch(removeItem(item.product._id))}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: 1.5 }}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                    Estimated Total:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {formatInr(cartItems.reduce((sum: number, item: any) => sum + computeLineTotal(item), 0))}
                  </Typography>
                </Box>
              </List>
            )}
          </Box>
        )}

        {/* STEP 2: PROJECT LOCATION */}
        {activeStep === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Project Siting & Logistics
            </Typography>
            <TextField
              name="projectLocation"
              label="Delivery Address / Site Location *"
              placeholder="e.g. 45 Park Avenue, Sector 5, Industrial Town"
              fullWidth
              value={locationDetails.projectLocation}
              onChange={handleLocationChange}
            />
            <TextField
              name="projectType"
              label="Project Nature"
              select
              fullWidth
              value={locationDetails.projectType}
              onChange={handleLocationChange}
            >
              <MenuItem value="residential">Residential Home</MenuItem>
              <MenuItem value="commercial">Commercial Tower</MenuItem>
              <MenuItem value="government">Government PWD Work</MenuItem>
              <MenuItem value="infrastructure">Infrastructure / Bridge / Road</MenuItem>
              <MenuItem value="retail">Individual Retail/Interior</MenuItem>
            </TextField>
            <TextField
              name="notes"
              label="Special Delivery Instructions / Specs"
              placeholder="e.g. Requires narrow tractor access, specific offloading spot, urgent delivery needed..."
              multiline
              rows={4}
              fullWidth
              value={locationDetails.notes}
              onChange={handleLocationChange}
            />
          </Box>
        )}

        {/* STEP 3: CONTACT INFO */}
        {activeStep === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Contact & Business Profile
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="Contact Name *"
                  fullWidth
                  value={contactDetails.name}
                  onChange={handleContactChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="phone"
                  label="Phone Number *"
                  fullWidth
                  value={contactDetails.phone}
                  onChange={handleContactChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="email"
                  label="Email Address"
                  fullWidth
                  value={contactDetails.email}
                  onChange={handleContactChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="customerType"
                  label="Professional Class"
                  select
                  fullWidth
                  value={contactDetails.customerType}
                  onChange={handleContactChange}
                >
                  <MenuItem value="homeowner">Homeowner</MenuItem>
                  <MenuItem value="builder">Property Developer</MenuItem>
                  <MenuItem value="contractor">Civil Contractor</MenuItem>
                  <MenuItem value="mason">Mason / Bricklayer</MenuItem>
                  <MenuItem value="dealer">Hardware Store / Trader</MenuItem>
                  <MenuItem value="govt_contractor">Govt Contractor</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Summary
            </Typography>
            <Box sx={{ bgcolor: '#fdf8f3', p: 3, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}><strong>Total unique items:</strong> {cartItems.length}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}><strong>Delivery destination:</strong> {locationDetails.projectLocation}</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                Estimated Total: {formatInr(cartItems.reduce((sum: number, item: any) => sum + computeLineTotal(item), 0))}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Final pricing will be confirmed by our team based on delivery location and current stock.
              </Typography>
            </Box>
          </Box>
        )}

        {/* NAVIGATION BUTTONS */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Back
          </Button>

          {activeStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
              variant="contained"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmitQuote}
              endIcon={<SendIcon />}
              variant="contained"
              color="success"
              disabled={submitting}
            >
              {submitting ? 'Submitting Proposal...' : 'Submit Quote Request'}
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
