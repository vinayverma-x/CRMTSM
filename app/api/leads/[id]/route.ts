import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'
import { getUserFromRequest, isCounselor } from '@/lib/auth'

// GET lead by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const result = await pool.query(
      `SELECT l.*, 
              u.name as assigned_counselor_name,
              u2.name as created_by_name
       FROM leads l
       LEFT JOIN users u ON l.assigned_counselor_id = u.id
       LEFT JOIN users u2 ON l.created_by_id = u2.id
       WHERE l.id = $1`,
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const lead = result.rows[0]

    // If user is a counselor, only allow access to leads assigned to them
    if (isCounselor(user.role) && lead.assigned_counselor_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized. You can only access leads assigned to you.' }, { status: 403 })
    }

    // Get recommended courses
    const coursesResult = await pool.query(
      'SELECT course_name FROM lead_recommended_courses WHERE lead_id = $1',
      [params.id]
    )

    // Get status history
    const historyResult = await pool.query(
      `SELECT h.*, u.name as changed_by_name
       FROM lead_status_history h
       LEFT JOIN users u ON h.changed_by_id = u.id
       WHERE h.lead_id = $1
       ORDER BY h.changed_at DESC`,
      [params.id]
    )

    return NextResponse.json({
      id: lead.id,
      name: lead.name,
      course: lead.course,
      source: lead.source,
      status: lead.status,
      assignedCounselorId: lead.assigned_counselor_id,
      assignedCounselor: lead.assigned_counselor_name || 'Unassigned',
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
      recommendedCourses: coursesResult.rows.map(r => r.course_name),
      statusHistory: historyResult.rows.map(h => ({
        id: h.id,
        leadId: h.lead_id,
        status: h.status,
        changedBy: h.changed_by_name,
        changedById: h.changed_by_id,
        changedAt: h.changed_at,
        notes: h.notes
      }))
    })
  } catch (error: any) {
    console.error('Get lead error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT update lead
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if lead exists and counselor has access
    const leadCheck = await pool.query('SELECT assigned_counselor_id FROM leads WHERE id = $1', [params.id])
    if (leadCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // If user is a counselor, only allow access to leads assigned to them
    if (isCounselor(user.role) && leadCheck.rows[0].assigned_counselor_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized. You can only update leads assigned to you.' }, { status: 403 })
    }

    const {
      name,
      course,
      source,
      status,
      email,
      phone,
      assignedCounselorId,
      region,
      department,
      notes,
      leadScore,
      engagementLevel,
      predictedConversionRate,
      recommendedCourses
    } = await request.json()

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Get current status to track changes
      const currentLead = await client.query('SELECT status FROM leads WHERE id = $1', [params.id])
      if (currentLead.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
      }

      const oldStatus = currentLead.rows[0].status

      // Update lead
      await client.query(
        `UPDATE leads 
         SET name = COALESCE($1, name),
             course = COALESCE($2, course),
             source = COALESCE($3, source),
             status = COALESCE($4, status),
             email = COALESCE($5, email),
             phone = COALESCE($6, phone),
             assigned_counselor_id = COALESCE($7, assigned_counselor_id),
             region = COALESCE($8, region),
             department = COALESCE($9, department),
             notes = COALESCE($10, notes),
             lead_score = COALESCE($11, lead_score),
             engagement_level = COALESCE($12, engagement_level),
             predicted_conversion_rate = COALESCE($13, predicted_conversion_rate)
         WHERE id = $14
         RETURNING *`,
        [
          name,
          course,
          source,
          status,
          email,
          phone,
          assignedCounselorId,
          region,
          department,
          notes,
          leadScore,
          engagementLevel,
          predictedConversionRate,
          params.id
        ]
      )

      // If status changed, add to history
      if (status && status !== oldStatus) {
        const historyId = Math.random().toString(36).substr(2, 9)
        // Use authenticated user info
        const changedById = user.id
        const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [user.id])
        const changedByName = userResult.rows[0]?.name || user.email

        await client.query(
          `INSERT INTO lead_status_history (id, lead_id, status, changed_by, changed_by_id, notes)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [historyId, params.id, status, changedByName, changedById, notes || null]
        )
      }

      // Update recommended courses
      if (recommendedCourses !== undefined) {
        // Delete existing courses
        await client.query('DELETE FROM lead_recommended_courses WHERE lead_id = $1', [params.id])

        // Insert new courses
        if (Array.isArray(recommendedCourses)) {
          for (const courseName of recommendedCourses) {
            const courseId = Math.random().toString(36).substr(2, 9)
            await client.query(
              'INSERT INTO lead_recommended_courses (id, lead_id, course_name) VALUES ($1, $2, $3)',
              [courseId, params.id, courseName]
            )
          }
        }
      }

      await client.query('COMMIT')

      // Fetch updated lead
      const leadResult = await pool.query(
        `SELECT l.*, u.name as assigned_counselor_name
         FROM leads l
         LEFT JOIN users u ON l.assigned_counselor_id = u.id
         WHERE l.id = $1`,
        [params.id]
      )

      const lead = leadResult.rows[0]
      const coursesResult = await pool.query(
        'SELECT course_name FROM lead_recommended_courses WHERE lead_id = $1',
        [params.id]
      )

      return NextResponse.json({
        id: lead.id,
        name: lead.name,
        course: lead.course,
        source: lead.source,
        status: lead.status,
        assignedCounselorId: lead.assigned_counselor_id,
        assignedCounselor: lead.assigned_counselor_name || 'Unassigned',
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
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Update lead error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Only Admin and Super Admin can delete leads
    if (isCounselor(user.role)) {
      return NextResponse.json({ error: 'Unauthorized. Only Admin and Super Admin can delete leads.' }, { status: 403 })
    }

    const result = await pool.query('DELETE FROM leads WHERE id = $1 RETURNING *', [params.id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Lead deleted successfully' })
  } catch (error: any) {
    console.error('Delete lead error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

