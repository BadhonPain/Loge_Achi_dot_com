import React from 'react';
import Navbar from '../components/layout/Navbar';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {}
        <div className="w-full h-64 md:h-96 bg-gray-200 rounded-lg flex items-center justify-center mb-8">
          <p className="text-gray-500 font-medium text-lg">Hero Carousel Section</p>
        </div>
        
        {}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white p-4 rounded-lg shadow-sm h-64 flex items-center justify-center border border-gray-100">
              <p className="text-gray-400 text-sm">Product {item}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
