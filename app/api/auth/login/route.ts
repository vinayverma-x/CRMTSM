import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'

export async function POST(request: NextRequest) {
  try {
    // Ensure database is initialized
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      console.error('Database initialization failed')
      return NextResponse.json({ error: 'Database initialization failed. Please try again.' }, { status: 500 })
    }
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find user by email
    const userResult = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    )

    if (userResult.rows.length === 0) {
      // Check if it's a student
      const studentResult = await pool.query(
        `SELECT u.*, s.* 
         FROM users u 
         JOIN students s ON u.id = s.user_id 
         WHERE LOWER(u.email) = LOWER($1)`,
        [email]
      )

      if (studentResult.rows.length === 0) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }

      const student = studentResult.rows[0]
      
      // For demo, accept any password (in production, verify password hash)
      // if (!await bcrypt.compare(password, student.password_hash)) {
      //   return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      // }

      // Update last login
      await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [student.id]
      )

      // Return student data
      return NextResponse.json({
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role,
        status: student.status,
        createdAt: student.created_at,
        lastLogin: new Date().toISOString().split('T')[0],
        phone: student.phone,
        rollNo: student.roll_no,
        course: student.course,
        year: student.year,
        semester: student.semester,
        admissionDate: student.admission_date,
        fatherName: student.father_name,
        dateOfBirth: student.date_of_birth,
        address: student.address,
        attendance: student.attendance,
        cgpa: student.cgpa,
        photo: student.photo
      })
    }

    const user = userResult.rows[0]

    // For demo, accept any password (in production, verify password hash)
    // if (!await bcrypt.compare(password, user.password_hash)) {
    //   return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    // }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Your account has been suspended. Please contact administrator.' },
        { status: 403 }
      )
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    )

    // Return user data
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.created_at,
      lastLogin: new Date().toISOString().split('T')[0],
      assignedCounselorId: user.assigned_counselor_id,
      createdById: user.created_by_id,
      avatar: user.avatar,
      phone: user.phone
    })
  } catch (error: any) {
    console.error('Login error:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 })
  }
}

