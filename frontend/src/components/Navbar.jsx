import React from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n/index.jsx'
import LanguageSwitcher from './LanguageSwitcher'
import ProfileDropdown from './ProfileDropdown'
import { useAuth } from '../context/AuthContext'
import logoImage from '../assets/logo.jpg'

export default function Navbar() {
  const { t } = useI18n()
  const { user } = useAuth()

  return (
    <nav className="bg-white shadow-md border-b border-gray-100">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo, Title, Tagline, Navigation */}
          <div className="flex items-center gap-4">
            {/* Logo and Brand */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex-shrink-0 relative">
                <img 
                  src={logoImage} 
                  alt="Government Logo" 
                  className="h-12 w-12 object-contain rounded"
                  onError={(e) => {
                    // Fallback if image doesn't exist - show a placeholder
                    e.target.style.display = 'none'
                    const placeholder = e.target.parentElement.querySelector('.logo-placeholder')
                    if (placeholder) placeholder.style.display = 'flex'
                  }}
                />
                <div className="logo-placeholder h-12 w-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-lg hidden">
                  SW
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                  Safeweb
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  Secure. Report. Protect.
                </p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link 
                to="/" 
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
              >
                {t('nav.home')}
              </Link>
              <Link 
                to="/features" 
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
              >
                {t('nav.features')}
              </Link>
              <Link 
                to="/analytics" 
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
              >
                {t('nav.analytics')}
              </Link>
              <Link 
                to="/docs" 
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
              >
                {t('nav.docs')}
              </Link>
            </div>
          </div>

          {/* Right Side - Language & Login/Profile */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {user ? (
              <ProfileDropdown />
            ) : (
              <Link 
                to="/login" 
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
