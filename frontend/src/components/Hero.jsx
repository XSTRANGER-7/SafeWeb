import React from 'react'
import { useI18n } from '../../i18n/index.jsx'
import { Link } from 'react-router-dom'

export default function Hero() {
  const { t } = useI18n()
  return (
    <div className="bg-white rounded-xl shadow p-8 mb-8">
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h1 className="text-3xl font-bold mb-3">{t('hero.title')}</h1>
          <p className="text-gray-700 mb-4">{t('hero.subtitle')}</p>
          <Link to="/login" className="bg-primary text-white px-5 py-2 rounded shadow">{t('hero.cta')}</Link>
        </div>
        <div>
          <div className="h-48 bg-cream rounded-lg border border-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-medium">Dashboard Preview</div>
              <div className="text-sm text-gray-500 mt-2">Victim → Police → Bank coordination interface</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
