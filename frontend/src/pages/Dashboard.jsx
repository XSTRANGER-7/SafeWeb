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
import { db, firebaseStatus, getFirebaseSetupError } from '../../firebase'
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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{title}</p>
      <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1.5 text-xs text-gray-500">{subtitle}</p>
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
    if (!firebaseStatus.initialized || !user?.uid) {
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

  if (!firebaseStatus.initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">{getFirebaseSetupError()}</p>
        </div>
      </div>
    )
  }

  const displayName = profile?.name || user?.displayName || tt('User')
  const focusedCaseId = searchParams.get('caseId')
  const sortedCases = [...cases].sort((a, b) => {
    const aFocused = focusedCaseId && (a.caseId === focusedCaseId || a.id === focusedCaseId)
    const bFocused = focusedCaseId && (b.caseId === focusedCaseId || b.id === focusedCaseId)
    if (aFocused && !bFocused) return -1
    if (!aFocused && bFocused) return 1
    return getLatestCaseTimestamp(b) - getLatestCaseTimestamp(a)
  })

  const totalApplications = sortedCases.length
  const pendingApplications = sortedCases.filter((c) => (c.status || 'Pending') === 'Pending').length
  const activeApplications = sortedCases.filter((c) => ['Pending', 'In Process', 'Funds Frozen'].includes(c.status || 'Pending')).length
  const resolvedApplications = sortedCases.filter((c) => ['Refunded', 'Closed'].includes(c.status || 'Pending')).length
  const totalReportedLoss = sortedCases.reduce((sum, c) => sum + getAmount(c), 0)
  const averageClaimValue = totalApplications ? Math.round(totalReportedLoss / totalApplications) : 0
  const resolutionRate = totalApplications ? Math.round((resolvedApplications / totalApplications) * 100) : 0

  const statusData = STATUS_ORDER
    .map((status) => ({
      status,
      name: tt(status),
      value: sortedCases.filter((c) => (c.status || 'Pending') === status).length,
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
      submitted: sortedCases.filter((c) => {
        const d = new Date(getTimestamp(c.createdAt))
        return d.getMonth() === month && d.getFullYear() === year
      }).length,
      resolved: sortedCases.filter((c) => {
        if (!['Refunded', 'Closed'].includes(c.status || 'Pending')) return false
        const d = new Date(getTimestamp(c.updatedAt || c.createdAt))
        return d.getMonth() === month && d.getFullYear() === year
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
    .slice(0, 3)

  return (
    <div className="space-y-5">

      {/* Hero Card full width */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-amber-900 p-6 text-white shadow-2xl sm:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.35),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.2),transparent_30%)]" />
        <div className="relative">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                {tt('Personal Dashboard')}
              </span>
              <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                {tt(`Welcome back, ${displayName}`)}
              </h1>
              <p className="mt-2 text-sm text-slate-300">{tt('Track your complaints and monitor live status updates.')}</p>
            </div>
            <div className="shrink-0 text-right sm:min-w-[200px]">
              <p className="text-[11px] uppercase tracking-widest text-white/60">{tt('Today')}</p>
              <p className="mt-1.5 text-sm font-semibold text-white">
                {formatDate(Date.now(), locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="mt-1.5 text-xs text-slate-300">
                {activeApplications > 0
                  ? tt(`${activeApplications} active ${activeApplications === 1 ? 'application' : 'applications'}`)
                  : tt('No active cases right now')}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4">
              <p className="text-[11px] uppercase tracking-widest text-white/55">{tt('Resolution Rate')}</p>
              <p className="mt-2 text-3xl font-bold">{formatNumber(resolutionRate)}%</p>
              <p className="mt-1 text-xs text-slate-300">{tt('Across all applications')}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4">
              <p className="text-[11px] uppercase tracking-widest text-white/55">{tt('Reported Amount')}</p>
              <p className="mt-2 text-3xl font-bold">{formatCurrency(totalReportedLoss, locale)}</p>
              <p className="mt-1 text-xs text-slate-300">{tt('Combined reported loss')}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4">
              <p className="text-[11px] uppercase tracking-widest text-white/55">{tt('Average Claim')}</p>
              <p className="mt-2 text-3xl font-bold">{formatCurrency(averageClaimValue, locale)}</p>
              <p className="mt-1 text-xs text-slate-300">{tt('Per application')}</p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-4">
            <Link
              to="/cyber-fraud-report"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-7 py-3.5 text-base font-semibold text-slate-950 transition hover:bg-amber-50"
            >
              {tt('File New Complaint')}
            </Link>
            <Link
              to="/cyber-fraud-report?view=track"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
            >
              {tt('Open Tracker')}
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {tt(error)}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard title={tt('Submitted')} value={formatNumber(totalApplications)} subtitle={tt('Total complaints')} />
        <StatCard title={tt('Pending')} value={formatNumber(pendingApplications)} subtitle={tt('Awaiting review')} />
        <StatCard title={tt('Active')} value={formatNumber(activeApplications)} subtitle={tt('Under processing')} />
        <StatCard title={tt('Resolved')} value={formatNumber(resolvedApplications)} subtitle={tt('Closed or refunded')} />
      </div>

      {/* Row: Analytics (left, 2/3 wide) + Recent Activity (right, 1/3 wide) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Analytics (left, 2/3 wide) */}
        <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{tt('Analytics')}</p>
              <h2 className="mt-1 text-xl font-semibold text-gray-900">{tt('Application Performance')}</h2>
            </div>
            <p className="text-xs text-gray-400">{tt('Live view across all submitted applications')}</p>
          </div>
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-gray-800">{tt('Submission Trend')}</h3>
              <p className="mt-0.5 text-xs text-gray-400">{tt('Last 6 months')}</p>
              <div className="mt-4">
                {totalApplications === 0 ? (
                  <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 text-center text-sm text-gray-400">
                    {tt('File your first application to unlock trend analytics.')}
                  </div>
                ) : (
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyTrend}>
                        <defs>
                          <linearGradient id="dashSubmitted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                          </linearGradient>
                          <linearGradient id="dashResolved" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={24} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="submitted" name={tt('Submitted')} stroke="#f59e0b" fill="url(#dashSubmitted)" strokeWidth={2.5} />
                        <Area type="monotone" dataKey="resolved" name={tt('Resolved')} stroke="#10b981" fill="url(#dashResolved)" strokeWidth={2.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-gray-800">{tt('Status Mix')}</h3>
              <p className="mt-0.5 text-xs text-gray-400">{tt('Applications by current status')}</p>
              <div className="mt-4">
                {statusData.length === 0 ? (
                  <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 text-center text-sm text-gray-400">
                    {tt('Status insights will appear after your first complaint.')}
                  </div>
                ) : (
                  <>
                    <div className="h-[140px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={44} outerRadius={66} paddingAngle={3}>
                            {statusData.map((item) => (
                              <Cell key={item.name} fill={item.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {statusData.map((item) => (
                        <div key={item.status} className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: item.fill }} />
                            <span className="text-xs font-medium text-gray-600">{item.name}</span>
                          </div>
                          <span className="text-xs font-bold text-gray-900">{formatNumber(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity (right, 1/3 wide) */}
        <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{tt('Recent Activity')}</p>
              <h2 className="mt-1 text-xl font-semibold text-gray-900">{tt('Latest Updates')}</h2>
            </div>
            {recentActivity.length > 0 && (
              <Link
                to="/cyber-fraud-report?view=track"
                className="shrink-0 text-sm font-semibold text-amber-600 transition hover:text-amber-700"
              >
                {tt('View all')} →
              </Link>
            )}
          </div>

          {recentActivity.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-10 text-center text-sm text-gray-400">
              {tt('Activity will appear here once a case is created.')}
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {recentActivity.map((item) => {
                const statusMeta = getStatusMeta(item.status)
                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-gray-50/60 p-3.5 transition hover:border-gray-200 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="mt-0.5 block h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: statusMeta.color }} />
                        <p className="truncate text-sm font-semibold text-gray-900">{tt(item.fraudType)}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusMeta.badge}`}>
                        {tt(item.status)}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-xs leading-5 text-gray-500">{tt(item.note)}</p>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-400">
                      <span className="font-semibold text-gray-600">{item.caseId}</span>
                      <span>•</span>
                      <span>{formatDateTime(item.at, locale)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Status Tracker — full width below */}
      <div className="rounded-[28px] border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{tt('Status Tracker')}</p>
              <h2 className="mt-1 text-xl font-semibold text-gray-900">{tt('All Application Status')}</h2>
            </div>
            <Link
              to="/cyber-fraud-report?view=track"
              className="inline-flex w-fit items-center justify-center rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
            >
              {tt('Open Detailed Tracker')}
            </Link>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {loading ? (
            <div className="flex min-h-[160px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-4 border-t-4 border-amber-500" />
                <p className="mt-3 text-sm text-gray-400">{tt('Loading your applications...')}</p>
              </div>
            </div>
          ) : sortedCases.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-10 text-center">
              <h3 className="text-lg font-semibold text-gray-900">{tt('No applications yet')}</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-gray-400">
                {tt('File your first complaint to start tracking its status.')}
              </p>
              <Link
                to="/cyber-fraud-report"
                className="mt-5 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-amber-600 hover:to-yellow-600"
              >
                {tt('File Your First Complaint')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedCases.map((caseItem) => {
                const status = caseItem.status || 'Pending'
                const statusMeta = getStatusMeta(status)
                const latestEntry = getLatestTimelineEntry(caseItem)
                const latestUpdate = latestEntry?.note || latestEntry?.description || statusMeta.summary
                const lastUpdatedAt = latestEntry?.at || latestEntry?.timestamp || caseItem.updatedAt || caseItem.createdAt
                const isFocused = focusedCaseId && (caseItem.caseId === focusedCaseId || caseItem.id === focusedCaseId)

                return (
                  <div
                    key={caseItem.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition-all ${isFocused ? 'border-amber-300 bg-amber-50/60 ring-2 ring-amber-100' : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-white'}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-gray-900">
                            {tt(caseItem.fraudType || 'Cyber Fraud Complaint')}
                          </h3>
                          {isFocused && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-700">
                              {tt('Focused')}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {tt('Case ID')}: <span className="font-semibold text-gray-600">{caseItem.caseId || caseItem.id}</span>
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusMeta.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                        {tt(status)}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        { label: tt('Filed On'), value: formatDate(caseItem.createdAt, locale) },
                        { label: tt('Last Updated'), value: formatDateTime(lastUpdatedAt, locale) },
                        { label: tt('Amount'), value: formatCurrency(getAmount(caseItem), locale) },
                        { label: tt('Stage'), value: tt(statusMeta.summary) }
                      ].map(({ label, value }) => (
                        <div key={label} className="rounded-xl border border-gray-100 bg-white p-3">
                          <p className="text-[10px] uppercase tracking-wider text-gray-400">{label}</p>
                          <p className="mt-1 text-xs font-semibold text-gray-800">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3">
                      <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-gray-400">
                        <span>{tt('Progress')}</span>
                        <span>{formatNumber(statusMeta.progress)}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${statusMeta.progress}%`, background: `linear-gradient(90deg, ${statusMeta.color}, ${statusMeta.color}BB)` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">{tt('Latest Update')}</p>
                      <p className="mt-1 text-xs text-gray-600">{tt(latestUpdate)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}