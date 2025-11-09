import { NextRequest } from 'next/server'
import { UserRole } from './types'
import { verifyToken, extractTokenFromHeader } from './jwt'

// Helper function to get user from request using JWT token
export function getUserFromRequest(request: NextRequest): { id: string; role: UserRole; email: string } | null {
  // Get token from Authorization header
  const authHeader = request.headers.get('authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return null
  }

  // Verify JWT token
  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  return {
    id: payload.userId,
    role: payload.role,
    email: payload.email
  }
}

// Check if user has required role
export function hasRole(userRole: UserRole | null, requiredRoles: UserRole[]): boolean {
  if (!userRole) return false
  return requiredRoles.includes(userRole)
}

// Check if user is Super Admin
export function isSuperAdmin(userRole: UserRole | null): boolean {
  return userRole === 'SUPER_ADMIN'
}

// Check if user is Admin or Super Admin
export function isAdminOrSuperAdmin(userRole: UserRole | null): boolean {
  return userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'
}

// Check if user is Counselor
export function isCounselor(userRole: UserRole | null): boolean {
  return userRole === 'COUNSELOR'
}

// Check if user is Counselor, Admin, or Super Admin
export function isCounselorOrAdmin(userRole: UserRole | null): boolean {
  return userRole === 'COUNSELOR' || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'
}

// Check if user is Student
export function isStudent(userRole: UserRole | null): boolean {
  return userRole === 'STUDENT'
}

