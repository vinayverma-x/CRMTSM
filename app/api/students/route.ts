import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'

// GET all students
export async function GET(request: NextRequest) {
  await ensureDatabaseInitialized()
  try {
    const result = await pool.query(
      `SELECT u.*, s.* 
       FROM users u 
       JOIN students s ON u.id = s.user_id 
       ORDER BY u.created_at DESC`
    )

    const students = result.rows.map(row => ({
      id: row.id,
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

    return NextResponse.json(students)
  } catch (error) {
    console.error('Get students error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create new student
export async function POST(request: NextRequest) {
  await ensureDatabaseInitialized()
  try {
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
      address
    } = await request.json()

    if (!name || !email || !rollNo || !course || !year || !semester || !admissionDate) {
      return NextResponse.json(
        { error: 'Name, email, rollNo, course, year, semester, and admissionDate are required' },
        { status: 400 }
      )
    }

    // Generate ID
    const id = Math.random().toString(36).substr(2, 9)

    // Default password (in production, generate secure password and send via email)
    const passwordHash = 'password123' // In production, hash this properly

    // Start transaction
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Insert user first
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role, status, phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, name, email, passwordHash, 'STUDENT', 'ACTIVE', phone || null]
      )

      // Insert student details
      await client.query(
        `INSERT INTO students (id, user_id, roll_no, course, year, semester, admission_date, father_name, date_of_birth, address)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          id,
          id, // user_id same as id
          rollNo,
          course,
          year,
          semester,
          admissionDate,
          fatherName || null,
          dateOfBirth || null,
          address || null
        ]
      )

      await client.query('COMMIT')

      // Fetch the created student
      const result = await pool.query(
        `SELECT u.*, s.* 
         FROM users u 
         JOIN students s ON u.id = s.user_id 
         WHERE u.id = $1`,
        [id]
      )

      const student = result.rows[0]

      return NextResponse.json({
        id: student.id,
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

