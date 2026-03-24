import React from 'react'
import { useI18n } from '../../i18n/index.jsx'

export default function LanguageSwitcher() {
  const { lang, setLang, languages, t } = useI18n()

  return (
    <div className="flex items-center gap-2" data-no-translate="true">
      <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 sm:inline">
        {t('language.label', 'Language')}
      </span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-amber-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-amber-500 sm:w-auto"
        aria-label={t('language.label', 'Language')}
      >
        {languages.map((language) => (
          <option key={language.value} value={language.value}>
            {language.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  )
}
