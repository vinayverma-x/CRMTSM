import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'
import { getUserFromRequest, isCounselorOrAdmin } from '@/lib/auth'

// GET all students
export async function GET(request: NextRequest) {
  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    // Get authenticated user
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login again.' }, { status: 401 })
    }

    // Only Admin, Super Admin, and Counselors can view all students
    // Students can view their own profile via /api/profile
    if (!isCounselorOrAdmin(user.role)) {
      return NextResponse.json({ error: 'Unauthorized. Only admins, super admins, and counselors can view all students.' }, { status: 403 })
    }
    const result = await pool.query(
      `SELECT u.id as user_id, u.name, u.email, u.role, u.status, u.created_at, u.last_login, u.phone,
              s.id as student_id, s.roll_no, s.course, s.year, s.semester, s.admission_date,
              s.father_name, s.date_of_birth, s.address, s.attendance, s.cgpa, s.photo
       FROM users u 
       JOIN students s ON u.id = s.user_id 
       ORDER BY u.created_at DESC`
    )

    console.log('Students query result:', result.rows.length, 'rows')
    console.log('Students data:', result.rows)

    const students = result.rows.map(row => ({
      id: row.user_id, // Use user_id as the main id
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status,
      createdAt: row.created_at?.split('T')[0] || row.created_at,
      lastLogin: row.last_login?.split('T')[0] || row.last_login,
      phone: row.phone,
      rollNo: row.roll_no,
      course: row.course,
      year: row.year,
      semester: row.semester,
      admissionDate: row.admission_date,
      fatherName: row.father_name,
      dateOfBirth: row.date_of_birth,
      address: row.address,
      attendance: row.attendance ? parseFloat(row.attendance) : null,
      cgpa: row.cgpa ? parseFloat(row.cgpa) : null,
      photo: row.photo
    }))

    console.log('Mapped students:', students.length)

    return NextResponse.json(students)
  } catch (error) {
    console.error('Get students error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create new student
export async function POST(request: NextRequest) {
  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }
    // Get authenticated user
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login again.' }, { status: 401 })
    }

    // Only Super Admin and Admin can create students
    if (!isCounselorOrAdmin(user.role)) {
      return NextResponse.json({ error: 'Unauthorized. Only admins and super admins can create students.' }, { status: 403 })
    }

    const {
      name,
      email,
      phone,
      rollNo,
      course,
      year,
      semester,
      admissionDate,
      fatherName,
      dateOfBirth,
      address,
      photo,
      password
    } = await request.json()

    if (!name || !email || !rollNo || !course || !year || !semester || !admissionDate || !password) {
      return NextResponse.json(
        { error: 'Name, email, rollNo, course, year, semester, admissionDate, and password are required' },
        { status: 400 }
      )
    }

    // Generate IDs
    const userId = Math.random().toString(36).substr(2, 9)
    const studentId = Math.random().toString(36).substr(2, 9)

    // Hash password (in production, use proper bcrypt)
    const passwordHash = password // For now, store as-is (NOT FOR PRODUCTION - should hash)

    // Start transaction
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Insert user first
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role, status, phone, created_by_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, name, email, passwordHash, 'STUDENT', 'ACTIVE', phone || null, user.id]
      )

      // Insert student details
      await client.query(
        `INSERT INTO students (id, user_id, roll_no, course, year, semester, admission_date, father_name, date_of_birth, address, photo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          studentId,
          userId, // user_id references users table
          rollNo,
          course,
          year,
          semester,
          admissionDate,
          fatherName || null,
          dateOfBirth || null,
          address || null,
          photo || null
        ]
      )

      await client.query('COMMIT')

      // Fetch the created student
      const result = await pool.query(
        `SELECT u.id as user_id, u.name, u.email, u.role, u.status, u.created_at, u.last_login, u.phone,
                s.id as student_id, s.roll_no, s.course, s.year, s.semester, s.admission_date,
                s.father_name, s.date_of_birth, s.address, s.attendance, s.cgpa, s.photo
         FROM users u 
         JOIN students s ON u.id = s.user_id 
         WHERE u.id = $1`,
        [userId]
      )

      const student = result.rows[0]

      return NextResponse.json({
        id: student.user_id,
        name: student.name,
        email: student.email,
        role: student.role,
        status: student.status,
        createdAt: student.created_at?.split('T')[0] || student.created_at,
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
      }, { status: 201 })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Create student error:', error)
    if (error.code === '23505') { // Unique violation
      return NextResponse.json({ error: 'Email or roll number already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

