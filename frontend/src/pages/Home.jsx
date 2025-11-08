import React from 'react'
import Hero from '../components/Hero'
import FeatureCards from '../components/FeatureCards'
// Import logo images
import odishaPoliceLogo from '../assets/op.webp'
import rbiLogo from '../assets/rbi.webp'
import npciLogo from '../assets/npci.webp'

export default function Home() {
  return (
    <div>
      <Hero />
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Features</h2>
        <FeatureCards />
      </section>
      
      {/* Moving Logos Section */}
      <section className="mt-12 mb-8 overflow-hidden bg-gradient-to-br from-gray-50 to-amber-50/30 py-8">
        <div className="relative">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 via-amber-50/30 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 via-amber-50/30 to-transparent z-10 pointer-events-none"></div>
          
          {/* Moving container */}
          <div className="flex animate-scroll space-x-12">
            {/* Duplicate sets for seamless loop */}
            {[...Array(3)].map((_, setIndex) => (
              <div key={setIndex} className="flex space-x-12 flex-shrink-0">
                {/* Odisha Police Logo */}
                <div className="flex items-center justify-center w-56 h-36 bg-white rounded-xl shadow-lg border-2 border-amber-200 p-4 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="text-center w-full h-full flex flex-col items-center justify-center">
                    <img 
                      src={odishaPoliceLogo} 
                      alt="Odisha Police" 
                      className="h-20 w-auto object-contain mb-2" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="text-5xl mb-2 hidden">👮</div>
                    <div className="text-sm font-bold text-gray-800">Odisha Police</div>
                  </div>
                </div>
                
                {/* RBI Logo */}
                <div className="flex items-center justify-center w-56 h-36 bg-white rounded-xl shadow-lg border-2 border-blue-200 p-4 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="text-center w-full h-full flex flex-col items-center justify-center">
                    <img 
                      src={rbiLogo} 
                      alt="Reserve Bank of India" 
                      className="h-20 w-auto object-contain mb-2" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="text-5xl mb-2 hidden">🏦</div>
                    <div className="text-sm font-bold text-gray-800">Reserve Bank of India</div>
                  </div>
                </div>
                
                {/* NPCI Logo */}
                <div className="flex items-center justify-center w-56 h-36 bg-white rounded-xl shadow-lg border-2 border-green-200 p-4 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="text-center w-full h-full flex flex-col items-center justify-center">
                    <img 
                      src={npciLogo} 
                      alt="NPCI" 
                      className="h-20 w-auto object-contain mb-2" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="text-5xl mb-2 hidden">💳</div>
                    <div className="text-sm font-bold text-gray-800">NPCI</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
