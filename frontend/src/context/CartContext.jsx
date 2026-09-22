import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const API = 'http://localhost:5000/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user || user.role !== 'CUSTOMER') {
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${API}/cart/${user.id}`);
      const items = res.data.data || [];
      setCartItems(items);
      const count = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
      setCartCount(count);
      setCartTotal(Number(res.data.cart_total) || 0);
    } catch (err) {
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      return { success: false, requireAuth: true, message: 'Please sign in to add items to your cart' };
    }
    if (user.role !== 'CUSTOMER') {
      return { success: false, message: 'Only customer accounts can purchase items' };
    }

    try {
      const res = await axios.post(`${API}/cart/${user.id}/items`, {
        product_id: Number(productId),
        quantity: Number(quantity)
      });
      await fetchCart();
      return { success: true, message: res.data.message || 'Product added to cart' };
    } catch (err) {
      console.error('Add to Cart Error:', err.response?.data || err.message);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to add item to cart. Please try again.'
      };
    }
  };

  const updateQuantity = async (cartItemId, newQty) => {
    if (!user || newQty < 1) return;
    try {
      await axios.put(`${API}/cart/${user.id}/items/${cartItemId}`, { quantity: Number(newQty) });
      await fetchCart();
    } catch (err) {
      console.error('Update Cart Quantity Error:', err);
    }
  };

  const removeItem = async (cartItemId) => {
    if (!user) return;
    try {
      await axios.delete(`${API}/cart/${user.id}/items/${cartItemId}`);
      await fetchCart();
    } catch (err) {
      console.error('Remove Cart Item Error:', err);
    }
  };

  const clearCartState = () => {
    setCartItems([]);
    setCartCount(0);
    setCartTotal(0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      loading,
      fetchCart,
      addToCart,
      updateQuantity,
      removeItem,
      clearCartState
    }}>
      {children}
    </CartContext.Provider>
  );
};
