import React from 'react'
import { useI18n } from '../../i18n/index.jsx'

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n()
  return (
    <select 
      value={lang} 
      onChange={(e) => setLang(e.target.value)} 
      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors cursor-pointer sm:w-auto"
    >
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
      <option value="or">Odia</option>
    </select>
  )
}
