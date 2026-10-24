import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  ShieldCheck,
  Building,
  Store,
  Wallet
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import Button from '../components/Button';
import Input from '../components/Input';

export const CheckoutPage = () => {
  const { cart, appliedPromo } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560001',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState('CARD'); // COD, CARD, ONLINE
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4242 •••• •••• 4242',
    cardHolder: user?.name || 'Priya Patel',
    expiry: '12/28',
    cvv: '123',
  });
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Prepopulate saved addresses if available
  useEffect(() => {
    const loadDefaultAddress = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data?.success && res.data.user.addresses?.length > 0) {
          const def = res.data.user.addresses.find((a) => a.isDefault) || res.data.user.addresses[0];
          setAddress({
            fullName: def.fullName || user?.name || '',
            phone: def.phone || user?.phone || '',
            address: def.address || '',
            city: def.city || 'Bengaluru',
            state: def.state || 'Karnataka',
            postalCode: def.postalCode || '560001',
            country: def.country || 'India',
          });
        }
      } catch (err) {
        console.warn(err);
      }
    };
    if (user) loadDefaultAddress();
  }, [user]);

  const handleAutofillTestAddress = () => {
    setAddress({
      fullName: user?.name || 'Priya Patel',
      phone: '+91 98765 43210',
      address: 'Flat 402, Sunshine Residency, 12th Main Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
    });
    addToast('Autofilled demo shipping address!');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.fullName || !address.address || !address.city || !address.postalCode) {
      addToast('Please complete all required shipping fields.', 'error');
      return;
    }

    try {
      setPlacingOrder(true);
      const res = await api.post('/orders', {
        shippingAddress: address,
        paymentMethod,
        promoCode: appliedPromo?.code,
      });

      if (res.data?.success) {
        const order = res.data.data;
        addToast('Order placed successfully! Redirecting to confirmation...');
        navigate(`/orders/${order.id}/confirmation`);
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Checkout</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete your multi-vendor order with certified buyer protection
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Shipping & Payment */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">1. Shipping Address</h3>
                  <p className="text-xs text-slate-400">Where should your package be delivered?</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAutofillTestAddress}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg"
              >
                Autofill Test Address
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={address.fullName}
                onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                required
              />
              <div className="sm:col-span-2">
                <Input
                  label="Street Address / Flat / Building"
                  value={address.address}
                  onChange={(e) => setAddress({ ...address, address: e.target.value })}
                  placeholder="e.g. 101 Orchid Towers, MG Road"
                  required
                />
              </div>
              <Input
                label="City"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                required
              />
              <Input
                label="State"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                required
              />
              <Input
                label="Postal Code / PIN"
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                required
              />
              <Input
                label="Country"
                value={address.country}
                onChange={(e) => setAddress({ ...address, country: e.target.value })}
                disabled
              />
            </div>
          </div>

          {/* 2. Payment Method */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">2. Payment Method (Sandbox / Test Mode)</h3>
                <p className="text-xs text-slate-400">Never use real credit card or banking credentials</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Card */}
              <label
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-indigo-600 bg-indigo-50/40 text-slate-900'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold block text-slate-900">Credit / Debit Card</span>
                  <span className="text-[11px] text-slate-400">Sandbox Instant Approval</span>
                </div>
              </label>

              {/* Online / UPI */}
              <label
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                  paymentMethod === 'ONLINE'
                    ? 'border-indigo-600 bg-indigo-50/40 text-slate-900'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={paymentMethod === 'ONLINE'}
                    onChange={() => setPaymentMethod('ONLINE')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold block text-slate-900">UPI / NetBanking</span>
                  <span className="text-[11px] text-slate-400">Simulated Gateway</span>
                </div>
              </label>

              {/* COD */}
              <label
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-indigo-600 bg-indigo-50/40 text-slate-900'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Truck className="w-5 h-5 text-amber-600" />
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold block text-slate-900">Cash on Delivery</span>
                  <span className="text-[11px] text-slate-400">Pay upon Handover</span>
                </div>
              </label>
            </div>

            {/* Sandbox Card Input Box */}
            {paymentMethod === 'CARD' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Sandbox Test Card Details</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Auto-Filled Test Mode
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <input
                    type="text"
                    value={cardDetails.cardNumber}
                    readOnly
                    className="col-span-2 p-2.5 rounded-xl border border-slate-200 bg-white font-mono text-slate-700 text-xs"
                  />
                  <input
                    type="text"
                    value={cardDetails.expiry}
                    readOnly
                    className="p-2.5 rounded-xl border border-slate-200 bg-white font-mono text-slate-700 text-xs"
                  />
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    readOnly
                    className="p-2.5 rounded-xl border border-slate-200 bg-white font-mono text-slate-700 text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Order Breakdown & Confirm Button */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Order Items Review</h3>

            {/* Multi-Vendor grouped mini summary */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {cart.vendorGroups?.map((group) => (
                <div key={group.vendorId} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-700 mb-2">
                    <Store className="w-3.5 h-3.5" />
                    <span>{group.businessName}</span>
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-slate-600">
                        <span className="truncate max-w-[170px]">{item.product.name} (x{item.quantity})</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(item.itemTotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">{formatCurrency(cart.summary.subtotal)}</span>
              </div>
              {cart.summary.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Savings & Coupons</span>
                  <span>-{formatCurrency(cart.summary.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Tax (5%)</span>
                <span className="font-semibold text-slate-800">{formatCurrency(cart.summary.tax)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-slate-800">
                  {cart.summary.shippingFee === 0 ? 'FREE' : formatCurrency(cart.summary.shippingFee)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between text-slate-900 text-base font-black">
                <span>Total Due</span>
                <span className="text-indigo-600">{formatCurrency(cart.summary.grandTotal)}</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={placingOrder}
              className="w-full mt-4"
            >
              Place Multi-Vendor Order
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
