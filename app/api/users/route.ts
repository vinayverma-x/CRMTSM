import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'

// GET all users (except students)
export async function GET(request: NextRequest) {
  await ensureDatabaseInitialized()
  try {
    const result = await pool.query(
      `SELECT * FROM users 
       WHERE role != 'STUDENT' 
       ORDER BY created_at DESC`
    )

    const users = result.rows.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.created_at?.split('T')[0] || user.created_at,
      lastLogin: user.last_login?.split('T')[0] || user.last_login,
      assignedCounselorId: user.assigned_counselor_id,
      createdById: user.created_by_id,
      avatar: user.avatar,
      phone: user.phone
    }))

    return NextResponse.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  await ensureDatabaseInitialized()
  try {
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

