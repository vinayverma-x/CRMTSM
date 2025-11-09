import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'

// GET payment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    const result = await pool.query(
      `SELECT p.*,
              s.roll_no, s.course,
              u.name as student_name,
              u2.name as created_by_name
       FROM payments p
       LEFT JOIN students s ON p.student_id = s.id
       LEFT JOIN users u ON s.user_id = u.id
       LEFT JOIN users u2 ON p.created_by_id = u2.id
       WHERE p.id = $1`,
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const payment = result.rows[0]

    return NextResponse.json({
      id: payment.id,
      studentId: payment.student_id,
      studentName: payment.student_name,
      rollNo: payment.roll_no,
      course: payment.course,
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
      createdBy: payment.created_by_name,
      createdAt: payment.created_at?.split('T')[0] || payment.created_at
    })
  } catch (error: any) {
    console.error('Get payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT update payment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    const {
      amount,
      paymentType,
      paymentMethod,
      paymentDate,
      dueDate,
      status,
      transactionId,
      receiptNumber,
      notes
    } = await request.json()

    const result = await pool.query(
      `UPDATE payments 
       SET amount = COALESCE($1, amount),
           payment_type = COALESCE($2, payment_type),
           payment_method = COALESCE($3, payment_method),
           payment_date = COALESCE($4, payment_date),
           due_date = COALESCE($5, due_date),
           status = COALESCE($6, status),
           transaction_id = COALESCE($7, transaction_id),
           receipt_number = COALESCE($8, receipt_number),
           notes = COALESCE($9, notes)
       WHERE id = $10
       RETURNING *`,
      [
        amount,
        paymentType,
        paymentMethod,
        paymentDate,
        dueDate,
        status,
        transactionId,
        receiptNumber,
        notes,
        params.id
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const payment = result.rows[0]

    // Get student and created by info
    const studentResult = await pool.query(
      `SELECT s.*, u.name as student_name
       FROM students s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [payment.student_id]
    )

    const student = studentResult.rows[0]
    const createdByName = payment.created_by_id ? 
      (await pool.query('SELECT name FROM users WHERE id = $1', [payment.created_by_id])).rows[0]?.name : 'System'

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
    })
  } catch (error: any) {
    console.error('Update payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    const result = await pool.query('DELETE FROM payments WHERE id = $1 RETURNING *', [params.id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Payment deleted successfully' })
  } catch (error: any) {
    console.error('Delete payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

