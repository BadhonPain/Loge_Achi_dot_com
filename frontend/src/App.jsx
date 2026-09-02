import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BecomeVendor from './pages/BecomeVendor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/seller" element={<BecomeVendor />} />
      </Routes>
    </Router>
  );
}

export default App;
