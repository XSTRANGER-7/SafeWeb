import React from 'react'
import Hero from '../components/Hero'
import FeatureCards from '../components/FeatureCards'
import odishaPoliceLogo from '../assets/op.webp'
import rbiLogo from '../assets/rbi.webp'
import npciLogo from '../assets/npci.webp'

export default function Home() {
  return (
    <div>
      <Hero />

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold sm:text-3xl">Features</h2>
        <FeatureCards />
      </section>

      <section className="mb-8 mt-12 overflow-hidden bg-gradient-to-br from-gray-50 to-amber-50/30 py-6 sm:py-8">
        <div className="relative">
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-12 bg-gradient-to-r from-gray-50 via-amber-50/30 to-transparent sm:w-32"></div>
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-12 bg-gradient-to-l from-gray-50 via-amber-50/30 to-transparent sm:w-32"></div>

          <div className="flex animate-scroll space-x-6 sm:space-x-12">
            {[...Array(3)].map((_, setIndex) => (
              <div key={setIndex} className="flex flex-shrink-0 space-x-6 sm:space-x-12">
                <div className="flex h-28 w-40 items-center justify-center rounded-xl border-2 border-amber-200 bg-white p-3 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl sm:h-36 sm:w-56 sm:p-4">
                  <div className="flex h-full w-full flex-col items-center justify-center text-center">
                    <img
                      src={odishaPoliceLogo}
                      alt="Odisha Police"
                      className="mb-2 h-14 w-auto object-contain sm:h-20"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'block'
                      }}
                    />
                    <div className="mb-2 hidden text-5xl">👮</div>
                    <div className="text-xs font-bold text-gray-800 sm:text-sm">Odisha Police</div>
                  </div>
                </div>

                <div className="flex h-28 w-40 items-center justify-center rounded-xl border-2 border-blue-200 bg-white p-3 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl sm:h-36 sm:w-56 sm:p-4">
                  <div className="flex h-full w-full flex-col items-center justify-center text-center">
                    <img
                      src={rbiLogo}
                      alt="Reserve Bank of India"
                      className="mb-2 h-14 w-auto object-contain sm:h-20"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'block'
                      }}
                    />
                    <div className="mb-2 hidden text-5xl">🏦</div>
                    <div className="text-xs font-bold text-gray-800 sm:text-sm">Reserve Bank of India</div>
                  </div>
                </div>

                <div className="flex h-28 w-40 items-center justify-center rounded-xl border-2 border-green-200 bg-white p-3 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl sm:h-36 sm:w-56 sm:p-4">
                  <div className="flex h-full w-full flex-col items-center justify-center text-center">
                    <img
                      src={npciLogo}
                      alt="NPCI"
                      className="mb-2 h-14 w-auto object-contain sm:h-20"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'block'
                      }}
                    />
                    <div className="mb-2 hidden text-5xl">💳</div>
                    <div className="text-xs font-bold text-gray-800 sm:text-sm">NPCI</div>
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
