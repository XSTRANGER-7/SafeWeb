import React from 'react'
import { useI18n } from '../../i18n/index.jsx'

function WhatsAppIcon({ className = 'h-6 w-6' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M19.11 17.24c-.25-.13-1.48-.73-1.71-.81-.23-.08-.39-.13-.56.13-.16.25-.64.81-.78.97-.14.16-.29.18-.54.06-.25-.13-1.04-.38-1.98-1.2-.73-.66-1.22-1.46-1.36-1.71-.14-.25-.01-.39.11-.52.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.76-1.84-.2-.48-.4-.42-.56-.43l-.48-.01c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.4 1.01 2.56.12.16 1.76 2.7 4.26 3.78.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.48-.61 1.69-1.2.21-.59.21-1.1.15-1.2-.06-.1-.21-.16-.45-.29Z" />
      <path d="M16.01 3.2C8.93 3.2 3.2 8.93 3.2 16c0 2.49.72 4.9 2.07 6.97L3 29l6.22-2.23A12.7 12.7 0 0 0 16.01 28.8c7.07 0 12.8-5.73 12.8-12.8S23.08 3.2 16.01 3.2Zm0 23.32c-2.08 0-4.12-.56-5.91-1.63l-.42-.25-3.69 1.32 1.34-3.6-.27-.44a10.44 10.44 0 0 1-1.61-5.62c0-5.77 4.69-10.46 10.46-10.46 2.79 0 5.41 1.08 7.38 3.06a10.36 10.36 0 0 1 3.07 7.4c0 5.76-4.69 10.45-10.45 10.45Z" />
    </svg>
  )
}

export default function WhatsAppBot() {
  const { t } = useI18n()

  // Note: we can put a placeholder phone number like 919999999999 or leave it to rely on user changing it.
  // Using a generic Odisha Police placeholder number, modify as needed.
  const botPhoneNumber = '919999999999';
  const whatsAppLaunchUrl = `https://api.whatsapp.com/send?phone=${botPhoneNumber}&text=${encodeURIComponent(t('whatsappBot.prefill') || 'Hello, I need help with an online safety service.')}`

  return (
    <a
      href={whatsAppLaunchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-2xl transition-all duration-200 hover:scale-[1.02] hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 sm:bottom-6 sm:right-6"
      aria-label={t('whatsappBot.button') || 'WhatsApp Bot'}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/14">
        <WhatsAppIcon className="h-7 w-7" />
      </span>
      <span className="hidden pr-2 text-left sm:block">
        <span className="block text-sm font-semibold">{t('whatsappBot.button') || 'WhatsApp Bot'}</span>
        <span className="block text-xs font-medium text-white/85">{t('whatsappBot.online') || 'Online now'}</span>
      </span>
    </a>
  )
}
