import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

// GET student by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query(
      `SELECT u.*, s.* 
       FROM users u 
       JOIN students s ON u.id = s.user_id 
       WHERE u.id = $1`,
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const student = result.rows[0]

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
  } catch (error) {
    console.error('Get student error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT update student
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      address,
      attendance,
      cgpa,
      photo
    } = await request.json()

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Update user
      await client.query(
        `UPDATE users 
         SET name = COALESCE($1, name),
             email = COALESCE($2, email),
             phone = COALESCE($3, phone)
         WHERE id = $4`,
        [name, email, phone, params.id]
      )

      // Update student
      await client.query(
        `UPDATE students 
         SET roll_no = COALESCE($1, roll_no),
             course = COALESCE($2, course),
             year = COALESCE($3, year),
             semester = COALESCE($4, semester),
             admission_date = COALESCE($5, admission_date),
             father_name = COALESCE($6, father_name),
             date_of_birth = COALESCE($7, date_of_birth),
             address = COALESCE($8, address),
             attendance = COALESCE($9, attendance),
             cgpa = COALESCE($10, cgpa),
             photo = COALESCE($11, photo)
         WHERE user_id = $12`,
        [
          rollNo,
          course,
          year,
          semester,
          admissionDate,
          fatherName,
          dateOfBirth,
          address,
          attendance,
          cgpa,
          photo,
          params.id
        ]
      )

      await client.query('COMMIT')

      // Fetch updated student
      const result = await pool.query(
        `SELECT u.*, s.* 
         FROM users u 
         JOIN students s ON u.id = s.user_id 
         WHERE u.id = $1`,
        [params.id]
      )

      const student = result.rows[0]

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
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Update student error:', error)
    if (error.code === '23505') { // Unique violation
      return NextResponse.json({ error: 'Email or roll number already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE student
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete student (cascade will delete user)
    const result = await pool.query('DELETE FROM students WHERE user_id = $1 RETURNING *', [params.id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Student deleted successfully' })
  } catch (error) {
    console.error('Delete student error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

