import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import logoImage from '../assets/logo.jpg';

export default function GlobalLoader() {
  const location = useLocation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  // Initial load
  useEffect(() => {
    // Show splash screen for 1.2s on initial site visit
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Route change load
  useEffect(() => {
    if (isInitialLoad) return;
    
    // Show top loading bar on route change
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 600); // simulate 600ms load
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {/* 
        1. INITIAL SITE LOAD: Full Screen Splash Loader
      */}
      {isInitialLoad && (
        <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-gray-50 via-amber-50 to-gray-50 flex items-center justify-center transition-opacity duration-300">
          <div className="relative flex flex-col items-center">
            {/* Center Logo with Continuous Ripple Waves */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Outer Ripple */}
              <div className="absolute inset-0 bg-amber-400 rounded-full animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30"></div>
              {/* Inner Ripple */}
              <div className="absolute inset-3 bg-yellow-400 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50" style={{ animationDelay: '0.5s' }}></div>
              
              {/* The Logo Container */}
              <div className="relative z-10 w-20 h-20 bg-white rounded-full p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center overflow-hidden ring-4 ring-white">
                <img src={logoImage} alt="SafeWeb Logo" className="w-full h-full object-contain rounded-full" />
              </div>
            </div>
            
            {/* Text branding */}
            <h1 className="mt-8 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600 tracking-widest">
              SAFEWEB
            </h1>
            <p className="text-gray-500 text-sm mt-2 font-medium animate-pulse tracking-wide">
              Initializing Secure Environment...
            </p>
          </div>
        </div>
      )}

      {/* 
        2. PAGE SWITCH: Sleek Top Loading Bar 
      */}
      {!isInitialLoad && isNavigating && (
        <div className="fixed top-0 left-0 right-0 h-1 z-[9999] bg-amber-100 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 loading-bar-animation"></div>
        </div>
      )}
    </>
  );
}
