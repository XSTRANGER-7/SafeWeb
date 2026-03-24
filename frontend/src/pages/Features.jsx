import React from 'react'
import FeatureCards from '../components/FeatureCards'
import { useI18n } from '../../i18n/index.jsx'

export default function Features() {
  const { t } = useI18n()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold sm:text-3xl">{t('features.heading', 'Features')}</h1>
      <FeatureCards />
    </div>
  )
}
