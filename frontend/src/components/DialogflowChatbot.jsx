import React, { useState } from 'react'

/**
 * Dialogflow Chatbot Component
 * 
 * This component embeds a Dialogflow chatbot in your website.
 * 
 * Setup Instructions:
 * 1. Go to https://dialogflow.cloud.google.com/
 * 2. Create a new Agent
 * 3. Add Intents and Responses
 * 4. Go to Integrations → Web Demo and turn it ON
 * 5. Copy your agent ID from the iframe URL
 * 6. Set VITE_DIALOGFLOW_AGENT_ID in your .env file
 * 
 * Or set it directly in this component by replacing the agentId variable.
 */
export default function DialogflowChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  // Get Dialogflow Agent ID from environment variable or use default
  // You can also hardcode it here: const agentId = 'your-agent-id'
  const agentId = import.meta.env.VITE_DIALOGFLOW_AGENT_ID || ''

  // Don't render if agent ID is not configured
  if (!agentId) {
    return null
  }

  const dialogflowUrl = `https://console.dialogflow.com/api-client/demo/embedded/${agentId}`

  const toggleChat = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
  }

  const minimizeChat = () => {
    setIsMinimized(true)
    setIsOpen(false)
  }

  return (
    <>
      {/* Chatbot Button - Fixed position at bottom right */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full p-4 shadow-2xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-amber-300"
          aria-label="Open chatbot"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Chat Support</h3>
                <p className="text-xs text-white/90">We're here to help!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={minimizeChat}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Minimize"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={toggleChat}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Dialogflow iframe */}
          <div className="flex-1 overflow-hidden">
            <iframe
              allow="microphone"
              width="100%"
              height="100%"
              src={dialogflowUrl}
              className="border-0"
              title="Dialogflow Chatbot"
            />
          </div>
        </div>
      )}

      {/* Minimized button */}
      {isMinimized && !isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full px-4 py-3 shadow-2xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-300 flex items-center gap-2"
          aria-label="Open chatbot"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-sm font-medium">Chat</span>
        </button>
      )}
    </>
  )
}

