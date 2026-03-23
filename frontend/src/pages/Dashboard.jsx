import React from 'react'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { profile } = useAuth()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold sm:text-3xl">Dashboard</h1>
      <div className="rounded-xl bg-white p-4 shadow sm:p-6">
        <p className="mb-2 text-base sm:text-lg">Welcome, {profile?.name || 'User'}</p>
        <p className="text-sm text-gray-600">Role: {profile?.role || 'normal'}</p>
        <div className="mt-4 text-sm sm:text-base">Role-specific UI will appear here (Victim / Police / Bank).</div>
      </div>
    </div>
  )
}
