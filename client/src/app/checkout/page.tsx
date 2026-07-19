'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box, Typography, Paper, Grid, TextField, Button, Divider, Alert, CircularProgress, 
  Radio, RadioGroup, FormControlLabel, FormControl
} from '@mui/material';
import useCart from '../../hooks/useCart';
import useCustomerAuth from '../../hooks/useCustomerAuth';
import { customerAddressAPI, ordersAPI } from '../../services/api';
import CustomerGuard from '../../components/guards/CustomerGuard';

export default function CheckoutPage() {
  const router = useRouter();
  const { itemsList, total, clear } = useCart();
  const { customer } = useCustomerAuth();
  
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fallback for new address if none exist
  const [newAddress, setNewAddress] = useState({
    fullName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '',
  });
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  useEffect(() => {
    if (itemsList.length === 0) {
      router.push('/cart');
      return;
    }

    const fetchAddresses = async () => {
      try {
        const res = await customerAddressAPI.getAll();
        const addrs = res.data.data.addresses;
        setAddresses(addrs);
        const defaultAddr = addrs.find((a: any) => a.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr._id);
        else if (addrs.length > 0) setSelectedAddressId(addrs[0]._id);
        else setShowNewAddressForm(true);
      } catch (err) {
        console.error('Failed to fetch addresses', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAddresses();
  }, [itemsList, router]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    setError('');
    setSubmitting(true);

    // ── Stock validation ─────────────────────────────────────────────────
    const outOfStock = itemsList.filter((item) => !item.product.inStock);
    if (outOfStock.length > 0) {
      const names = outOfStock.map((i) => i.product.name).join(', ');
      setError(`The following items are out of stock and cannot be ordered: ${names}. Please remove them from your cart before proceeding.`);
      setSubmitting(false);
      return;
    }

    // Quantity-based check — only applies to products with a tracked
    // stockQuantity (> 0). Products without tracked quantity fall back to
    // the boolean inStock check above.
    const overStock = itemsList.filter(
      (item) => item.product.stockQuantity > 0 && item.quantity > item.product.stockQuantity
    );
    if (overStock.length > 0) {
      const details = overStock
        .map((i) => `${i.product.name} (only ${i.product.stockQuantity} left, ${i.quantity} requested)`)
        .join(', ');
      setError(`The following items exceed available stock: ${details}. Please reduce the quantity in your cart before proceeding.`);
      setSubmitting(false);
      return;
    }

    let finalAddressId = selectedAddressId;

    try {
      if (showNewAddressForm) {
        if (!newAddress.fullName || !newAddress.addressLine1 || !newAddress.city || !newAddress.pincode) {
          setError('Please fill out all required address fields.');
          setSubmitting(false);
          return;
        }
        const addrRes = await customerAddressAPI.create({ ...newAddress, label: 'New Address' });
        finalAddressId = addrRes.data.data.address._id;
      }

      if (!finalAddressId) {
        setError('Please select or add a shipping address.');
        setSubmitting(false);
        return;
      }

      const orderData = {
        items: itemsList.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.pricing?.retail || 0
        })),
        shippingAddressId: finalAddressId,
        paymentMethod: 'cod', // Hardcoded for now until payment gateway is integrated
      };

      const orderRes = await ordersAPI.create(orderData);
      clear();
      router.push(`/checkout/success?orderId=${orderRes.data.data.order._id}`);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order.');
      setSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <CustomerGuard>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" fontWeight={800} mb={4} fontFamily='"Playfair Display", serif'>
          Checkout
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 4 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Shipping Address</Typography>
              
              {addresses.length > 0 && !showNewAddressForm && (
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)}>
                    {addresses.map((addr) => (
                      <Paper key={addr._id} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, borderColor: selectedAddressId === addr._id ? 'primary.main' : 'divider' }}>
                        <FormControlLabel
                          value={addr._id}
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography fontWeight={600}>{addr.fullName}</Typography>
                              <Typography variant="body2" color="text.secondary">{addr.addressLine1}, {addr.city}</Typography>
                              <Typography variant="body2" color="text.secondary">{addr.state} – {addr.pincode}</Typography>
                              <Typography variant="body2" color="text.secondary">📞 {addr.phone}</Typography>
                            </Box>
                          }
                          sx={{ m: 0, width: '100%', alignItems: 'flex-start' }}
                        />
                      </Paper>
                    ))}
                  </RadioGroup>
                  <Button variant="text" onClick={() => setShowNewAddressForm(true)} sx={{ mt: 1, alignSelf: 'flex-start' }}>
                    + Add New Address
                  </Button>
                </FormControl>
              )}

              {showNewAddressForm && (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Full Name" name="fullName" fullWidth required value={newAddress.fullName} onChange={handleAddressChange} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Phone Number" name="phone" fullWidth required value={newAddress.phone} onChange={handleAddressChange} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Street / Area / Locality" name="addressLine1" fullWidth required value={newAddress.addressLine1} onChange={handleAddressChange} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="City" name="city" fullWidth required value={newAddress.city} onChange={handleAddressChange} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="State" name="state" fullWidth required value={newAddress.state} onChange={handleAddressChange} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Pincode" name="pincode" fullWidth required value={newAddress.pincode} onChange={handleAddressChange} />
                    </Grid>
                  </Grid>
                  {addresses.length > 0 && (
                    <Button variant="text" onClick={() => setShowNewAddressForm(false)} sx={{ mt: 2 }}>
                      Cancel
                    </Button>
                  )}
                </Box>
              )}
            </Paper>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Payment Method</Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: 'primary.main' }}>
                <FormControlLabel
                  value="cod"
                  control={<Radio checked />}
                  label="Cash on Delivery / Pay on Pickup"
                />
              </Paper>
              <Typography variant="body2" color="text.secondary" mt={2}>
                (Online payment integration will be available soon.)
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', position: 'sticky', top: 100 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Order Summary</Typography>
              
              <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 3, pr: 1 }}>
                {itemsList.map((item) => (
                  <Box key={item.product._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>
                        {item.product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Qty: {item.quantity}
                      </Typography>
                      {!item.product.inStock && (
                        <Typography variant="caption" color="error.main" fontWeight={600}>
                          ⚠ Out of stock — remove before ordering
                        </Typography>
                      )}
                      {item.product.inStock && item.product.stockQuantity > 0 && item.quantity > item.product.stockQuantity && (
                        <Typography variant="caption" color="error.main" fontWeight={600}>
                          ⚠ Only {item.product.stockQuantity} left — reduce quantity
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      ₹{((item.product.pricing?.retail || 0) * item.quantity).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography fontWeight={600}>₹{total.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary">Shipping</Typography>
                <Typography color="text.secondary">Free</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h6" fontWeight={700}>Total</Typography>
                <Typography variant="h6" fontWeight={700} color="primary">₹{total.toLocaleString()}</Typography>
              </Box>
              
              <Button 
                variant="contained" 
                size="large" 
                fullWidth 
                onClick={handlePlaceOrder}
                disabled={submitting}
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </CustomerGuard>
  );
}
