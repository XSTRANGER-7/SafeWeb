import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboardRoute, getLoginPathForRole } from '../auth/roleUtils'

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()
  const requiresRoleCheck = allowedRoles.length > 0

  if (loading) {
    return <div className="py-10 text-center text-gray-500">Checking session...</div>
  }

  if (!user) {
    const loginPath = getLoginPathForRole(requiresRoleCheck ? allowedRoles[0] : undefined)
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  if (!requiresRoleCheck) {
    return children
  }

  const userRole = profile?.role

  if (!userRole || !allowedRoles.includes(userRole)) {
    const safeDestination = userRole ? getDashboardRoute(userRole) : '/login'
    return <Navigate to={safeDestination} replace />
  }

  return children
}
