export const ROLE = {
  NORMAL: 'normal',
  POLICE: 'police',
  BANK: 'bank'
}

export function getRoleFromPath(pathname = '') {
  if (pathname.includes('/login/police')) return ROLE.POLICE
  if (pathname.includes('/login/bank')) return ROLE.BANK
  return ROLE.NORMAL
}

export function getDashboardRoute(role) {
  if (role === ROLE.POLICE) return '/police-dashboard'
  if (role === ROLE.BANK) return '/bank-dashboard'
  return '/dashboard'
}

export function getLoginPathForRole(role) {
  if (role === ROLE.POLICE) return '/login/police'
  if (role === ROLE.BANK) return '/login/bank'
  return '/login'
}

export function isOfficialRole(role) {
  return role === ROLE.POLICE || role === ROLE.BANK
}