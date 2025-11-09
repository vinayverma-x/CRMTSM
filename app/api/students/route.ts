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
    // First, try a simple JOIN
    let result = await pool.query(
      `SELECT u.id as user_id, u.name, u.email, u.role, u.status, u.created_at, u.last_login, u.phone,
              s.id as student_id, s.roll_no, s.course, s.year, s.semester, s.admission_date,
              s.father_name, s.date_of_birth, s.address, s.attendance, s.cgpa, s.photo
       FROM users u 
       INNER JOIN students s ON u.id = s.user_id
       WHERE u.role = 'STUDENT'
       ORDER BY u.created_at DESC`
    )

    console.log(`[GET /api/students] Found ${result.rows.length} students with simple JOIN`)
    
    // If no results, try with type casting
    if (result.rows.length === 0) {
      console.log(`[GET /api/students] Trying with type casting...`)
      try {
        result = await pool.query(
          `SELECT u.id as user_id, u.name, u.email, u.role, u.status, u.created_at, u.last_login, u.phone,
                  s.id as student_id, s.roll_no, s.course, s.year, s.semester, s.admission_date,
                  s.father_name, s.date_of_birth, s.address, s.attendance, s.cgpa, s.photo
           FROM users u 
           INNER JOIN students s ON CAST(u.id AS TEXT) = CAST(s.user_id AS TEXT)
           WHERE u.role = 'STUDENT'
           ORDER BY u.created_at DESC`
        )
        console.log(`[GET /api/students] Found ${result.rows.length} students with type casting`)
      } catch (castError) {
        console.error(`[GET /api/students] Type casting failed:`, castError)
      }
    }
    
    // If still no results, check what's in the database
    if (result.rows.length === 0) {
      const studentCount = await pool.query('SELECT COUNT(*) as count FROM students')
      const userStudentCount = await pool.query(`SELECT COUNT(*) as count FROM users WHERE role = 'STUDENT'`)
      const sampleStudents = await pool.query('SELECT id, user_id FROM students LIMIT 5')
      const sampleUsers = await pool.query(`SELECT id, role FROM users WHERE role = 'STUDENT' LIMIT 5`)
      console.log(`[GET /api/students] Debug info:`)
      console.log(`  - Total students in students table: ${studentCount.rows[0].count}`)
      console.log(`  - Total students in users table: ${userStudentCount.rows[0].count}`)
      console.log(`  - Sample student IDs:`, sampleStudents.rows.map(r => ({ id: r.id, user_id: r.user_id })))
      console.log(`  - Sample user IDs:`, sampleUsers.rows.map(r => ({ id: r.id, role: r.role })))
    }

    const students = result.rows.map(row => ({
      id: String(row.user_id), // Ensure it's a string
      name: row.name || '',
      email: row.email || '',
      role: row.role || 'STUDENT',
      status: row.status || 'ACTIVE',
      createdAt: row.created_at ? (row.created_at.split ? row.created_at.split('T')[0] : row.created_at) : null,
      lastLogin: row.last_login ? (row.last_login.split ? row.last_login.split('T')[0] : row.last_login) : null,
      phone: row.phone || null,
      rollNo: row.roll_no || '',
      course: row.course || '',
      year: row.year || '',
      semester: row.semester || '',
      admissionDate: row.admission_date || null,
      fatherName: row.father_name || null,
      dateOfBirth: row.date_of_birth || null,
      address: row.address || null,
      attendance: row.attendance ? parseFloat(String(row.attendance)) : null,
      cgpa: row.cgpa ? parseFloat(String(row.cgpa)) : null,
      photo: row.photo || null
    }))

    console.log(`[GET /api/students] Returning ${students.length} mapped students`)
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

