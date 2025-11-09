import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'
import { getUserFromRequest, isAdminOrSuperAdmin } from '@/lib/auth'

// GET reports data
export async function GET(request: NextRequest) {
  // Only Admin and Super Admin can access reports
  const user = getUserFromRequest(request)
  if (!isAdminOrSuperAdmin(user?.role || null)) {
    return NextResponse.json({ error: 'Unauthorized. Only Admin and Super Admin can access reports.' }, { status: 403 })
  }

  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'overview'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let dateFilter = ''
    const params: any[] = []
    if (startDate && endDate) {
      dateFilter = ' AND created_at BETWEEN $1 AND $2'
      params.push(startDate, endDate)
    }

    switch (reportType) {
      case 'leads':
        // Lead conversion report
        const leadsReport = await pool.query(
          `SELECT 
            status,
            COUNT(*) as count,
            COUNT(CASE WHEN status = 'Converted' THEN 1 END) as converted
          FROM leads
          WHERE 1=1 ${dateFilter}
          GROUP BY status`,
          params
        )

        return NextResponse.json({
          type: 'leads',
          data: leadsReport.rows.map(row => ({
            status: row.status,
            count: parseInt(row.count),
            converted: parseInt(row.converted || 0)
          }))
        })

      case 'counselors':
        // Counselor performance report
        const counselorsReport = await pool.query(
          `SELECT 
            u.id,
            u.name,
            COUNT(l.id) as total_leads,
            COUNT(CASE WHEN l.status = 'Converted' THEN 1 END) as converted,
            COUNT(CASE WHEN l.status = 'New' THEN 1 END) as new_leads,
            COUNT(CASE WHEN l.status = 'In Progress' THEN 1 END) as in_progress
          FROM users u
          LEFT JOIN leads l ON u.id = l.assigned_counselor_id
          WHERE u.role = 'COUNSELOR' AND u.status = 'ACTIVE'
          GROUP BY u.id, u.name
          ORDER BY total_leads DESC`,
          []
        )

        return NextResponse.json({
          type: 'counselors',
          data: counselorsReport.rows.map(row => ({
            counselorId: row.id,
            counselorName: row.name,
            totalLeads: parseInt(row.total_leads || 0),
            converted: parseInt(row.converted || 0),
            newLeads: parseInt(row.new_leads || 0),
            inProgress: parseInt(row.in_progress || 0),
            conversionRate: row.total_leads > 0 ? ((row.converted / row.total_leads) * 100).toFixed(2) : 0
          }))
        })

      case 'payments':
        // Payment report
        const paymentsReport = await pool.query(
          `SELECT 
            payment_type,
            status,
            SUM(amount) as total_amount,
            COUNT(*) as count
          FROM payments
          WHERE 1=1 ${dateFilter}
          GROUP BY payment_type, status
          ORDER BY payment_type, status`,
          params
        )

        return NextResponse.json({
          type: 'payments',
          data: paymentsReport.rows.map(row => ({
            paymentType: row.payment_type,
            status: row.status,
            totalAmount: parseFloat(row.total_amount || 0),
            count: parseInt(row.count)
          }))
        })

      case 'students':
        // Student enrollment report
        const studentsReport = await pool.query(
          `SELECT 
            course,
            COUNT(*) as count,
            COUNT(CASE WHEN s.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_students
          FROM students s
          WHERE 1=1 ${dateFilter.replace('created_at', 's.created_at')}
          GROUP BY course
          ORDER BY count DESC`,
          params
        )

        return NextResponse.json({
          type: 'students',
          data: studentsReport.rows.map(row => ({
            course: row.course,
            totalStudents: parseInt(row.count),
            newStudents: parseInt(row.new_students || 0)
          }))
        })

      default:
        // Overview report
        const overview = await pool.query(
          `SELECT 
            (SELECT COUNT(*) FROM leads) as total_leads,
            (SELECT COUNT(*) FROM leads WHERE status = 'Converted') as converted_leads,
            (SELECT COUNT(*) FROM students) as total_students,
            (SELECT COUNT(*) FROM payments WHERE status = 'Completed') as completed_payments,
            (SELECT SUM(amount) FROM payments WHERE status = 'Completed') as total_revenue
          `,
          []
        )

        const overviewData = overview.rows[0]

        return NextResponse.json({
          type: 'overview',
          data: {
            totalLeads: parseInt(overviewData.total_leads || 0),
            convertedLeads: parseInt(overviewData.converted_leads || 0),
            totalStudents: parseInt(overviewData.total_students || 0),
            completedPayments: parseInt(overviewData.completed_payments || 0),
            totalRevenue: parseFloat(overviewData.total_revenue || 0),
            conversionRate: overviewData.total_leads > 0 
              ? ((overviewData.converted_leads / overviewData.total_leads) * 100).toFixed(2)
              : 0
          }
        })
    }
  } catch (error: any) {
    console.error('Get reports error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

