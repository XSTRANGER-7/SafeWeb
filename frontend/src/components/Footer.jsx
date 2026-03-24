import React from 'react'
import { useI18n } from '../../i18n/index.jsx'

export default function Footer() {
  const { t, translateText: tt } = useI18n()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-8 border-t bg-white">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div className="text-sm text-gray-700">{tt('Copyright')} {year} CFVSTS. {tt('All rights reserved.')}</div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm sm:justify-end sm:gap-4">
          <a href="/docs">{t('footer.about')}</a>
          <a href="/docs">{t('footer.contact')}</a>
          <a href="/docs">{t('footer.privacy')}</a>
        </div>
      </div>
    </footer>
  )
}
