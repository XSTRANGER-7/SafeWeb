import React, { createContext, useContext, useState } from 'react'
import en from './en.json'
import hi from './hi.json'
import od from './od.json'

const translations = { en, hi, or: od }
const defaultLang = 'en'
const I18nContext = createContext()

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(defaultLang)
  const t = (key) => {
    const parts = key.split('.')
    let cur = translations[lang] || {}
    for (const p of parts) { cur = cur?.[p]; if (cur == null) return key }
    return cur
  }
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)

