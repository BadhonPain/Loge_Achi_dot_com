import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Heart } from 'lucide-react';

const WishlistPage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">My Wishlist</h1>

        <div className="text-center py-20">
          <Heart size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save your favorite products here for later</p>
          <Link to="/" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors">
            Browse Products
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WishlistPage;
