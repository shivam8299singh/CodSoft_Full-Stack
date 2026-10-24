import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      if (res.data?.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId) => {
    if (!user) {
      throw new Error('Please log in to manage your wishlist.');
    }
    const res = await api.post('/wishlist', { productId });
    if (res.data?.success) {
      await fetchWishlist();
      return res.data;
    }
  };

  const removeFromWishlist = async (id) => {
    const res = await api.delete(`/wishlist/${id}`);
    if (res.data?.success) {
      await fetchWishlist();
    }
  };

  const moveToCart = async (productId) => {
    const res = await api.post('/wishlist/move-to-cart', { productId });
    if (res.data?.success) {
      await Promise.all([fetchWishlist(), refreshCart()]);
      return res.data;
    }
  };

  const isInWishlist = (productId) => {
    return items.some((it) => it.productId === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        toggleWishlist,
        removeFromWishlist,
        moveToCart,
        isInWishlist,
        wishlistCount: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
