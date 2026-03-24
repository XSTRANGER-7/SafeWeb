import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n/index.jsx'
import { chatbotLogic } from '../utils/ChatbotLogic.jsx'

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
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([{ from: "bot", text: "Hi! I’m OP Bot 👮‍♂️. How can I help you today?" }])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef(null)

  const botPhoneNumber = '919999999999';
  const whatsAppLaunchUrl = `https://api.whatsapp.com/send?phone=${botPhoneNumber}&text=${encodeURIComponent(t('whatsappBot.prefill') || 'Hi, I need help from the Odisha Police Official WhatsApp Bot.')}`

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { from: "user", text: input }];
    const reply = chatbotLogic(input);
    setMessages([...newMessages, { from: "bot", text: reply }]);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 p-2 sm:px-3 sm:py-2.5 text-sm font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-300 group"
          aria-label="Open Chatbot"
        >
          <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </span>
          <span className="hidden pr-2 text-left sm:block">
            <span className="block text-sm font-bold">Live Support Chat</span>
            <span className="block text-xs font-medium text-blue-100">Help & WhatsApp</span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col w-[calc(100vw-2rem)] sm:w-[26rem] h-[calc(100dvh-5rem)] sm:h-[600px] max-h-[90vh] sm:max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300 ease-out origin-bottom-right">

          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 flex items-center justify-between shadow-md z-10 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
                <span className="text-xl">👮‍♂️</span>
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">OP Bot Support</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-xs text-blue-100 font-medium">Online (Web Bot)</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors focus:outline-none"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* WhatsApp Redirect Banner */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100 p-3">
            <a
              href={whatsAppLaunchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full bg-white border border-emerald-200 rounded-xl p-2.5 transition-all duration-200 hover:shadow-md hover:border-emerald-400 hover:bg-emerald-50/50 group"
            >
              <div className="flex items-center gap-3">
                <div className="flex bg-gradient-to-br from-emerald-400 to-green-600 p-1.5 rounded-lg shadow-sm">
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">Official WhatsApp Bot</p>
                  <p className="text-[10px] text-gray-500 font-medium">Get verified updates directly</p>
                </div>
              </div>
              <div className="bg-emerald-100 p-1.5 rounded-full text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "bot" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-[15px] leading-relaxed ${
                  m.from === "bot" 
                    ? "bg-white border border-gray-200 text-gray-800 rounded-tl-sm" 
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-sm"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            
            {/* Quick Actions (only show if last message is from bot and user hasn't typed much) */}
            {messages.length < 5 && messages[messages.length - 1].from === 'bot' && (
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  { label: '🛡️ Report Cyber Fraud', path: '/cyber-fraud-report' },
                  { label: '🔍 Detect Phishing', path: '/phishing-detection' },
                  { label: '👩‍🦰 Women Safety', path: '/women-safety' },
                  { label: '📋 My Dashboard', path: '/dashboard' }
                ].map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMessages(prev => [...prev, { from: 'user', text: action.label }]);
                      setTimeout(() => {
                        setMessages(prev => [...prev, { from: 'bot', text: `Taking you to ${action.label}...` }]);
                        setTimeout(() => {
                          setIsOpen(false);
                          navigate(action.path);
                        }, 1000);
                      }, 500);
                    }}
                    className="text-xs font-semibold bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-sm"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 p-1.5 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 transition-all">
              <input
                type="text"
                className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none text-gray-700 placeholder-gray-400"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask OP Web Bot..."
              />
              <button 
                onClick={sendMessage}
                disabled={!input.trim()}
                className="bg-blue-600 text-white p-2 rounded-lg transition-transform duration-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                aria-label="Send message"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'translateX(1px)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-2 font-medium">SafeWeb Automated Support • Chat history is not saved</p>
          </div>
        </div>
      )}
    </>
  )
}
