import React, { useState, useEffect } from 'react'
import { db } from '../../firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart
} from 'recharts'

const COLORS = {
  pending: '#f59e0b',
  inProcess: '#3b82f6',
  fundsFrozen: '#8b5cf6',
  refunded: '#10b981',
  closed: '#6b7280'
}

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    solved: 0,
    pending: 0,
    inProcess: 0,
    totalAmount: 0,
    averageAmount: 0,
    resolutionRate: 0,
    todayCases: 0,
    thisWeekCases: 0,
    thisMonthCases: 0,
    byFraudType: {},
    byStatus: {},
    dailyCases: {},
    monthlyTrend: {}
  })

  useEffect(() => {
    const q = collection(db, 'cases')
    const unsub = onSnapshot(q, 
      (snapshot) => {
        const casesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        calculateStats(casesData)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching cases:', error)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [])

  function calculateStats(casesData) {
    const now = Date.now()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStart = today.getTime()
    
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekStart = weekAgo.getTime()
    
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    const monthStart = monthAgo.getTime()

    const statusCount = {}
    const fraudTypeCount = {}
    const dailyCount = {}
    const monthlyCount = {}
    let totalAmount = 0
    let solvedCount = 0
    let todayCases = 0
    let weekCases = 0
    let monthCases = 0

    casesData.forEach(c => {
      const createdAt = c.createdAt || 0
      const status = c.status || 'Pending'
      const fraudType = c.fraudType || 'Unknown'
      const amount = c.transactions?.[0]?.amount || c.amountLost || 0

      // Status count
      statusCount[status] = (statusCount[status] || 0) + 1

      // Fraud type count
      fraudTypeCount[fraudType] = (fraudTypeCount[fraudType] || 0) + 1

      // Daily count (last 30 days)
      if (createdAt >= now - (30 * 24 * 60 * 60 * 1000)) {
        const date = new Date(createdAt)
        const dateKey = `${date.getDate()}/${date.getMonth() + 1}`
        dailyCount[dateKey] = (dailyCount[dateKey] || 0) + 1
      }

      // Monthly trend
      const date = new Date(createdAt)
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`
      monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1

      // Time-based counts
      if (createdAt >= todayStart) todayCases++
      if (createdAt >= weekStart) weekCases++
      if (createdAt >= monthStart) monthCases++

      // Amount
      totalAmount += amount

      // Solved cases (Refunded or Closed)
      if (status === 'Refunded' || status === 'Closed') {
        solvedCount++
      }
    })

    const resolutionRate = casesData.length > 0 ? (solvedCount / casesData.length) * 100 : 0

    setStats({
      total: casesData.length,
      solved: solvedCount,
      pending: statusCount['Pending'] || 0,
      inProcess: statusCount['In Process'] || 0,
      totalAmount,
      averageAmount: casesData.length > 0 ? totalAmount / casesData.length : 0,
      resolutionRate,
      todayCases,
      thisWeekCases: weekCases,
      thisMonthCases: monthCases,
      byFraudType: fraudTypeCount,
      byStatus: statusCount,
      dailyCases: dailyCount,
      monthlyTrend: monthlyCount
    })
  }

  // Prepare chart data
  const fraudTypeData = Object.entries(stats.byFraudType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      value
    }))

  const statusData = Object.entries(stats.byStatus).map(([name, value]) => ({
    name,
    value,
    color: COLORS[name.toLowerCase().replace(/\s+/g, '')] || COLORS.pending
  }))

  const dailyData = Object.entries(stats.dailyCases)
    .sort((a, b) => {
      const [dayA, monthA] = a[0].split('/').map(Number)
      const [dayB, monthB] = b[0].split('/').map(Number)
      if (monthA !== monthB) return monthA - monthB
      return dayA - dayB
    })
    .slice(-30)
    .map(([date, count]) => ({ date, cases: count }))

  const monthlyData = Object.entries(stats.monthlyTrend)
    .sort((a, b) => {
      const [monthA, yearA] = a[0].split('/').map(Number)
      const [monthB, yearB] = b[0].split('/').map(Number)
      if (yearA !== yearB) return yearA - yearB
      return monthA - monthB
    })
    .slice(-12)
    .map(([month, count]) => ({ month, cases: count }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
          <h1 className="mb-2 flex flex-col gap-3 text-2xl font-bold text-transparent sm:flex-row sm:items-center sm:text-4xl bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-md sm:h-12 sm:w-12">
              <svg className="h-6 w-6 text-white sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            Cyber Crime Analytics - Odisha
          </h1>
          <p className="text-base text-gray-600 sm:text-lg">Real-time statistics and insights</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">Total Cases</p>
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">All time cases</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">Solved Cases</p>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.solved}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.resolutionRate.toFixed(1)}% resolution rate</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">Today's Cases</p>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.todayCases}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.thisWeekCases} this week</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">Total Amount Lost</p>
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">₹{stats.totalAmount.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-500 mt-1">Avg: ₹{stats.averageAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            Cases by Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', color: '#1f2937', padding: '8px 12px' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Fraud Types */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            Top 10 Fraud Types
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fraudTypeData} layout="vertical" margin={{ left: 100, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} width={100} />
              <Tooltip contentStyle={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', color: '#1f2937', padding: '8px 12px' }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Cases Trend */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          Daily Cases Trend (Last 30 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dailyData}>
            <defs>
              <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', color: '#1f2937', padding: '8px 12px' }} />
            <Area type="monotone" dataKey="cases" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCases)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          Monthly Trend (Last 12 Months)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', color: '#1f2937', padding: '8px 12px' }} />
            <Area type="monotone" dataKey="cases" fill="#a78bfa" stroke="#8b5cf6" />
            <Line type="monotone" dataKey="cases" stroke="#8b5cf6" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-2">Pending Cases</p>
          <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting investigation</p>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-2">In Process</p>
          <p className="text-3xl font-bold text-blue-600">{stats.inProcess}</p>
          <p className="text-xs text-gray-500 mt-1">Under investigation</p>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium mb-2">This Month</p>
          <p className="text-3xl font-bold text-purple-600">{stats.thisMonthCases}</p>
          <p className="text-xs text-gray-500 mt-1">Cases reported this month</p>
        </div>
      </div>
    </div>
  )
}
