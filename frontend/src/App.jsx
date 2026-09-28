import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './pages/HomePage';
import BecomeVendor from './pages/BecomeVendor';
import VendorApplicationStatus from './pages/VendorApplicationStatus';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProductDetails from './pages/ProductDetails';
import CategoryPage from './pages/CategoryPage';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';
import WhyLogeAchi from './pages/WhyLogeAchi';

const ROLE_HOME = {
  ADMIN: '/admin',
  SELLER: '/seller-dashboard',
  CUSTOMER: '/',
};

const RequireAuth = ({ roles, children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/login?role=${roles[0].toLowerCase()}`} state={{ from: location }} replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Router>
              <ToastContainer
                position="top-right"
                autoClose={2500}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
              />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/why-logeachi" element={<WhyLogeAchi />} />
                <Route path="/seller" element={<BecomeVendor />} />
                <Route path="/seller/application/:reference" element={<VendorApplicationStatus />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/categories" element={<CategoryPage />} />
                <Route path="/admin" element={<RequireAuth roles={['ADMIN']}><AdminDashboard /></RequireAuth>} />
                <Route path="/seller-dashboard" element={<RequireAuth roles={['SELLER']}><SellerDashboard /></RequireAuth>} />
                <Route path="/cart" element={<RequireAuth roles={['CUSTOMER']}><CartPage /></RequireAuth>} />
                <Route path="/checkout" element={<RequireAuth roles={['CUSTOMER']}><CheckoutPage /></RequireAuth>} />
                <Route path="/orders" element={<RequireAuth roles={['CUSTOMER']}><OrdersPage /></RequireAuth>} />
                <Route path="/wishlist" element={<RequireAuth roles={['CUSTOMER']}><WishlistPage /></RequireAuth>} />
              </Routes>
            </Router>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
