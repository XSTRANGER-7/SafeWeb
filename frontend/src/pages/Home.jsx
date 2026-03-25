import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Hero from '../components/Hero'
import FeatureCards from '../components/FeatureCards'
import odishaPoliceLogo from '../assets/op.webp'
import rbiLogo from '../assets/rbi.webp'
import npciLogo from '../assets/npci.webp'
import { useI18n } from '../../i18n/index.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Home() {
  const { t } = useI18n()
  const { profile, loading } = useAuth()
  const navigate = useNavigate()

  // Redirect authenticated users to their respective dashboards
  useEffect(() => {
    if (!loading && profile) {
      const role = profile.role
      if (role === 'police') {
        navigate('/police-dashboard', { replace: true })
      } else if (role === 'bank') {
        navigate('/bank-dashboard', { replace: true })
      } else if (role === 'normal') {
        navigate('/dashboard', { replace: true })
      }
      // Admin role can stay on home page or redirect as needed
    }
  }, [profile, loading, navigate])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Hero />

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold sm:text-3xl">{t('features.heading', 'Features')}</h2>
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
