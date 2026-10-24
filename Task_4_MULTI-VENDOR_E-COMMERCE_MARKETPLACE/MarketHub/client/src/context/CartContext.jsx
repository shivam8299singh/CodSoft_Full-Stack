import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    vendorGroups: [],
    summary: { itemCount: 0, subtotal: 0, discount: 0, tax: 0, shippingFee: 0, grandTotal: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);

  const fetchCart = async () => {
    if (!user) {
      setCart({
        items: [],
        vendorGroups: [],
        summary: { itemCount: 0, subtotal: 0, discount: 0, tax: 0, shippingFee: 0, grandTotal: 0 },
      });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data?.success) {
        setCart(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      throw new Error('Please log in to add products to your cart.');
    }
    const res = await api.post('/cart/items', { productId, quantity });
    if (res.data?.success) {
      await fetchCart();
      return res.data;
    }
    throw new Error(res.data?.message || 'Failed to add item to cart');
  };

  const updateQuantity = async (itemId, quantity) => {
    const res = await api.put(`/cart/items/${itemId}`, { quantity });
    if (res.data?.success) {
      await fetchCart();
    }
  };

  const removeFromCart = async (itemId) => {
    const res = await api.delete(`/cart/items/${itemId}`);
    if (res.data?.success) {
      await fetchCart();
    }
  };

  const clearCart = async () => {
    const res = await api.delete('/cart');
    if (res.data?.success) {
      setCart({
        items: [],
        vendorGroups: [],
        summary: { itemCount: 0, subtotal: 0, discount: 0, tax: 0, shippingFee: 0, grandTotal: 0 },
      });
      setAppliedPromo(null);
    }
  };

  const applyPromo = async (code) => {
    const res = await api.post('/promotions/validate', {
      code,
      cartTotal: cart.summary.subtotal,
    });
    if (res.data?.success) {
      setAppliedPromo(res.data.data);
      return res.data;
    }
    throw new Error(res.data?.message || 'Failed to apply coupon');
  };

  const removePromo = () => {
    setAppliedPromo(null);
  };

  // Compute final grand total considering promo discount
  const finalDiscount = (cart.summary.discount || 0) + (appliedPromo ? appliedPromo.discountAmount : 0);
  const finalGrandTotal = Math.max(
    0,
    +(cart.summary.subtotal - finalDiscount + (cart.summary.tax || 0) + (cart.summary.shippingFee || 0)).toFixed(2)
  );

  return (
    <CartContext.Provider
      value={{
        cart: {
          ...cart,
          summary: {
            ...cart.summary,
            discount: finalDiscount,
            grandTotal: finalGrandTotal,
          },
        },
        loading,
        appliedPromo,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyPromo,
        removePromo,
        refreshCart: fetchCart,
        cartCount: cart.summary?.itemCount || 0,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
