import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'
import { getUserFromRequest, isStudent, isAdminOrSuperAdmin } from '@/lib/auth'

// GET all documents
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

    // Only students can access documents
    if (!isStudent(user.role) && !isAdminOrSuperAdmin(user.role)) {
      return NextResponse.json({ error: 'Unauthorized. Only students, admins, and super admins can access documents.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const documentType = searchParams.get('documentType')

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
      SELECT d.*,
             s.roll_no, s.course,
             u.name as student_name
      FROM documents d
      LEFT JOIN students s ON d.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    // If student, only show their own documents
    if (isStudent(user.role) && studentRecordId) {
      query += ` AND d.student_id = $${paramIndex}`
      params.push(studentRecordId)
      paramIndex++
    } else if (studentId && !isStudent(user.role)) {
      // Only allow filtering by studentId if user is Admin or Super Admin
      query += ` AND d.student_id = $${paramIndex}`
      params.push(studentId)
      paramIndex++
    }

    if (documentType) {
      query += ` AND d.document_type = $${paramIndex}`
      params.push(documentType)
      paramIndex++
    }

    query += ' ORDER BY d.uploaded_at DESC'

    const result = await pool.query(query, params)

    const documents = result.rows.map(row => ({
      id: row.id,
      studentId: row.student_id,
      studentName: row.student_name,
      rollNo: row.roll_no,
      course: row.course,
      documentType: row.document_type,
      documentName: row.document_name,
      filePath: row.file_path,
      fileSize: row.file_size ? parseFloat(row.file_size) : null,
      mimeType: row.mime_type,
      uploadedAt: row.uploaded_at?.split('T')[0] || row.uploaded_at,
      status: row.status,
      notes: row.notes
    }))

    return NextResponse.json(documents)
  } catch (error: any) {
    console.error('Get documents error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST upload new document
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

    // Only students can upload documents
    if (!isStudent(user.role)) {
      return NextResponse.json({ error: 'Unauthorized. Only students can upload documents.' }, { status: 403 })
    }

    const {
      studentId,
      documentType,
      documentName,
      filePath,
      fileSize,
      mimeType,
      status,
      notes
    } = await request.json()

    // Get student record ID
    const studentResult = await pool.query(
      `SELECT s.id FROM students s WHERE s.user_id = $1`,
      [user.id]
    )
    if (studentResult.rows.length === 0) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 })
    }

    const finalStudentId = studentId || studentResult.rows[0].id

    // Verify student can only upload for themselves
    if (finalStudentId !== studentResult.rows[0].id) {
      return NextResponse.json({ error: 'Unauthorized. You can only upload documents for yourself.' }, { status: 403 })
    }

    if (!documentType || !documentName || !filePath) {
      return NextResponse.json(
        { error: 'DocumentType, documentName, and filePath are required' },
        { status: 400 }
      )
    }

    const id = Math.random().toString(36).substr(2, 9)

    const result = await pool.query(
      `INSERT INTO documents (
        id, student_id, document_type, document_name, file_path,
        file_size, mime_type, status, notes, uploaded_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        id,
        finalStudentId,
        documentType,
        documentName,
        filePath,
        fileSize || null,
        mimeType || null,
        status || 'Pending',
        notes || null
      ]
    )

    const document = result.rows[0]

    // Get student info
    const studentInfoResult = await pool.query(
      `SELECT s.*, u.name as student_name
       FROM students s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [finalStudentId]
    )

    const studentInfo = studentInfoResult.rows[0]

    return NextResponse.json({
      id: document.id,
      studentId: document.student_id,
      studentName: studentInfo?.student_name,
      rollNo: studentInfo?.roll_no,
      course: studentInfo?.course,
      documentType: document.document_type,
      documentName: document.document_name,
      filePath: document.file_path,
      fileSize: document.file_size ? parseFloat(document.file_size) : null,
      mimeType: document.mime_type,
      uploadedAt: document.uploaded_at?.split('T')[0] || document.uploaded_at,
      status: document.status,
      notes: document.notes
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create document error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

