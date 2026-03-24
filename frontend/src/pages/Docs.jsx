import React from 'react'
import { useI18n } from '../../i18n/index.jsx'

export default function Docs() {
  const { t } = useI18n()

  return (
    <div className="rounded-xl bg-white p-4 shadow sm:p-6">
      <h1 className="mb-4 text-2xl font-semibold sm:text-3xl">{t('docs.title', 'Documentation')}</h1>
      <p className="text-gray-700">{t('docs.description', 'Docs placeholder - integration guides and API documentation will be here.')}</p>
    </div>
  )
}
