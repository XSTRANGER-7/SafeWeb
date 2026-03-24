import React from 'react'
import { useI18n } from '../../i18n/index.jsx'
import { Link } from 'react-router-dom'

export default function FeatureCards() {
  const { t, translateText: tt } = useI18n()
  
  const features = [
    {
      title: t('features.phishing'),
      description: tt('Detect and report phishing URLs to protect yourself and others'),
      icon: '🔍',
      link: '/phishing-detection',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: t('features.women'),
      description: tt('Report harassment incidents and get immediate support'),
      icon: '🛡️',
      link: '/women-safety',
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: t('features.cyber'),
      description: tt('File cyber fraud complaints and track your case progress'),
      icon: '💳',
      link: '/cyber-fraud-report',
      color: 'from-amber-500 to-yellow-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3">
      {features.map((feature, index) => (
        <Link
          key={index}
          to={feature.link}
          className="rounded-[1.25rem] border border-gray-200 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] sm:p-6"
        >
          <div className={`mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-md sm:text-3xl ${feature.color}`}>
            {feature.icon}
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl tracking-tight">{feature.title}</h3>
          <p className="text-sm font-medium leading-relaxed text-gray-500">{feature.description}</p>
        </Link>
      ))}
    </div>
  )
}
