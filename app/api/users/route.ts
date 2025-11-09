import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'
import { getUserFromRequest, isSuperAdmin } from '@/lib/auth'

// GET all users (except students)
export async function GET(request: NextRequest) {
  // Only Super Admin can access user management
  const user = getUserFromRequest(request)
  if (!isSuperAdmin(user?.role || null)) {
    return NextResponse.json({ error: 'Unauthorized. Only Super Admin can access user management.' }, { status: 403 })
  }
  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }
    let result = await pool.query(
      `SELECT id, name, email, role, status, created_at, last_login, 
              assigned_counselor_id, created_by_id, avatar, phone
       FROM users 
       WHERE role != 'STUDENT' 
       ORDER BY created_at DESC`
    )
    
    // If no results, check what's in the database
    if (result.rows.length === 0) {
      const allUsers = await pool.query('SELECT id, role FROM users LIMIT 10')
      const nonStudentUsers = await pool.query(`SELECT id, role FROM users WHERE role != 'STUDENT' LIMIT 10`)
      console.log(`[GET /api/users] Debug info:`)
      console.log(`  - All users:`, allUsers.rows.map(r => ({ id: r.id, role: r.role })))
      console.log(`  - Non-student users:`, nonStudentUsers.rows.map(r => ({ id: r.id, role: r.role })))
    }

    console.log(`[GET /api/users] Found ${result.rows.length} users (non-students)`)

    const users = result.rows.map(user => ({
      id: String(user.id),
      name: user.name || '',
      email: user.email || '',
      role: user.role || '',
      status: user.status || 'ACTIVE',
      createdAt: user.created_at ? (user.created_at.split ? user.created_at.split('T')[0] : user.created_at) : null,
      lastLogin: user.last_login ? (user.last_login.split ? user.last_login.split('T')[0] : user.last_login) : null,
      assignedCounselorId: user.assigned_counselor_id ? String(user.assigned_counselor_id) : null,
      createdById: user.created_by_id ? String(user.created_by_id) : null,
      avatar: user.avatar || null,
      phone: user.phone || null
    }))

    console.log(`[GET /api/users] Returning ${users.length} mapped users`)
    return NextResponse.json(users)
  } catch (error: any) {
    console.error('Get users error:', error)
    console.error('Error details:', error?.message, error?.code)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  // Only Super Admin can create users
  const user = getUserFromRequest(request)
  if (!isSuperAdmin(user?.role || null)) {
    return NextResponse.json({ error: 'Unauthorized. Only Super Admin can create users.' }, { status: 403 })
  }

  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }
    const { name, email, role, phone, createdById } = await request.json()

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Name, email, and role are required' }, { status: 400 })
    }

    if (role === 'STUDENT') {
      return NextResponse.json({ error: 'Use /api/students to create students' }, { status: 400 })
    }

    // Generate ID
    const id = Math.random().toString(36).substr(2, 9)

    // Default password (in production, generate secure password and send via email)
    const passwordHash = 'password123' // In production, hash this properly

    const result = await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, status, created_by_id, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, name, email, passwordHash, role, 'ACTIVE', createdById || null, phone || null]
    )

    const user = result.rows[0]

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.created_at?.split('T')[0] || user.created_at,
      createdById: user.created_by_id,
      phone: user.phone
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create user error:', error)
    if (error.code === '23505') { // Unique violation
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

