import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'

// Test endpoint to check database contents
export async function GET(request: NextRequest) {
  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    // Get all users
    const usersResult = await pool.query('SELECT id, name, email, role, status FROM users ORDER BY role, name')
    
    // Get all students
    const studentsResult = await pool.query(`
      SELECT u.id as user_id, u.name, u.email, s.id as student_id, s.roll_no
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      WHERE u.role = 'STUDENT'
      ORDER BY u.name
    `)

    // Get counts
    const userCountResult = await pool.query('SELECT role, COUNT(*) as count FROM users GROUP BY role')
    const studentCountResult = await pool.query('SELECT COUNT(*) as count FROM students')

    return NextResponse.json({
      users: usersResult.rows,
      students: studentsResult.rows,
      counts: {
        byRole: userCountResult.rows.map(r => ({ role: r.role, count: parseInt(r.count) })),
        students: parseInt(studentCountResult.rows[0]?.count || '0')
      },
      totalUsers: usersResult.rows.length,
      totalStudents: studentsResult.rows.length
    })
  } catch (error: any) {
    console.error('Test database error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error?.message,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 })
  }
}

