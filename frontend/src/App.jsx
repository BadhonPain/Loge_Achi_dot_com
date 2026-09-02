import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import BecomeVendor from './pages/BecomeVendor';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProductDetails from './pages/ProductDetails';
import CategoryPage from './pages/CategoryPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/seller" element={<BecomeVendor />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/categories" element={<CategoryPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
