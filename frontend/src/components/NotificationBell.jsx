import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../firebase'
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../../i18n'

export default function NotificationBell() {
  const { user } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)
  const [listenerError, setListenerError] = useState('')
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Listen to notifications in real-time
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setListenerError('')
    const notificationsRef = collection(db, 'notifications')

    const queryWithOrder = query(
      notificationsRef,
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    const queryWithoutOrder = query(
      notificationsRef,
      where('recipientId', '==', user.uid)
    )

    let fallbackUnsubscribe = null

    const applySnapshot = (snapshot) => {
      const notifs = []
      snapshot.forEach((snapshotDoc) => {
        notifs.push({ id: snapshotDoc.id, ...snapshotDoc.data() })
      })
      notifs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      setNotifications(notifs)
      setListenerError('')
      setIsLoading(false)
      const unread = notifs.filter(n => !n.read).length
      const read = notifs.filter(n => n.read).length
      console.log(`📬 Loaded ${notifs.length} notifications for user ${user.uid} (${unread} unread, ${read} read)`)
    }

    const handleError = (error) => {
      if (error.code === 'permission-denied') {
        // Permission-denied is handled with user-facing text below.
      } else if (
        error.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
        error.message?.includes('net::ERR_BLOCKED_BY_CLIENT')
      ) {
        // Blocked-by-client is handled with user-facing text below.
      } else {
        console.error('❌ Error listening to notifications:', error)
      }

      if (error.code === 'failed-precondition' || error.message?.includes('index')) {
        console.log('⚠️ Index missing, retrying notifications query without orderBy...')
        fallbackUnsubscribe = onSnapshot(
          queryWithoutOrder,
          applySnapshot,
          (fallbackError) => {
            console.error('❌ Error with fallback notification query:', fallbackError)
            setNotifications([])
            setListenerError('Notifications are temporarily unavailable.')
            setIsLoading(false)
          }
        )
        return
      }

      if (error.code === 'permission-denied') {
        setListenerError('Notification permission denied. Please check Firestore rules for notifications.')
      } else if (
        error.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
        error.message?.includes('net::ERR_BLOCKED_BY_CLIENT')
      ) {
        setListenerError('Notifications are blocked by browser extension/privacy settings. Allow Firebase/Firestore requests for this site.')
      } else {
        setListenerError('Failed to load notifications.')
      }

      setNotifications([])
      setIsLoading(false)
    }

    const unsubscribe = onSnapshot(queryWithOrder, applySnapshot, handleError)

    return () => {
      unsubscribe()
      if (fallbackUnsubscribe) {
        fallbackUnsubscribe()
      }
    }
  }, [user?.uid])

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId)
      await updateDoc(notifRef, {
        read: true,
        readAt: Date.now()
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.read)
      const promises = unreadNotifs.map(notif => {
        const notifRef = doc(db, 'notifications', notif.id)
        return updateDoc(notifRef, {
          read: true,
          readAt: Date.now()
        })
      })
      await Promise.all(promises)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const readCount = notifications.filter(n => n.read).length
  
  // Filter notifications based on showOnlyUnread
  const displayedNotifications = showOnlyUnread 
    ? notifications.filter(n => !n.read)
    : notifications

  if (!user) {
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-1.5 text-gray-600 transition-colors hover:bg-amber-50 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 sm:p-2"
        aria-label="Notifications"
      >
        <svg
          className="h-5 w-5 sm:h-6 sm:w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white sm:h-5 sm:w-5 sm:text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-[-2.75rem] top-full z-50 mt-2 flex max-h-[70vh] w-[min(17rem,calc(100vw-0.75rem))] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl sm:right-0 sm:max-h-96 sm:w-80">
          {/* Header */}
          <div className="border-b border-gray-200 px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                {t('notifications.title', 'Notifications')}
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    ({unreadCount} unread)
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="self-start text-xs font-medium text-amber-600 hover:text-amber-700 sm:self-auto"
                >
                  {t('notifications.markAllRead', 'Mark all as read')}
                </button>
              )}
            </div>
            {readCount > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowOnlyUnread(!showOnlyUnread)}
                  className={`rounded px-2 py-1 text-xs transition-colors ${
                    showOnlyUnread
                      ? 'bg-amber-100 text-amber-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {showOnlyUnread ? 'Show All' : 'Show Unread Only'}
                </button>
                {!showOnlyUnread && (
                  <span className="text-xs text-gray-500">
                    {readCount} read
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="px-3 py-6 text-center text-xs text-gray-500 sm:px-4 sm:py-8 sm:text-sm">
                {t('notifications.loading', 'Loading...')}
              </div>
            ) : listenerError ? (
              <div className="px-3 py-6 text-center text-xs text-red-600 sm:px-4 sm:py-8 sm:text-sm">
                {listenerError}
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-gray-500 sm:px-4 sm:py-8 sm:text-sm">
                {showOnlyUnread 
                  ? t('notifications.noUnreadNotifications', 'No unread notifications')
                  : t('notifications.noNotifications', 'No notifications')
                }
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {displayedNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.read) {
                        markAsRead(notif.id)
                      }
                      setIsOpen(false)
                      // Navigate to relevant page if link is provided
                      if (notif.link) {
                        navigate(notif.link)
                      }
                    }}
                    className={`cursor-pointer px-3 py-2.5 transition-colors hover:bg-gray-50 sm:px-4 sm:py-3 ${
                      !notif.read ? 'bg-amber-50 border-l-4 border-amber-500' : 'bg-white border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div
                        className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full sm:mt-2 ${
                          !notif.read ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-medium sm:text-sm ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="flex-shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 sm:px-2 sm:text-xs">
                              New
                            </span>
                          )}
                        </div>
                        <p className={`mt-1 text-[11px] sm:text-xs ${!notif.read ? 'text-gray-700' : 'text-gray-500'}`}>
                          {notif.message}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-400">
                          {formatTime(notif.createdAt)}
                          {notif.read && notif.readAt && (
                            <span className="ml-2">• Read {formatTime(notif.readAt)}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to format timestamp
function formatTime(timestamp) {
  if (!timestamp) return ''
  
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}

