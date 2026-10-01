import { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { WishlistContext } from './WishlistStore';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const WishlistProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchWishlist = useCallback(async () => {
        if (!user || user.role !== 'CUSTOMER') {
            setItems([]);
            setError('');
            return { success: true, data: [] };
        }

        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API}/wishlist`);
            const data = response.data?.data || [];
            setItems(data);
            return { success: true, data };
        } catch (error) {
            const message = error.response?.data?.message || 'Could not load your wishlist';
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        const request = setTimeout(fetchWishlist, 0);
        return () => clearTimeout(request);
    }, [fetchWishlist]);

    const isInWishlist = useCallback((productId) => (
        items.some((item) => Number(item.product_id) === Number(productId))
    ), [items]);

    const addToWishlist = async (productId) => {
        if (!user || user.role !== 'CUSTOMER') {
            return { success: false, requireAuth: true, message: 'Sign in with a customer account to save products' };
        }
        if (isInWishlist(productId)) return { success: true, alreadySaved: true };

        try {
            await axios.post(`${API}/wishlist`, { product_id: Number(productId) });
            await fetchWishlist();
            return { success: true };
        } catch (error) {
            if (error.response?.status === 409) {
                await fetchWishlist();
                return { success: true, alreadySaved: true };
            }
            return { success: false, message: error.response?.data?.message || 'Could not save this product' };
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!user || user.role !== 'CUSTOMER') {
            return { success: false, message: 'Sign in with a customer account to manage your wishlist' };
        }

        try {
            await axios.delete(`${API}/wishlist/${productId}`);
            setItems((current) => current.filter((item) => Number(item.product_id) !== Number(productId)));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Could not remove this product' };
        }
    };

    const toggleWishlist = async (productId) => (
        isInWishlist(productId) ? removeFromWishlist(productId) : addToWishlist(productId)
    );

    return (
        <WishlistContext.Provider value={{ items, loading, error, fetchWishlist, isInWishlist, addToWishlist, removeFromWishlist, toggleWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};