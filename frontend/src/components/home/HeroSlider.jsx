import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop',
    tag: 'NEW ARRIVALS',
    title: 'Autumn Fashion Collection',
    subtitle: 'Discover the most trending clothes and accessories of this season.',
    cta: 'Explore Collection'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1618166080964-cdb5843979b0?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    tag: 'TECH WEEK',
    title: 'Next-Gen Electronics',
    subtitle: 'Upgrade your workspace with premium gadgets up to 40% off.',
    cta: 'Shop Tech'
  }
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-2xl overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-gray-900">
      
      {slides.map((slide, index) => (
        <div 
          key={slide.id} 
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <img 
            src={slide.image} 
            alt={slide.title} 
            className="w-full h-full object-cover opacity-80 mix-blend-overlay transform scale-105 group-hover:scale-100 transition-transform duration-[10s]"
          />
          
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/50 to-transparent"></div>
          
          <div className="absolute inset-y-0 left-0 flex items-center px-10 md:px-16 w-full md:w-3/4">
            <div className={`transform transition-all duration-700 delay-300 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold tracking-widest mb-4 backdrop-blur-md">
                {slide.tag}
              </span>
              <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
                {slide.title}
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-md font-light leading-relaxed">
                {slide.subtitle}
              </p>
              <button className="group/btn bg-white hover:bg-primary text-gray-900 hover:text-white px-8 py-4 rounded-full font-bold transition-all duration-300 flex items-center gap-3">
                {slide.cta}
                <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Modern Indicators */}
      <div className="absolute bottom-6 left-16 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button 
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              currentSlide === index ? 'w-8 bg-primary' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
      
      {/* Sleek Navigation Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex gap-2">
        <button 
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
          className="w-10 h-10 rounded-full border border-white/20 bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all duration-300"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>
        <button 
          onClick={() => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
          className="w-10 h-10 rounded-full border border-white/20 bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all duration-300"
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default HeroSlider;
