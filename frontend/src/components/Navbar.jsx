import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../../i18n/index.jsx'
import LanguageSwitcher from './LanguageSwitcher'
import ProfileDropdown from './ProfileDropdown'
import NotificationBell from './NotificationBell'
import { useAuth } from '../context/AuthContext'
import logoImage from '../assets/logo.jpg'

const NAV_LINKS = [
  { to: '/', key: 'nav.home', fallback: 'Home' },
  { to: '/features', key: 'nav.features', fallback: 'Features' },
  { to: '/analytics', key: 'nav.analytics', fallback: 'Analytics' },
  { to: '/docs', key: 'nav.docs', fallback: 'Docs' }
]

export default function Navbar() {
  const { t } = useI18n()
  const { user } = useAuth()
  const location = useLocation()

  const isActiveLink = (to) => {
    if (to === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(to)
  }

  const getLinkClasses = (to) => {
    return [
      'rounded-md px-3 py-2 text-sm font-medium transition-colors',
      isActiveLink(to)
        ? 'bg-amber-50 text-amber-700'
        : 'text-gray-700 hover:bg-amber-50 hover:text-amber-600'
    ].join(' ')
  }

  return (
    <nav className="border-b border-gray-100 bg-white shadow-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-4 sm:py-3 lg:px-6">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
          <Link to="/" className="group flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={logoImage}
                alt="Government Logo"
                className="h-9 w-9 rounded object-contain sm:h-10 sm:w-10 lg:h-12 lg:w-12"
                onError={(e) => {
                  e.target.style.display = 'none'
                  const placeholder = e.target.parentElement.querySelector('.logo-placeholder')
                  if (placeholder) placeholder.style.display = 'flex'
                }}
              />
              <div className="logo-placeholder hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 text-sm font-bold text-white sm:h-10 sm:w-10 sm:text-base lg:h-12 lg:w-12 lg:text-lg">
                SW
              </div>
            </div>

            <div className="min-w-0 max-w-[135px] sm:max-w-none">
              <h1 className="truncate text-base font-bold text-gray-900 transition-colors group-hover:text-amber-600 sm:text-xl lg:text-2xl">
                Safeweb
              </h1>
              <p className="hidden text-xs font-medium text-gray-500 md:block">
                Secure. Report. Protect.
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className={getLinkClasses(link.to)}>
                {t(link.key, link.fallback)}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          {user && <NotificationBell />}
          {user ? (
            <ProfileDropdown />
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-2 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:from-amber-600 hover:to-yellow-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 sm:px-4 sm:text-sm md:px-5 md:font-medium"
            >
              {t('nav.login')}
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
