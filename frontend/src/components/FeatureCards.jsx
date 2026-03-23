import React from 'react'
import { useI18n } from '../../i18n/index.jsx'
import { Link } from 'react-router-dom'

export default function FeatureCards() {
  const { t } = useI18n()
  
  const features = [
    {
      title: t('features.phishing'),
      description: 'Detect and report phishing URLs to protect yourself and others',
      icon: '🔍',
      link: '/phishing-detection',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: t('features.women'),
      description: 'Report harassment incidents and get immediate support',
      icon: '🛡️',
      link: '/women-safety',
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: t('features.cyber'),
      description: 'File cyber fraud complaints and track your case progress',
      icon: '💳',
      link: '/cyber-fraud-report',
      color: 'from-amber-500 to-yellow-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
      {features.map((feature, index) => (
        <Link
          key={index}
          to={feature.link}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg sm:p-6"
        >
          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-2xl shadow-md sm:h-14 sm:w-14 sm:text-3xl ${feature.color}`}>
            {feature.icon}
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">{feature.title}</h3>
          <p className="text-gray-600 text-sm">{feature.description}</p>
        </Link>
      ))}
    </div>
  )
}
