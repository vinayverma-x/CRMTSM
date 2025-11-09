import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'
import { getUserFromRequest, isAdminOrSuperAdmin, isStudent } from '@/lib/auth'

// GET all payments
export async function GET(request: NextRequest) {
  // Only Admin, Super Admin, and Students can access payments
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Please login again.' }, { status: 401 })
  }
  
  // Students can only see their own payments, handled in query
  if (user.role !== 'STUDENT' && !isAdminOrSuperAdmin(user.role)) {
    return NextResponse.json({ error: 'Unauthorized. Only Admin, Super Admin, and Students can access payments.' }, { status: 403 })
  }

  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const status = searchParams.get('status')

    // If student, get their student_id from users table
    let studentRecordId: string | null = null
    if (isStudent(user.role)) {
      const studentResult = await pool.query(
        `SELECT s.id FROM students s WHERE s.user_id = $1`,
        [user.id]
      )
      if (studentResult.rows.length > 0) {
        studentRecordId = studentResult.rows[0].id
      } else {
        return NextResponse.json({ error: 'Student record not found' }, { status: 404 })
      }
    }

    let query = `
      SELECT p.*,
             s.roll_no, s.course,
             u.name as student_name,
             u2.name as created_by_name
      FROM payments p
      LEFT JOIN students s ON p.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN users u2 ON p.created_by_id = u2.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    // If student, only show their own payments
    if (isStudent(user.role) && studentRecordId) {
      query += ` AND p.student_id = $${paramIndex}`
      params.push(studentRecordId)
      paramIndex++
    } else if (studentId && !isStudent(user.role)) {
      // Only allow filtering by studentId if user is Admin or Super Admin
      query += ` AND p.student_id = $${paramIndex}`
      params.push(studentId)
      paramIndex++
    }

    if (status) {
      query += ` AND p.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    query += ' ORDER BY p.payment_date DESC, p.created_at DESC'

    const result = await pool.query(query, params)

    const payments = result.rows.map(row => ({
      id: row.id,
      studentId: row.student_id,
      studentName: row.student_name,
      rollNo: row.roll_no,
      course: row.course,
      amount: parseFloat(row.amount),
      paymentType: row.payment_type,
      paymentMethod: row.payment_method,
      paymentDate: row.payment_date,
      dueDate: row.due_date,
      status: row.status,
      transactionId: row.transaction_id,
      receiptNumber: row.receipt_number,
      notes: row.notes,
      createdById: row.created_by_id,
      createdBy: row.created_by_name,
      createdAt: row.created_at?.split('T')[0] || row.created_at
    }))

    return NextResponse.json(payments)
  } catch (error: any) {
    console.error('Get payments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create new payment
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

    const {
      studentId,
      amount,
      paymentType,
      paymentMethod,
      paymentDate,
      dueDate,
      status,
      transactionId,
      receiptNumber,
      notes,
      createdById
    } = await request.json()

    // If student, they can only create payments for themselves
    let finalStudentId = studentId
    if (isStudent(user.role)) {
      const studentResult = await pool.query(
        `SELECT s.id FROM students s WHERE s.user_id = $1`,
        [user.id]
      )
      if (studentResult.rows.length === 0) {
        return NextResponse.json({ error: 'Student record not found' }, { status: 404 })
      }
      finalStudentId = studentResult.rows[0].id
    }

    if (!finalStudentId || !amount || !paymentType || !paymentMethod || !paymentDate) {
      return NextResponse.json(
        { error: 'StudentId, amount, paymentType, paymentMethod, and paymentDate are required' },
        { status: 400 }
      )
    }

    const id = Math.random().toString(36).substr(2, 9)

    const result = await pool.query(
      `INSERT INTO payments (
        id, student_id, amount, payment_type, payment_method, payment_date,
        due_date, status, transaction_id, receipt_number, notes, created_by_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        id,
        finalStudentId,
        amount,
        paymentType,
        paymentMethod,
        paymentDate,
        dueDate || null,
        status || 'Pending',
        transactionId || null,
        receiptNumber || null,
        notes || null,
        createdById || null
      ]
    )

    const payment = result.rows[0]

    // Get student info
    const studentResult = await pool.query(
      `SELECT s.*, u.name as student_name
       FROM students s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [finalStudentId]
    )

    const student = studentResult.rows[0]

    // Get created by name
    let createdByName = 'System'
    if (createdById) {
      const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [createdById])
      createdByName = userResult.rows[0]?.name || 'System'
    }

    return NextResponse.json({
      id: payment.id,
      studentId: payment.student_id,
      studentName: student?.student_name,
      rollNo: student?.roll_no,
      course: student?.course,
      amount: parseFloat(payment.amount),
      paymentType: payment.payment_type,
      paymentMethod: payment.payment_method,
      paymentDate: payment.payment_date,
      dueDate: payment.due_date,
      status: payment.status,
      transactionId: payment.transaction_id,
      receiptNumber: payment.receipt_number,
      notes: payment.notes,
      createdById: payment.created_by_id,
      createdBy: createdByName,
      createdAt: payment.created_at?.split('T')[0] || payment.created_at
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

