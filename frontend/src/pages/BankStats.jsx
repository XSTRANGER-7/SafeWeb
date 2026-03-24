import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase.js';
import { collection, onSnapshot } from 'firebase/firestore';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, ComposedChart } from 'recharts';
import { useI18n } from '../../i18n';

const COLORS = {
  pending: '#f59e0b',
  inProcess: '#3b82f6',
  fundsFrozen: '#8b5cf6',
  refunded: '#10b981',
  closed: '#6b7280'
};

export default function BankStatisticsPage() {
  const navigate = useNavigate();
  const { formatCurrency } = useI18n();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {},
    byFraudType: {},
    byMonth: {},
    byHour: Array(24).fill(0), // Initialize as array
    totalAmount: 0,
    averageAmount: 0,
    resolvedRate: 0,
    averageResolutionTime: 0,
    fundsFrozenCount: 0,
    refundedCount: 0,
    pendingInvestigationCount: 0,
    totalFrozenAmount: 0,
    totalRefundedAmount: 0
  });

  useEffect(() => {
    const q = collection(db, 'cases');
    const unsub = onSnapshot(q, 
      (snapshot) => {
        const casesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        calculateStats(casesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching cases:', error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  function calculateStats(casesData) {
    const statusCount = {};
    const fraudTypeCount = {};
    const monthCount = {};
    const hourCount = Array(24).fill(0); // 0-23 hours
    let totalAmount = 0;
    let resolvedCount = 0;
    let totalResolutionTime = 0;
    let fundsFrozenCount = 0;
    let refundedCount = 0;
    let pendingInvestigationCount = 0;
    let totalFrozenAmount = 0;
    let totalRefundedAmount = 0;

    casesData.forEach(c => {
      // Status count
      const status = c.status || 'Pending';
      statusCount[status] = (statusCount[status] || 0) + 1;

      // Fraud type count
      const fraudType = c.fraudType || 'Unknown';
      fraudTypeCount[fraudType] = (fraudTypeCount[fraudType] || 0) + 1;

      // Month count
      const date = new Date(c.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthCount[monthKey] = (monthCount[monthKey] || 0) + 1;

      // Hour count
      const hour = date.getHours();
      hourCount[hour]++;

      // Amount
      const caseAmount = c.transactions && c.transactions[0] && c.transactions[0].amount ? c.transactions[0].amount : 0;
      if (caseAmount > 0) {
        totalAmount += caseAmount;
      }

      // Bank-specific counts
      if (status === 'Funds Frozen') {
        fundsFrozenCount++;
        totalFrozenAmount += caseAmount;
      }
      if (status === 'Refunded') {
        refundedCount++;
        totalRefundedAmount += caseAmount;
      }
      if (status === 'Pending' || status === 'In Process') {
        pendingInvestigationCount++;
      }

      // Resolution time
      if (c.status === 'Closed' || c.status === 'Refunded') {
        resolvedCount++;
        if (c.updatedAt && c.createdAt) {
          const resolutionTime = (c.updatedAt - c.createdAt) / (1000 * 60 * 60 * 24); // days
          totalResolutionTime += resolutionTime;
        }
      }
    });

    const resolvedRate = casesData.length > 0 ? (resolvedCount / casesData.length) * 100 : 0;
    const avgResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;

    setStats({
      total: casesData.length,
      byStatus: statusCount,
      byFraudType: fraudTypeCount,
      byMonth: monthCount,
      byHour: hourCount,
      totalAmount,
      averageAmount: casesData.length > 0 ? totalAmount / casesData.length : 0,
      resolvedRate,
      averageResolutionTime: avgResolutionTime,
      fundsFrozenCount,
      refundedCount,
      pendingInvestigationCount,
      totalFrozenAmount,
      totalRefundedAmount
    });
  }

  const statusData = Object.entries(stats.byStatus).map(([name, value]) => ({
    name: name,
    value: value,
    color: COLORS[name.toLowerCase().replace(/\s+/g, '')] || COLORS.pending
  }));

  const fraudTypeData = Object.entries(stats.byFraudType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      value: value
    }));

  const monthlyData = Object.entries(stats.byMonth)
    .sort()
    .slice(-12)
    .map(([month, count]) => ({
      month: month.split('-')[1] + '/' + month.split('-')[0].slice(2),
      cases: count
    }));

  const hourlyData = Array.isArray(stats.byHour) 
    ? stats.byHour.map((count, hour) => ({
        hour: `${String(hour).padStart(2, '0')}:00`,
        cases: count
      }))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                onClick={() => navigate('/bank-dashboard')}
                className="flex items-center gap-2 self-start rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="flex flex-col gap-3 text-2xl font-bold text-transparent sm:flex-row sm:items-center sm:text-4xl bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-md sm:h-12 sm:w-12">
                  <svg className="h-6 w-6 text-white sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Bank Statistics Dashboard
              </h1>
            </div>
            <p className="text-sm text-gray-600">
              Bank Analytics & Financial Insights
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Cases</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Amount Lost</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Funds Frozen</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalFrozenAmount)}</p>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Refunded Amount</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRefundedAmount)}</p>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution Pie Chart */}
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

        {/* Fraud Type Bar Chart */}
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

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          Cases Trend (Last 12 Months)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', color: '#1f2937', padding: '8px 12px' }} />
            <Area type="monotone" dataKey="cases" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCases)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Cases by Hour of Day */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          Cases by Hour of Day
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="hour" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', color: '#1f2937', padding: '8px 12px' }} />
            <Area type="monotone" dataKey="cases" fill="#a78bfa" stroke="#8b5cf6" />
            <Line type="monotone" dataKey="cases" stroke="#8b5cf6" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium">Average Amount</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageAmount)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium">Funds Frozen</p>
            <p className="text-2xl font-bold text-gray-900">{stats.fundsFrozenCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium">Refunded Cases</p>
            <p className="text-2xl font-bold text-gray-900">{stats.refundedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium">Pending Investigation</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingInvestigationCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

