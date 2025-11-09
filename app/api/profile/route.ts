import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'
import { getUserFromRequest } from '@/lib/auth'

// GET current user profile
export async function GET(request: NextRequest) {
  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login again.' }, { status: 401 })
    }

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [user.id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = result.rows[0]

    // If it's a student, get student details
    if (userData.role === 'STUDENT') {
      const studentResult = await pool.query(
        `SELECT u.*, s.* 
         FROM users u 
         JOIN students s ON u.id = s.user_id 
         WHERE u.id = $1`,
        [user.id]
      )

      if (studentResult.rows.length > 0) {
        const student = studentResult.rows[0]
        return NextResponse.json({
          id: student.id,
          name: student.name,
          email: student.email,
          role: student.role,
          status: student.status,
          createdAt: student.created_at?.split('T')[0] || student.created_at,
          lastLogin: student.last_login?.split('T')[0] || student.last_login,
          phone: student.phone,
          rollNo: student.roll_no,
          course: student.course,
          year: student.year,
          semester: student.semester,
          admissionDate: student.admission_date,
          fatherName: student.father_name,
          dateOfBirth: student.date_of_birth,
          address: student.address,
          attendance: student.attendance ? parseFloat(student.attendance) : null,
          cgpa: student.cgpa ? parseFloat(student.cgpa) : null,
          photo: student.photo
        })
      }
    }

    return NextResponse.json({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: userData.status,
      createdAt: userData.created_at?.split('T')[0] || userData.created_at,
      lastLogin: userData.last_login?.split('T')[0] || userData.last_login,
      assignedCounselorId: userData.assigned_counselor_id,
      createdById: userData.created_by_id,
      avatar: userData.avatar,
      phone: userData.phone
    })
  } catch (error: any) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT update current user profile
export async function PUT(request: NextRequest) {
  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login again.' }, { status: 401 })
    }

    const { name, email, phone, password } = await request.json()

    // Update user
    if (password) {
      // In production, hash the password
      await pool.query(
        `UPDATE users 
         SET name = COALESCE($1, name),
             email = COALESCE($2, email),
             phone = COALESCE($3, phone),
             password_hash = $4
         WHERE id = $5
         RETURNING *`,
        [name, email, phone, password, user.id]
      )
    } else {
      await pool.query(
        `UPDATE users 
         SET name = COALESCE($1, name),
             email = COALESCE($2, email),
             phone = COALESCE($3, phone)
         WHERE id = $4
         RETURNING *`,
        [name, email, phone, user.id]
      )
    }

    // If student, update student details if provided
    if (user.role === 'STUDENT') {
      const { rollNo, course, year, semester, fatherName, dateOfBirth, address } = await request.json()
      
      if (rollNo || course || year || semester || fatherName || dateOfBirth || address) {
        await pool.query(
          `UPDATE students 
           SET roll_no = COALESCE($1, roll_no),
               course = COALESCE($2, course),
               year = COALESCE($3, year),
               semester = COALESCE($4, semester),
               father_name = COALESCE($5, father_name),
               date_of_birth = COALESCE($6, date_of_birth),
               address = COALESCE($7, address)
           WHERE user_id = $8`,
          [rollNo, course, year, semester, fatherName, dateOfBirth, address, user.id]
        )
      }
    }

    // Fetch updated user
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [user.id])
    const userData = result.rows[0]

    // If student, get student details
    if (userData.role === 'STUDENT') {
      const studentResult = await pool.query(
        `SELECT u.*, s.* 
         FROM users u 
         JOIN students s ON u.id = s.user_id 
         WHERE u.id = $1`,
        [user.id]
      )

      if (studentResult.rows.length > 0) {
        const student = studentResult.rows[0]
        return NextResponse.json({
          id: student.id,
          name: student.name,
          email: student.email,
          role: student.role,
          status: student.status,
          createdAt: student.created_at?.split('T')[0] || student.created_at,
          lastLogin: student.last_login?.split('T')[0] || student.last_login,
          phone: student.phone,
          rollNo: student.roll_no,
          course: student.course,
          year: student.year,
          semester: student.semester,
          admissionDate: student.admission_date,
          fatherName: student.father_name,
          dateOfBirth: student.date_of_birth,
          address: student.address,
          attendance: student.attendance ? parseFloat(student.attendance) : null,
          cgpa: student.cgpa ? parseFloat(student.cgpa) : null,
          photo: student.photo
        })
      }
    }

    return NextResponse.json({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: userData.status,
      createdAt: userData.created_at?.split('T')[0] || userData.created_at,
      lastLogin: userData.last_login?.split('T')[0] || userData.last_login,
      assignedCounselorId: userData.assigned_counselor_id,
      createdById: userData.created_by_id,
      avatar: userData.avatar,
      phone: userData.phone
    })
  } catch (error: any) {
    console.error('Update profile error:', error)
    if (error.code === '23505') { // Unique violation
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

