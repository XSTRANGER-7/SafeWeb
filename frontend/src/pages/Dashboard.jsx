import React from 'react'
import { useAuth } from '../context/AuthContext'
export default function Dashboard() {
  const { profile } = useAuth()
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <div className="bg-white p-6 rounded shadow">
        <p className="mb-2">Welcome, {profile?.name || 'User'}</p>
        <p className="text-sm text-gray-600">Role: {profile?.role || 'normal'}</p>
        <div className="mt-4">Role-specific UI will appear here (Victim / Police / Bank).</div>
      </div>
    </div>
  )
}
