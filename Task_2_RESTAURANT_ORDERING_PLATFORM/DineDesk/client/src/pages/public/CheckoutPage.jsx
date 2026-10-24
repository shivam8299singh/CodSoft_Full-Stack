import {
  ArrowLeft,
  Bike,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  User,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { orderService } from '../../services/orderService';
import { tableService } from '../../services/tableService';

const CheckoutPage = () => {
  const { cart, subtotal, tax, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState('DINE_IN');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delivery fee calculation: ₹40 for delivery, ₹0 for dine-in/takeaway
  const deliveryFee = orderType === 'DELIVERY' ? 40 : 0;
  const grandTotal = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customerName: user?.name || '',
      customerEmail: user?.email || '',
      customerPhone: user?.phone || '',
      deliveryAddress: '',
      instructions: '',
    },
  });

  // Fetch available tables if Dine-In
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const data = await tableService.getTables({ status: 'AVAILABLE' });
        setTables(data);
        if (data.length > 0) {
          setSelectedTableId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load tables:', err);
      }
    };
    if (orderType === 'DINE_IN') {
      fetchTables();
    }
  }, [orderType]);

  const handlePlaceOrder = async (formData) => {
    if (cart.length === 0) {
      toast.error('Your cart is empty. Please add dishes before placing an order.');
      return;
    }

    if (orderType === 'DELIVERY' && !formData.deliveryAddress?.trim()) {
      toast.error('Delivery address is required for home delivery orders.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        orderType,
        tableId: orderType === 'DINE_IN' ? selectedTableId : undefined,
        deliveryAddress: orderType === 'DELIVERY' ? formData.deliveryAddress : undefined,
        instructions: formData.instructions,
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        })),
        paymentMethod,
      };

      const createdOrder = await orderService.createOrder(orderPayload);
      clearCart();
      toast.success(`Order ${createdOrder.orderNumber} placed successfully!`);
      navigate(`/track/${createdOrder.orderNumber}`);
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold font-serif mb-2">No Items In Cart</h2>
        <p className="text-xs text-slate-500 mb-6">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link to="/menu">
          <Button>Explore Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/cart"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-amber-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Shopping Cart
      </Link>

      <div className="mb-8">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
          Complete Your Order
        </span>
        <h1 className="text-3xl font-bold font-serif text-slate-900 mt-1">
          Checkout & Payment
        </h1>
      </div>

      <form onSubmit={handleSubmit(handlePlaceOrder)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Order Options & Customer Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Dining Mode Selector */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                1. Select Dining Mode
              </h3>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'DINE_IN', label: 'Dine In', icon: UtensilsCrossed },
                  { id: 'TAKEAWAY', label: 'Takeaway', icon: ShoppingBag },
                  { id: 'DELIVERY', label: 'Delivery', icon: Bike },
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = orderType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setOrderType(type.id)}
                      className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-bold">{type.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Table assignment if Dine-In */}
              {orderType === 'DINE_IN' && (
                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Select Your Table
                  </label>
                  {tables.length === 0 ? (
                    <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                      All tables currently occupied or reserved. Our floor staff will seat you immediately on arrival!
                    </p>
                  ) : (
                    <select
                      value={selectedTableId}
                      onChange={(e) => setSelectedTableId(e.target.value)}
                      className="w-full bg-white rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    >
                      {tables.map((t) => (
                        <option key={t.id} value={t.id}>
                          Table #{t.tableNumber} — {t.location} ({t.capacity} Seats)
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            {/* 2. Customer Contact */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                2. Contact & Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="e.g. John Doe"
                  {...register('customerName', { required: 'Name is required' })}
                  error={errors.customerName?.message}
                />
                <Input
                  label="Phone Number"
                  placeholder="e.g. +91 98765 43210"
                  {...register('customerPhone', { required: 'Phone is required' })}
                  error={errors.customerPhone?.message}
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. john@example.com"
                {...register('customerEmail', { required: 'Email is required' })}
                error={errors.customerEmail?.message}
              />

              {orderType === 'DELIVERY' && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Delivery Address
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Apartment/Flat No, Street, Landmark, Pin Code..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    {...register('deliveryAddress', {
                      required: orderType === 'DELIVERY' ? 'Address is required for delivery' : false,
                    })}
                  />
                  {errors.deliveryAddress && (
                    <p className="text-xs text-rose-600">{errors.deliveryAddress.message}</p>
                  )}
                </div>
              )}

              <Input
                label="Kitchen or Delivery Notes (Optional)"
                placeholder="e.g. Extra cutlery, leave at reception, less spicy"
                {...register('instructions')}
              />
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  3. Payment Method
                </h3>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Test Sandbox Simulation
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'ONLINE', label: 'Online / UPI', icon: QrCode, desc: 'Instant UPI / NetBanking' },
                  { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Master, RuPay' },
                  { id: 'CASH', label: 'Cash On Service', icon: Wallet, desc: 'Pay at Counter / Table' },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition ${
                        isSelected
                          ? 'bg-amber-50/70 border-amber-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-600' : 'text-slate-500'}`} />
                        <h4 className="text-xs font-bold text-slate-900">{m.label}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400">{m.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Simulated Card / UPI notice */}
              {paymentMethod !== 'CASH' && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-xs text-slate-600 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Simulated Test Payment:</strong> A sandbox payment transaction reference will automatically be created and marked as PAID upon order submission. No real card will be charged.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout Trigger */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6 sticky top-28">
            <h3 className="text-base font-bold font-serif text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-sans font-bold text-slate-400">
                {cart.length} unique items
              </span>
            </h3>

            {/* Items mini list */}
            <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="font-bold text-slate-900">{item.quantity}x</span>
                    <span className="text-slate-700 truncate">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 font-sans shrink-0">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 text-xs text-slate-600 pt-4 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-800">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & GST (5%)</span>
                <span className="font-bold text-slate-800">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge ({orderType})</span>
                <span className="font-bold text-slate-800">
                  {deliveryFee > 0 ? `₹${deliveryFee.toFixed(2)}` : 'FREE'}
                </span>
              </div>
              <div className="flex justify-between text-lg font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                <span>Grand Total</span>
                <span className="text-amber-600 font-sans">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              className="w-full py-4 text-sm shadow-xl shadow-amber-600/30"
            >
              Place Order • ₹{grandTotal.toFixed(2)}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
