import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'
import { useI18n } from '../../i18n/index.jsx'

export default function ProfileDropdown() {
  const { user, profile, logout } = useAuth()
  const { t, translateText: tt } = useI18n()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
      setIsOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
      alert(tt('Logout failed. Please try again.'))
    }
  }

  const handleNavigation = (path) => {
    navigate(path)
    setIsOpen(false)
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (profile?.name) {
      return profile.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.phoneNumber) {
      return user.phoneNumber.slice(-2)
    }
    return 'U'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:from-amber-600 hover:to-yellow-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 sm:h-10 sm:w-10 sm:text-sm"
        aria-label={tt('Profile menu')}
      >
        {getInitials()}
      </button>

      {isOpen && (
        <div className="absolute right-[-0.125rem] z-50 mt-2 max-h-[70vh] w-[min(15.5rem,calc(100vw-0.75rem))] overflow-y-auto rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl sm:right-0 sm:max-h-none sm:w-64 sm:overflow-visible sm:py-2">
          {/* User Info */}
          <div className="border-b border-gray-100 px-3.5 py-2.5 sm:px-4 sm:py-3">
            <p className="text-xs font-semibold text-gray-900 sm:text-sm">
              {profile?.name || tt('User')}
            </p>
            <p className="mt-1 text-[11px] text-gray-500 sm:text-xs">
              {profile?.email || user?.phoneNumber || tt('No contact info')}
            </p>
          </div>

          <div className="border-b border-gray-100 px-3.5 py-2.5 md:hidden">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              {t('language.label', 'Language')}
            </p>
            <div className="mt-2">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                if (profile?.role === 'police') handleNavigation('/police-dashboard');
                else if (profile?.role === 'bank') handleNavigation('/bank-dashboard');
                else handleNavigation('/dashboard');
              }}
              className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[13px] text-gray-700 transition-colors duration-150 hover:bg-amber-50 hover:text-amber-600 sm:px-4 sm:text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {tt('Dashboard')}
            </button>

            {profile?.role === 'police' || profile?.role === 'bank' ? (
              <button
                onClick={() => handleNavigation(profile?.role === 'police' ? '/police-stats' : '/bank-stats')}
                className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[13px] text-gray-700 transition-colors duration-150 hover:bg-amber-50 hover:text-amber-600 sm:px-4 sm:text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {tt('Analytics')}
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNavigation('/phishing-detection')}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[13px] text-gray-700 transition-colors duration-150 hover:bg-amber-50 hover:text-amber-600 sm:px-4 sm:text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {tt('Phishing URL Detection')}
                </button>

                <button
                  onClick={() => handleNavigation('/women-safety')}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[13px] text-gray-700 transition-colors duration-150 hover:bg-amber-50 hover:text-amber-600 sm:px-4 sm:text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {tt('Women Safety Harassment Report')}
                </button>

                <button
                  onClick={() => handleNavigation('/cyber-fraud-report')}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[13px] text-gray-700 transition-colors duration-150 hover:bg-amber-50 hover:text-amber-600 sm:px-4 sm:text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {tt('Cyber Fraud Report')}
                </button>
              </>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[13px] text-red-600 transition-colors duration-150 hover:bg-red-50 sm:px-4 sm:text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {tt('Logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

