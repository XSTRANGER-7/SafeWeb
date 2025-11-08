import React from 'react'
import { useI18n } from '../../i18n/index.jsx'

export default function Footer() {
  const { t } = useI18n()
  return (
    <footer className="bg-white mt-8 border-t">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-sm text-gray-700">© {new Date().getFullYear()} CFVSTS. All rights reserved.</div>
        <div className="flex gap-4 text-sm">
          <a href="/docs">{t('footer.about')}</a>
          <a href="/docs">{t('footer.contact')}</a>
          <a href="/docs">{t('footer.privacy')}</a>
        </div>
      </div>
    </footer>
  )
}
