import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'
import { getUserFromRequest, isCounselor } from '@/lib/auth'

// GET all leads
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const counselorId = searchParams.get('counselorId')

    let query = `
      SELECT l.*, 
             u.name as assigned_counselor_name,
             u2.name as created_by_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_counselor_id = u.id
      LEFT JOIN users u2 ON l.created_by_id = u2.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    // If user is a counselor, only show leads assigned to them
    if (isCounselor(user.role)) {
      query += ` AND l.assigned_counselor_id = $${paramIndex}`
      params.push(user.id)
      paramIndex++
    }

    if (status) {
      query += ` AND l.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    // Only allow filtering by counselorId if user is Admin or Super Admin
    if (counselorId && !isCounselor(user.role)) {
      query += ` AND l.assigned_counselor_id = $${paramIndex}`
      params.push(counselorId)
      paramIndex++
    }

    query += ' ORDER BY l.created_at DESC'

    const result = await pool.query(query, params)

    // Get recommended courses for each lead
    const leads = await Promise.all(
      result.rows.map(async (row) => {
        const coursesResult = await pool.query(
          'SELECT course_name FROM lead_recommended_courses WHERE lead_id = $1',
          [row.id]
        )

        return {
          id: row.id,
          name: row.name,
          course: row.course,
          source: row.source,
          status: row.status,
          assignedCounselorId: row.assigned_counselor_id,
          assignedCounselor: row.assigned_counselor_name || 'Unassigned',
          lastContact: row.last_contact,
          email: row.email,
          phone: row.phone,
          notes: row.notes,
          createdById: row.created_by_id,
          createdAt: row.created_at?.split('T')[0] || row.created_at,
          leadScore: row.lead_score ? parseFloat(row.lead_score) : null,
          engagementLevel: row.engagement_level,
          predictedConversionRate: row.predicted_conversion_rate ? parseFloat(row.predicted_conversion_rate) : null,
          region: row.region,
          department: row.department,
          duplicateCheck: row.duplicate_check,
          lastEngagementDate: row.last_engagement_date,
          totalInteractions: row.total_interactions || 0,
          recommendedCourses: coursesResult.rows.map(r => r.course_name)
        }
      })
    )

    return NextResponse.json(leads)
  } catch (error: any) {
    console.error('Get leads error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create new lead
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
      name,
      course,
      source,
      email,
      phone,
      assignedCounselorId,
      createdById,
      region,
      department,
      notes,
      recommendedCourses
    } = await request.json()

    // If counselor creates a lead, they can only assign it to themselves
    const finalAssignedCounselorId = isCounselor(user.role) 
      ? (assignedCounselorId === user.id ? user.id : user.id)
      : (assignedCounselorId || null)
    
    // Use authenticated user's ID as createdById
    const finalCreatedById = createdById || user.id

    if (!name || !course || !source) {
      return NextResponse.json(
        { error: 'Name, course, and source are required' },
        { status: 400 }
      )
    }

    const id = Math.random().toString(36).substr(2, 9)
    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Insert lead
      await client.query(
        `INSERT INTO leads (
          id, name, course, source, email, phone, assigned_counselor_id, 
          created_by_id, region, department, notes, last_contact
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_DATE)
        RETURNING *`,
        [
          id,
          name,
          course,
          source,
          email || null,
          phone || null,
          finalAssignedCounselorId,
          finalCreatedById,
          region || null,
          department || null,
          notes || null
        ]
      )

      // Insert recommended courses if provided
      if (recommendedCourses && Array.isArray(recommendedCourses)) {
        for (const courseName of recommendedCourses) {
          const courseId = Math.random().toString(36).substr(2, 9)
          await client.query(
            'INSERT INTO lead_recommended_courses (id, lead_id, course_name) VALUES ($1, $2, $3)',
            [courseId, id, courseName]
          )
        }
      }

      await client.query('COMMIT')

      // Get counselor name
      let counselorName = 'Unassigned'
      if (finalAssignedCounselorId) {
        const counselorResult = await client.query('SELECT name FROM users WHERE id = $1', [finalAssignedCounselorId])
        if (counselorResult.rows.length > 0) {
          counselorName = counselorResult.rows[0].name
        }
      }

      // Get created lead with courses
      const leadResult = await pool.query(
        'SELECT * FROM leads WHERE id = $1',
        [id]
      )
      const coursesResult = await pool.query(
        'SELECT course_name FROM lead_recommended_courses WHERE lead_id = $1',
        [id]
      )

      const lead = leadResult.rows[0]

      return NextResponse.json({
        id: lead.id,
        name: lead.name,
        course: lead.course,
        source: lead.source,
        status: lead.status,
        assignedCounselorId: lead.assigned_counselor_id,
        assignedCounselor: counselorName,
        lastContact: lead.last_contact,
        email: lead.email,
        phone: lead.phone,
        notes: lead.notes,
        createdById: lead.created_by_id,
        createdAt: lead.created_at?.split('T')[0] || lead.created_at,
        leadScore: lead.lead_score ? parseFloat(lead.lead_score) : null,
        engagementLevel: lead.engagement_level,
        predictedConversionRate: lead.predicted_conversion_rate ? parseFloat(lead.predicted_conversion_rate) : null,
        region: lead.region,
        department: lead.department,
        duplicateCheck: lead.duplicate_check,
        lastEngagementDate: lead.last_engagement_date,
        totalInteractions: lead.total_interactions || 0,
        recommendedCourses: coursesResult.rows.map(r => r.course_name)
      }, { status: 201 })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Create lead error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

