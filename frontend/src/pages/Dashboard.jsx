import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { db } from '../../firebase'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../../i18n'

const STATUS_ORDER = ['Pending', 'In Process', 'Funds Frozen', 'Refunded', 'Closed']

const STATUS_META = {
  Pending: { color: '#f59e0b', badge: 'border-amber-200 bg-amber-50 text-amber-700', dot: 'bg-amber-500', progress: 20, summary: 'Awaiting first review' },
  'In Process': { color: '#3b82f6', badge: 'border-blue-200 bg-blue-50 text-blue-700', dot: 'bg-blue-500', progress: 55, summary: 'Investigation in progress' },
  'Funds Frozen': { color: '#8b5cf6', badge: 'border-violet-200 bg-violet-50 text-violet-700', dot: 'bg-violet-500', progress: 80, summary: 'Funds action completed' },
  Refunded: { color: '#10b981', badge: 'border-emerald-200 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', progress: 100, summary: 'Resolved successfully' },
  Closed: { color: '#6b7280', badge: 'border-gray-200 bg-gray-50 text-gray-700', dot: 'bg-gray-500', progress: 100, summary: 'Closed' }
}

const QUICK_ACTIONS = [
  ['File New Complaint', 'Start a fresh complaint and upload evidence securely.', '/cyber-fraud-report'],
  ['Track Applications', 'Review all submitted complaints and their live status.', '/cyber-fraud-report?view=track'],
  ['Check Suspicious Link', 'Scan a URL before opening it or sharing details.', '/phishing-detection'],
  ['Women Safety Support', 'Open safety tools, alerts, and emergency resources.', '/women-safety']
]

function getStatusMeta(status) {
  return STATUS_META[status] || STATUS_META.Pending
}

function getTimestamp(value) {
  if (!value) return 0
  if (typeof value === 'number') return value
  const parsed = new Date(value).getTime()
  return Number.isNaN(parsed) ? 0 : parsed
}

function getAmount(caseItem) {
  return Number(caseItem?.transactions?.[0]?.amount ?? caseItem?.amountLost ?? 0) || 0
}

function getLatestTimelineEntry(caseItem) {
  if (!Array.isArray(caseItem?.timeline) || caseItem.timeline.length === 0) return null
  return caseItem.timeline.reduce((latest, entry) => {
    const latestTime = getTimestamp(latest?.at || latest?.timestamp)
    const entryTime = getTimestamp(entry?.at || entry?.timestamp)
    return entryTime > latestTime ? entry : latest
  }, caseItem.timeline[0])
}

function getLatestCaseTimestamp(caseItem) {
  const latestTimelineEntry = getLatestTimelineEntry(caseItem)
  return Math.max(
    getTimestamp(caseItem?.updatedAt),
    getTimestamp(caseItem?.createdAt),
    getTimestamp(latestTimelineEntry?.at || latestTimelineEntry?.timestamp)
  )
}

function formatDate(value, locale, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  const timestamp = getTimestamp(value)
  if (!timestamp) return 'Not available'
  return new Intl.DateTimeFormat(locale, options).format(new Date(timestamp))
}

function formatDateTime(value, locale) {
  return formatDate(value, locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

function formatCurrency(value, locale) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value) || 0)
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-gray-900">{value}</p>
      <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const { locale, translateText: tt, formatNumber } = useI18n()
  const [searchParams] = useSearchParams()
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.uid) {
      setCases([])
      setLoading(false)
      return undefined
    }

    setLoading(true)
    setError('')

    const casesQuery = query(collection(db, 'cases'), where('victimUid', '==', user.uid))
    const unsubscribe = onSnapshot(
      casesQuery,
      (snapshot) => {
        const nextCases = []
        snapshot.forEach((docSnapshot) => {
          nextCases.push({ id: docSnapshot.id, ...docSnapshot.data() })
        })
        nextCases.sort((a, b) => getLatestCaseTimestamp(b) - getLatestCaseTimestamp(a))
        setCases(nextCases)
        setLoading(false)
      },
      (listenError) => {
        console.error('Error loading dashboard applications:', listenError)
        if (listenError.code === 'permission-denied') {
          setError('Your dashboard could not load application data because Firestore access is restricted.')
        } else if (listenError.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
          setError('Live dashboard updates are being blocked by browser privacy or extension settings.')
        } else {
          setError('We could not load your application dashboard right now.')
        }
        setCases([])
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid])

  const displayName = profile?.name || user?.displayName || tt('User')
  const focusedCaseId = searchParams.get('caseId')
  const sortedCases = [...cases].sort((a, b) => {
    const aFocused = focusedCaseId && (a.caseId === focusedCaseId || a.id === focusedCaseId)
    const bFocused = focusedCaseId && (b.caseId === focusedCaseId || b.id === focusedCaseId)
    if (aFocused && !bFocused) return -1
    if (!aFocused && bFocused) return 1
    return getLatestCaseTimestamp(b) - getLatestCaseTimestamp(a)
  })

  const latestCase = sortedCases[0] || null
  const focusedCase = focusedCaseId
    ? sortedCases.find((caseItem) => caseItem.caseId === focusedCaseId || caseItem.id === focusedCaseId) || null
    : null
  const totalApplications = sortedCases.length
  const pendingApplications = sortedCases.filter((caseItem) => (caseItem.status || 'Pending') === 'Pending').length
  const activeApplications = sortedCases.filter((caseItem) => ['Pending', 'In Process', 'Funds Frozen'].includes(caseItem.status || 'Pending')).length
  const resolvedApplications = sortedCases.filter((caseItem) => ['Refunded', 'Closed'].includes(caseItem.status || 'Pending')).length
  const totalReportedLoss = sortedCases.reduce((sum, caseItem) => sum + getAmount(caseItem), 0)
  const averageClaimValue = totalApplications ? Math.round(totalReportedLoss / totalApplications) : 0
  const resolutionRate = totalApplications ? Math.round((resolvedApplications / totalApplications) * 100) : 0

  const statusData = STATUS_ORDER
    .map((status) => ({
      status,
      name: tt(status),
      value: sortedCases.filter((caseItem) => (caseItem.status || 'Pending') === status).length,
      fill: getStatusMeta(status).color
    }))
    .filter((item) => item.value > 0)

  const monthlyTrend = Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date()
    monthDate.setDate(1)
    monthDate.setMonth(monthDate.getMonth() - (5 - index))
    const month = monthDate.getMonth()
    const year = monthDate.getFullYear()

    return {
      month: monthDate.toLocaleDateString(locale, { month: 'short' }),
      submitted: sortedCases.filter((caseItem) => {
        const createdAt = new Date(getTimestamp(caseItem.createdAt))
        return createdAt.getMonth() === month && createdAt.getFullYear() === year
      }).length,
      resolved: sortedCases.filter((caseItem) => {
        if (!['Refunded', 'Closed'].includes(caseItem.status || 'Pending')) return false
        const updatedAt = new Date(getTimestamp(caseItem.updatedAt || caseItem.createdAt))
        return updatedAt.getMonth() === month && updatedAt.getFullYear() === year
      }).length
    }
  })

  const recentActivity = sortedCases
    .flatMap((caseItem) => {
      const timeline = Array.isArray(caseItem.timeline) && caseItem.timeline.length
        ? caseItem.timeline
        : [{ status: caseItem.status || 'Pending', note: 'Application created', at: caseItem.createdAt }]

      return timeline.map((entry, index) => ({
        id: `${caseItem.id}-${index}-${getTimestamp(entry.at || entry.timestamp)}`,
        caseId: caseItem.caseId || caseItem.id,
        fraudType: caseItem.fraudType || 'Cyber Fraud Complaint',
        status: entry.status || caseItem.status || 'Pending',
        note: entry.note || entry.description || 'Application updated',
        at: getTimestamp(entry.at || entry.timestamp) || getLatestCaseTimestamp(caseItem)
      }))
    })
    .sort((a, b) => b.at - a.at)
    .slice(0, 6)

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-amber-900 p-6 text-white shadow-2xl sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.35),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.22),transparent_28%)]" />
          <div className="relative space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white/80">
                  {tt('Personal Dashboard')}
                </span>
                <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
                  {tt(`Welcome back, ${displayName}`)}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
                  {tt('Manage your submitted applications, monitor live progress, and keep every important update in one place.')}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur sm:min-w-[240px]">
                <p className="text-xs uppercase tracking-[0.18em] text-white/65">{tt('Today')}</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {formatDate(Date.now(), locale, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  {activeApplications > 0
                    ? tt(`${activeApplications} active application${activeApplications === 1 ? '' : 's'} need monitoring`)
                    : tt('Your dashboard is ready for your next complaint or status update.')}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">{tt('Resolution Rate')}</p>
                <p className="mt-3 text-3xl font-semibold">{formatNumber(resolutionRate)}%</p>
                <p className="mt-2 text-sm text-slate-200">{tt('Across all submitted applications')}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">{tt('Reported Amount')}</p>
                <p className="mt-3 text-3xl font-semibold">{formatCurrency(totalReportedLoss, locale)}</p>
                <p className="mt-2 text-sm text-slate-200">{tt('Combined reported loss value')}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">{tt('Average Claim')}</p>
                <p className="mt-3 text-3xl font-semibold">{formatCurrency(averageClaimValue, locale)}</p>
                <p className="mt-2 text-sm text-slate-200">{tt('Average amount per application')}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/cyber-fraud-report"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-50"
              >
                {tt('File New Complaint')}
              </Link>
              <Link
                to="/cyber-fraud-report?view=track"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {tt('Open Application Tracker')}
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">{tt('Account Snapshot')}</p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                {focusedCase ? tt('Focused Application') : tt('Logged-in User Profile')}
              </h2>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              {tt(profile?.role || 'normal')}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">{tt('Email')}</p>
              <p className="mt-2 break-all text-sm font-semibold text-gray-900">
                {profile?.email || user?.email || tt('Not available')}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">{tt('Member Since')}</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {profile?.createdAt ? tt(formatDate(profile.createdAt, locale)) : tt('Recently joined')}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">{tt('Latest Application')}</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {latestCase?.caseId || tt('No applications yet')}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                {focusedCase ? tt('Opened From Notification') : tt('Current Focus')}
              </p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {(focusedCase || latestCase)?.caseId || tt('No active focus')}
              </p>
              {(focusedCase || latestCase) && (
                <span className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusMeta((focusedCase || latestCase).status || 'Pending').badge}`}>
                  <span className={`h-2 w-2 rounded-full ${getStatusMeta((focusedCase || latestCase).status || 'Pending').dot}`} />
                  {tt((focusedCase || latestCase).status || 'Pending')}
                </span>
              )}
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {focusedCase
                  ? tt('This application was highlighted from a dashboard notification link.')
                  : latestCase
                    ? tt('Your latest application remains pinned here for quick review.')
                    : tt('Once you file an application, its live status will appear here.')}
              </p>
            </div>
          </div>
        </div>
          <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">{tt('Quick Actions')}</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">{tt('Move Faster')}</h2>
            <div className="mt-6 grid gap-3">
              {QUICK_ACTIONS.map(([title, description, to]) => (
                <Link
                  key={title}
                  to={to}
                  className="rounded-3xl border border-gray-200 p-4 transition hover:border-gray-300 hover:bg-gray-50"
                >
                  <p className="text-base font-semibold text-gray-900">{tt(title)}</p>
                  <p className="mt-1 text-sm leading-6 text-gray-500">{tt(description)}</p>
                </Link>
              ))}
            </div>
          </div>
      </section>
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {tt(error)}
        </div>
      )}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={tt('Applications Submitted')}
          value={formatNumber(totalApplications)}
          subtitle={tt('All complaints linked to your account')}
        />
        <StatCard
          title={tt('Pending Review')}
          value={formatNumber(pendingApplications)}
          subtitle={tt('New applications waiting for first action')}
        />
        <StatCard
          title={tt('Active Cases')}
          value={formatNumber(activeApplications)}
          subtitle={tt('Applications currently under active processing')}
        />
        <StatCard
          title={tt('Resolved')}
          value={formatNumber(resolvedApplications)}
          subtitle={tt('Applications marked refunded or closed')}
        />
      </section>
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">{tt('Analytics')}</p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">{tt('Application Performance')}</h2>
              </div>
              <p className="text-sm text-gray-500">{tt('Live view of your submitted applications and outcomes')}</p>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-gray-200 p-4 sm:p-5">
                <h3 className="text-lg font-semibold text-gray-900">{tt('Submission Trend')}</h3>
                <p className="mt-1 text-sm text-gray-500">{tt('Submitted vs resolved applications over the last 6 months')}</p>
                <div className="mt-5">
                  {totalApplications === 0 ? (
                    <div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 text-center text-sm text-gray-500">
                      {tt('File your first application to unlock trend analytics.')}
                    </div>
                  ) : (
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyTrend}>
                          <defs>
                            <linearGradient id="dashSubmitted" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="dashResolved" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} />
                          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} />
                          <Tooltip />
                          <Area type="monotone" dataKey="submitted" name={tt('Submitted')} stroke="#f59e0b" fill="url(#dashSubmitted)" strokeWidth={3} />
                          <Area type="monotone" dataKey="resolved" name={tt('Resolved')} stroke="#10b981" fill="url(#dashResolved)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 p-4 sm:p-5">
                <h3 className="text-lg font-semibold text-gray-900">{tt('Status Mix')}</h3>
                <p className="mt-1 text-sm text-gray-500">{tt('How your applications are distributed by current status')}</p>
                <div className="mt-5">
                  {statusData.length === 0 ? (
                    <div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 text-center text-sm text-gray-500">
                      {tt('Status insights will appear after your first complaint.')}
                    </div>
                  ) : (
                    <>
                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={3}>
                              {statusData.map((item) => (
                                <Cell key={item.name} fill={item.fill} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {statusData.map((item) => (
                          <div key={item.status} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                              <span className="text-sm font-medium text-gray-700">{item.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{formatNumber(item.value)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">{tt('Status Tracker')}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-gray-900">{tt('All Application Status')}</h2>
                  <p className="mt-1 text-sm text-gray-500">{tt('Review every complaint, current stage, and the latest operational note.')}</p>
                </div>
                <Link
                  to="/cyber-fraud-report?view=track"
                  className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                >
                  {tt('Open Detailed Tracker')}
                </Link>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {loading ? (
                <div className="flex min-h-[240px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-14 w-14 animate-spin rounded-full border-b-4 border-t-4 border-amber-500" />
                    <p className="mt-4 text-sm text-gray-500">{tt('Loading your applications...')}</p>
                  </div>
                </div>
              ) : sortedCases.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center">
                  <h3 className="text-xl font-semibold text-gray-900">{tt('No applications yet')}</h3>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
                    {tt('Start your first complaint to unlock live tracking, analytics, and end-to-end status updates.')}
                  </p>
                  <Link
                    to="/cyber-fraud-report"
                    className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-amber-600 hover:to-yellow-600"
                  >
                    {tt('File Your First Complaint')}
                  </Link>
                </div>
              ) : (
                <div className="max-h-[760px] space-y-4 overflow-y-auto pr-1">
                  {sortedCases.map((caseItem) => {
                    const status = caseItem.status || 'Pending'
                    const statusMeta = getStatusMeta(status)
                    const latestTimelineEntry = getLatestTimelineEntry(caseItem)
                    const latestUpdate = latestTimelineEntry?.note || latestTimelineEntry?.description || statusMeta.summary
                    const lastUpdatedAt = latestTimelineEntry?.at || latestTimelineEntry?.timestamp || caseItem.updatedAt || caseItem.createdAt
                    const isFocused = focusedCaseId && (caseItem.caseId === focusedCaseId || caseItem.id === focusedCaseId)

                    return (
                      <div
                        key={caseItem.id}
                        className={`rounded-3xl border p-5 transition shadow-sm ${isFocused ? 'border-amber-300 bg-amber-50/60 ring-2 ring-amber-100' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-xl font-semibold text-gray-900">
                                {tt(caseItem.fraudType || 'Cyber Fraud Complaint')}
                              </h3>
                              {isFocused && (
                                <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                                  {tt('Focused')}
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                              {tt('Case ID')}: <span className="font-semibold text-gray-700">{caseItem.caseId || caseItem.id}</span>
                            </p>
                          </div>
                          <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusMeta.badge}`}>
                            <span className={`h-2 w-2 rounded-full ${statusMeta.dot}`} />
                            {tt(status)}
                          </span>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{tt('Filed On')}</p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">{tt(formatDate(caseItem.createdAt, locale))}</p>
                          </div>
                          <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{tt('Last Updated')}</p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">{tt(formatDateTime(lastUpdatedAt, locale))}</p>
                          </div>
                          <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{tt('Reported Amount')}</p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">{formatCurrency(getAmount(caseItem), locale)}</p>
                          </div>
                          <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{tt('Current Stage')}</p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">{tt(statusMeta.summary)}</p>
                          </div>
                        </div>

                        <div className="mt-5">
                          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-500">
                            <span>{tt('Progress')}</span>
                            <span>{formatNumber(statusMeta.progress)}%</span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                            <div className="h-full rounded-full" style={{ width: `${statusMeta.progress}%`, background: `linear-gradient(90deg, ${statusMeta.color}, ${statusMeta.color}CC)` }} />
                          </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50/80 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{tt('Latest Update')}</p>
                          <p className="mt-2 text-sm leading-6 text-gray-700">{tt(latestUpdate)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">

          <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">{tt('Recent Activity')}</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">{tt('Latest Updates')}</h2>

            {recentActivity.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-gray-200 bg-gray-50/80 px-5 py-10 text-center text-sm text-gray-500">
                {tt('Activity from your application timeline will appear here once a case is created.')}
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {recentActivity.map((item) => {
                  const statusMeta = getStatusMeta(item.status)
                  return (
                    <div key={item.id} className="flex gap-3 rounded-2xl border border-gray-200 p-4">
                      <div className="mt-1 flex-shrink-0">
                        <span
                          className="block h-3.5 w-3.5 rounded-full"
                          style={{ backgroundColor: statusMeta.color }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{tt(item.fraudType)}</p>
                        <p className="mt-1 text-sm leading-6 text-gray-600">{tt(item.note)}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span className="font-medium text-gray-700">{item.caseId}</span>
                          <span>•</span>
                          <span>{tt(item.status)}</span>
                          <span>•</span>
                          <span>{tt(formatDateTime(item.at, locale))}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">{tt('Guidance')}</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">{tt('What To Watch')}</h2>
            <div className="mt-6 space-y-4">
              {sortedCases.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/80 px-5 py-8 text-sm leading-6 text-gray-500">
                  {tt('After your first complaint, the dashboard will show which applications need the most attention.')}
                </div>
              ) : (
                sortedCases.slice(0, 3).map((caseItem) => {
                  const status = caseItem.status || 'Pending'
                  const statusMeta = getStatusMeta(status)
                  const statusGuidance = {
                    Pending: 'Keep your evidence and transaction details ready while the first review is pending.',
                    'In Process': 'Stay reachable for calls or messages while the investigation is active.',
                    'Funds Frozen': 'Monitor the tracker closely for the next refund or closure update.',
                    Refunded: 'Refund is processed. Keep your case ID saved for records.',
                    Closed: 'Review the case outcome and keep the reference if you need it later.'
                  }

                  return (
                    <div key={caseItem.id} className="rounded-3xl border border-gray-200 bg-gray-50/80 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">{caseItem.caseId || caseItem.id}</p>
                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${statusMeta.badge}`}>
                          <span className={`h-2 w-2 rounded-full ${statusMeta.dot}`} />
                          {tt(status)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-gray-600">{tt(statusGuidance[status] || statusGuidance.Pending)}</p>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
