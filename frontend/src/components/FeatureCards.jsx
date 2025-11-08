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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <Link
          key={index}
          to={feature.link}
          className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-3xl mb-4 shadow-md`}>
            {feature.icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
          <p className="text-gray-600 text-sm">{feature.description}</p>
        </Link>
      ))}
    </div>
  )
}
