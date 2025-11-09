import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'
import { getUserFromRequest, isCounselor, isStudent } from '@/lib/auth'

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

    // Build base query with counselor filter if needed
    let totalLeadsQuery = 'SELECT COUNT(*) FROM leads WHERE 1=1'
    let newLeadsQuery = `SELECT COUNT(*) FROM leads WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'`
    let convertedLeadsQuery = "SELECT COUNT(*) FROM leads WHERE status = 'Converted'"
    let leadsBySourceQuery = `SELECT source, COUNT(*) as count FROM leads WHERE 1=1`
    let leadsByStatusQuery = `SELECT status, COUNT(*) as count FROM leads WHERE 1=1`
    const params: any[] = []
    let paramIndex = 1

    if (isCounselor(user.role)) {
      const filter = ` AND assigned_counselor_id = $${paramIndex}`
      totalLeadsQuery += filter
      newLeadsQuery += filter
      convertedLeadsQuery += filter
      leadsBySourceQuery += filter
      leadsByStatusQuery += filter
      params.push(user.id)
      paramIndex++
    }

    // Get total leads
    const totalLeadsResult = await pool.query(totalLeadsQuery, params)
    const totalLeads = parseInt(totalLeadsResult.rows[0].count)

    // Get new leads (last 7 days)
    const newLeadsResult = await pool.query(newLeadsQuery, params)
    const newLeads = parseInt(newLeadsResult.rows[0].count)

    // Get converted leads
    const convertedLeadsResult = await pool.query(convertedLeadsQuery, params)
    const convertedLeads = parseInt(convertedLeadsResult.rows[0].count)

    // Handle student-specific dashboard
    if (isStudent(user.role)) {
      // Get student data
      const studentResult = await pool.query(
        `SELECT s.*, u.name, u.email
         FROM students s
         JOIN users u ON s.user_id = u.id
         WHERE u.id = $1`,
        [user.id]
      )

      if (studentResult.rows.length === 0) {
        return NextResponse.json({ error: 'Student data not found' }, { status: 404 })
      }

      const student = studentResult.rows[0]

      // Get pending payments
      const pendingPaymentsResult = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total_pending
         FROM payments
         WHERE student_id = $1 AND status = 'Pending'`,
        [student.id]
      )
      const pendingFees = parseFloat(pendingPaymentsResult.rows[0]?.total_pending || '0')

      // Get documents count (assuming documents table exists, otherwise return 0)
      let documentsCount = 0
      try {
        const docsResult = await pool.query(
          `SELECT COUNT(*) FROM documents WHERE student_id = $1`,
          [student.id]
        )
        documentsCount = parseInt(docsResult.rows[0]?.count || '0')
      } catch {
        // Documents table might not exist yet
        documentsCount = 0
      }

      return NextResponse.json({
        totalLeads: 0,
        newLeads: 0,
        convertedLeads: 0,
        totalStudents: 1,
        activeCounselors: 0,
        conversionRate: 0,
        leadsBySource: [],
        leadsByStatus: [],
        counselorPerformance: [],
        studentData: {
          cgpa: student.cgpa ? parseFloat(student.cgpa) : 0,
          attendance: student.attendance ? parseFloat(student.attendance) : 0,
          semester: student.semester || 'N/A',
          pendingFees: pendingFees,
          documentsCount: documentsCount
        }
      })
    }

    // Get total students (only for Admin/Super Admin, counselors see 0)
    let totalStudents = 0
    let activeCounselors = 0
    
    if (!isCounselor(user.role)) {
      const totalStudentsResult = await pool.query('SELECT COUNT(*) FROM students')
      totalStudents = parseInt(totalStudentsResult.rows[0].count)

      // Get active counselors
      const activeCounselorsResult = await pool.query(
        "SELECT COUNT(*) FROM users WHERE role = 'COUNSELOR' AND status = 'ACTIVE'"
      )
      activeCounselors = parseInt(activeCounselorsResult.rows[0].count)
    }

    // Calculate conversion rate
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

    // Get leads by source
    const leadsBySourceResult = await pool.query(
      `${leadsBySourceQuery} GROUP BY source ORDER BY count DESC`,
      params
    )
    const leadsBySource = leadsBySourceResult.rows.map(row => ({
      source: row.source,
      count: parseInt(row.count)
    }))

    // Get leads by status
    const leadsByStatusResult = await pool.query(
      `${leadsByStatusQuery} GROUP BY status ORDER BY count DESC`,
      params
    )
    const leadsByStatus = leadsByStatusResult.rows.map(row => ({
      status: row.status,
      count: parseInt(row.count)
    }))

    // Get counselor performance (only for Admin/Super Admin)
    let counselorPerformance: any[] = []
    if (!isCounselor(user.role)) {
      const counselorPerformanceResult = await pool.query(
        `SELECT 
          u.id as counselor_id,
          u.name as counselor_name,
          COUNT(l.id) as total_leads,
          COUNT(CASE WHEN l.status = 'Converted' THEN 1 END) as converted
        FROM users u
        LEFT JOIN leads l ON u.id = l.assigned_counselor_id
        WHERE u.role = 'COUNSELOR' AND u.status = 'ACTIVE'
        GROUP BY u.id, u.name
        ORDER BY total_leads DESC`
      )
      counselorPerformance = counselorPerformanceResult.rows.map(row => {
        const total = parseInt(row.total_leads) || 0
        const converted = parseInt(row.converted) || 0
        return {
          counselorId: row.counselor_id,
          counselorName: row.counselor_name,
          totalLeads: total,
          converted: converted,
          conversionRate: total > 0 ? (converted / total) * 100 : 0
        }
      })
    }

    return NextResponse.json({
      totalLeads,
      newLeads,
      convertedLeads,
      totalStudents,
      activeCounselors,
      conversionRate: Math.round(conversionRate * 100) / 100,
      leadsBySource,
      leadsByStatus,
      counselorPerformance
    })
  } catch (error: any) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

