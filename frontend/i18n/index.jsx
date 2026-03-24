import React, { createContext, useContext, useEffect, useState } from 'react'
import en from './en.json'
import hi from './hi.json'
import od from './od.json'
import {
  LANGUAGE_OPTIONS,
  STORAGE_KEY,
  formatCurrencyValue,
  formatDateTimeValue,
  formatDateValue,
  formatNumberValue,
  formatRelativeTimeValue,
  getHtmlLang,
  getInitialLanguage,
  getLocaleForLanguage,
  normalizeLanguage,
  setupDomTranslation,
  translateText
} from './runtime.js'

const translations = { en, hi, od }
const I18nContext = createContext({
  lang: 'en',
  locale: 'en-IN',
  languages: LANGUAGE_OPTIONS,
  setLang: () => {},
  t: (key, fallback) => fallback ?? key,
  translateText: (value) => value,
  formatDate: () => '',
  formatDateTime: () => '',
  formatCurrency: () => '',
  formatNumber: () => '',
  formatRelativeTime: () => ''
})

function resolveMessage(template, values = {}) {
  if (typeof template !== 'string') return template
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`)
}

function lookupTranslation(lang, key) {
  const parts = key.split('.')
  let current = translations[lang] || {}

  for (const part of parts) {
    current = current?.[part]
    if (current == null) return undefined
  }

  return current
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => getInitialLanguage())
  const locale = getLocaleForLanguage(lang)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = getHtmlLang(lang)
    document.documentElement.dir = 'ltr'
  }, [lang])

  useEffect(() => {
    return setupDomTranslation(lang)
  }, [lang])

  const setLang = (nextLang) => {
    setLangState(normalizeLanguage(nextLang))
  }

  const t = (key, fallbackOrValues, maybeValues) => {
    const fallback = typeof fallbackOrValues === 'string' ? fallbackOrValues : undefined
    const values = typeof fallbackOrValues === 'object' && fallbackOrValues !== null
      ? fallbackOrValues
      : maybeValues || {}

    const translatedValue = lookupTranslation(lang, key)
    if (typeof translatedValue === 'string') {
      return resolveMessage(translatedValue, values)
    }

    if (fallback) {
      return resolveMessage(translateText(fallback, lang), values)
    }

    return resolveMessage(key, values)
  }

  const value = {
    lang,
    locale,
    languages: LANGUAGE_OPTIONS,
    setLang,
    t,
    translateText: (text) => translateText(text, lang),
    formatDate: (date, options) => formatDateValue(date, locale, options),
    formatDateTime: (date, options) => formatDateTimeValue(date, locale, options),
    formatCurrency: (amount) => formatCurrencyValue(amount, locale),
    formatNumber: (amount, options) => formatNumberValue(amount, locale, options),
    formatRelativeTime: (date) => formatRelativeTimeValue(date, locale)
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
