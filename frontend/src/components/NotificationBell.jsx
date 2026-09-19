import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../firebase'
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../../i18n'

function getNotificationBadge(type) {
  switch (type) {
    case 'police_update':
      return {
        icon: '👮‍♂️',
        bg: 'bg-blue-100 text-blue-800 border-blue-200',
        label: 'Police'
      }
    case 'bank_update':
    case 'funds_frozen':
      return {
        icon: '🏦',
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        label: 'Bank'
      }
    case 'new_complaint':
      return {
        icon: '🚨',
        bg: 'bg-red-100 text-red-800 border-red-200',
        label: 'New Case'
      }
    case 'investigation_request':
      return {
        icon: '🔍',
        bg: 'bg-purple-100 text-purple-800 border-purple-200',
        label: 'Investigation'
      }
    default:
      return {
        icon: '🔔',
        bg: 'bg-amber-100 text-amber-800 border-amber-200',
        label: 'Update'
      }
  }
}

export default function NotificationBell() {
  const { user, profile } = useAuth()
  const { t, translateText: tt, formatRelativeTime } = useI18n()
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

  // Listen to notifications in real-time across all relevant recipient channels
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false)
      setNotifications([])
      return
    }

    setIsLoading(true)
    setListenerError('')

    const notifsMap = new Map()
    const unsubscribes = []

    const updateNotificationsState = () => {
      const notifs = Array.from(notifsMap.values())
      // Check if read by current user
      const processed = notifs.map(n => {
        const isRead = n.read === true || (Array.isArray(n.readBy) && n.readBy.includes(user.uid))
        return { ...n, read: isRead }
      })
      processed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      setNotifications(processed)
      setIsLoading(false)
    }

    const notificationsRef = collection(db, 'notifications')

    // 1. Target: recipientId == user.uid
    try {
      const qUid = query(notificationsRef, where('recipientId', '==', user.uid))
      unsubscribes.push(
        onSnapshot(qUid, (snap) => {
          snap.forEach(d => notifsMap.set(d.id, { id: d.id, ...d.data() }))
          updateNotificationsState()
        }, (err) => {
          console.warn('UID notification stream notice:', err.message)
        })
      )
    } catch (e) {
      console.warn('Error setting up UID notification listener:', e)
    }

    // 2. Target: recipientEmail == user.email OR recipientId == user.email
    const userEmail = user.email || profile?.email
    if (userEmail) {
      try {
        const qEmail = query(notificationsRef, where('recipientEmail', '==', userEmail))
        unsubscribes.push(
          onSnapshot(qEmail, (snap) => {
            snap.forEach(d => notifsMap.set(d.id, { id: d.id, ...d.data() }))
            updateNotificationsState()
          }, (err) => {
            console.warn('Email notification stream notice:', err.message)
          })
        )

        const qEmailAsId = query(notificationsRef, where('recipientId', '==', userEmail))
        unsubscribes.push(
          onSnapshot(qEmailAsId, (snap) => {
            snap.forEach(d => notifsMap.set(d.id, { id: d.id, ...d.data() }))
            updateNotificationsState()
          }, (err) => {
            console.warn('Email-as-ID notification stream notice:', err.message)
          })
        )
      } catch (e) {
        console.warn('Error setting up email notification listener:', e)
      }
    }

    // 3. Target: recipientRole == profile.role (police / bank)
    const userRole = profile?.role
    if (userRole && userRole !== 'normal') {
      try {
        const qRole = query(notificationsRef, where('recipientRole', '==', userRole))
        unsubscribes.push(
          onSnapshot(qRole, (snap) => {
            snap.forEach(d => notifsMap.set(d.id, { id: d.id, ...d.data() }))
            updateNotificationsState()
          }, (err) => {
            console.warn('Role notification stream notice:', err.message)
          })
        )

        const qRoleAsId = query(notificationsRef, where('recipientId', '==', `role_${userRole}`))
        unsubscribes.push(
          onSnapshot(qRoleAsId, (snap) => {
            snap.forEach(d => notifsMap.set(d.id, { id: d.id, ...d.data() }))
            updateNotificationsState()
          }, (err) => {
            console.warn('Role-as-ID notification stream notice:', err.message)
          })
        )
      } catch (e) {
        console.warn('Error setting up role notification listener:', e)
      }
    }

    // 4. Target: officialId (if official)
    if (profile?.officialId) {
      try {
        const qOfficial = query(notificationsRef, where('recipientId', '==', profile.officialId))
        unsubscribes.push(
          onSnapshot(qOfficial, (snap) => {
            snap.forEach(d => notifsMap.set(d.id, { id: d.id, ...d.data() }))
            updateNotificationsState()
          }, (err) => {
            console.warn('Official ID notification stream notice:', err.message)
          })
        )
      } catch (e) {
        console.warn('Error setting up official ID notification listener:', e)
      }
    }

    // Fallback timer to disable loading state if empty
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => {
      clearTimeout(timer)
      unsubscribes.forEach(unsub => {
        if (typeof unsub === 'function') unsub()
      })
    }
  }, [user?.uid, user?.email, profile?.email, profile?.role, profile?.officialId])

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      const notif = notifications.find(n => n.id === notificationId)
      const notifRef = doc(db, 'notifications', notificationId)
      const readBy = Array.isArray(notif?.readBy) ? [...notif.readBy] : []
      if (user?.uid && !readBy.includes(user.uid)) {
        readBy.push(user.uid)
      }

      await updateDoc(notifRef, {
        read: true,
        readBy,
        readAt: Date.now()
      })

      // Optimistically update local state
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n))
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
        const readBy = Array.isArray(notif?.readBy) ? [...notif.readBy] : []
        if (user?.uid && !readBy.includes(user.uid)) {
          readBy.push(user.uid)
        }
        return updateDoc(notifRef, {
          read: true,
          readBy,
          readAt: Date.now()
        }).catch(err => console.warn('Failed marking notif read:', err))
      })

      // Optimistically update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      await Promise.all(promises)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const readCount = notifications.filter(n => n.read).length

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
        className="relative rounded-full p-2 text-gray-700 transition-all duration-200 hover:bg-amber-100/70 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        aria-label={t('notifications.title', 'Notifications')}
        title="View Notifications"
      >
        <svg
          className="h-5 w-5 sm:h-6 sm:w-6 transition-transform hover:scale-105"
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
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-extrabold text-white shadow-md animate-pulse ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 flex max-h-[80vh] w-[90vw] max-w-sm sm:w-96 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-amber-50/80 to-yellow-50/50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🔔</span>
                <h3 className="text-sm font-bold text-gray-900">
                  {t('notifications.title', 'Notifications')}
                </h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-xs font-bold text-amber-900">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors"
                >
                  {t('notifications.markAllRead', 'Mark all read')}
                </button>
              )}
            </div>

            {readCount > 0 && (
              <div className="mt-2.5 flex items-center justify-between border-t border-amber-100/60 pt-2">
                <button
                  onClick={() => setShowOnlyUnread(!showOnlyUnread)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                    showOnlyUnread
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-white/80 text-gray-600 hover:bg-white hover:text-gray-900'
                  }`}
                >
                  {showOnlyUnread ? tt('Showing Unread') : tt('Show Unread Only')}
                </button>
                <span className="text-[11px] text-gray-500 font-medium">
                  {notifications.length} total
                </span>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1 divide-y divide-gray-100 max-h-[60vh]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                <span className="text-xs font-medium">{t('notifications.loading', 'Loading updates...')}</span>
              </div>
            ) : listenerError ? (
              <div className="px-4 py-8 text-center text-xs text-red-600">
                {listenerError}
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 px-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl mb-2">
                  📭
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  {showOnlyUnread
                    ? t('notifications.noUnreadNotifications', 'No unread notifications')
                    : t('notifications.noNotifications', 'No notifications yet')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Updates from Police and Bank on complaints will appear here in real-time.
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => {
                const badge = getNotificationBadge(notif.type)
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.read) {
                        markAsRead(notif.id)
                      }
                      setIsOpen(false)
                      if (notif.link) {
                        navigate(notif.link)
                      }
                    }}
                    className={`group relative cursor-pointer px-4 py-3.5 transition-all hover:bg-amber-50/60 ${
                      !notif.read
                        ? 'bg-amber-50/30 border-l-4 border-amber-500'
                        : 'bg-white border-l-4 border-transparent opacity-85 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon badge */}
                      <div className="text-xl flex-shrink-0 mt-0.5">
                        {badge.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          {notif.caseId && (
                            <span className="font-mono text-[10px] text-gray-500 font-medium">
                              {notif.caseId}
                            </span>
                          )}
                          {!notif.read && (
                            <span className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                          )}
                        </div>

                        <p className={`text-xs font-semibold leading-snug ${!notif.read ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                          {notif.title}
                        </p>

                        <p className="mt-1 text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>

                        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                          <span>{formatRelativeTime(notif.createdAt)}</span>
                          {notif.link && (
                            <span className="text-amber-700 group-hover:underline font-medium flex items-center gap-0.5">
                              View details →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
