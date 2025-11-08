import React from 'react'
import { useI18n } from '../../i18n/index.jsx'

const cardData = [
  { key: 'phishing', title: 'Phishing Detection', desc: 'Detect and report phishing links quickly.' },
  { key: 'women', title: 'Women Safety', desc: 'Emergency SOS and location-based help.' },
  { key: 'cyber', title: 'Cyber Fraud', desc: 'Track fraud complaints and refunds.' }
]

export default function FeatureCards() {
  const { t } = useI18n()
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {cardData.map(c => (
        <div key={c.key} className="bg-white p-4 rounded shadow">
          <div className="text-xl font-semibold mb-2">{c.title}</div>
          <div className="text-sm text-gray-600">{c.desc}</div>
        </div>
      ))}
    </div>
  )
}
