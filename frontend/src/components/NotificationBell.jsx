import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../firebase'
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, getDocs } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../../i18n'

export default function NotificationBell() {
  const { user, profile } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)
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
    const notificationsRef = collection(db, 'notifications')
    
    // Try with orderBy first, fallback to just where if index doesn't exist
    let q
    try {
      q = query(
        notificationsRef,
        where('recipientId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
    } catch (error) {
      // If orderBy fails (no index), use just the where clause
      console.warn('OrderBy query failed, using simple query:', error)
      q = query(
        notificationsRef,
        where('recipientId', '==', user.uid)
      )
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifs = []
        snapshot.forEach((doc) => {
          notifs.push({ id: doc.id, ...doc.data() })
        })
        // Sort by createdAt descending if we couldn't use orderBy
        notifs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        setNotifications(notifs)
        setIsLoading(false)
        const unread = notifs.filter(n => !n.read).length
        const read = notifs.filter(n => n.read).length
        console.log(`📬 Loaded ${notifs.length} notifications for user ${user.uid} (${unread} unread, ${read} read)`)
      },
      (error) => {
        console.error('❌ Error listening to notifications:', error)
        // If the error is about missing index, try without orderBy
        if (error.code === 'failed-precondition' || error.message?.includes('index')) {
          console.log('⚠️ Index missing, trying without orderBy...')
          const simpleQ = query(
            notificationsRef,
            where('recipientId', '==', user.uid)
          )
          onSnapshot(
            simpleQ,
            (snapshot) => {
              const notifs = []
              snapshot.forEach((doc) => {
                notifs.push({ id: doc.id, ...doc.data() })
              })
              notifs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
              setNotifications(notifs)
              setIsLoading(false)
              const unread = notifs.filter(n => !n.read).length
              const read = notifs.filter(n => n.read).length
              console.log(`📬 Loaded ${notifs.length} notifications for user ${user.uid} (${unread} unread, ${read} read)`)
            },
            (err) => {
              console.error('❌ Error with simple query:', err)
              setIsLoading(false)
            }
          )
        } else {
          setIsLoading(false)
        }
      }
    )

    return () => unsubscribe()
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
        className="relative p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        aria-label="Notifications"
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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
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
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                >
                  {t('notifications.markAllRead', 'Mark all as read')}
                </button>
              )}
            </div>
            {readCount > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOnlyUnread(!showOnlyUnread)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
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
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                {t('notifications.loading', 'Loading...')}
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
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
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notif.read ? 'bg-amber-50 border-l-4 border-amber-500' : 'bg-white border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                          !notif.read ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="flex-shrink-0 text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${!notif.read ? 'text-gray-700' : 'text-gray-500'}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
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

