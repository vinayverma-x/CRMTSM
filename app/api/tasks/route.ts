import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'
import { getUserFromRequest, isCounselor } from '@/lib/auth'

// GET all tasks
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
    const assignedToId = searchParams.get('assignedToId')
    const createdById = searchParams.get('createdById')

    let query = `
      SELECT t.*,
             u1.name as assigned_to_name,
             u2.name as created_by_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to_id = u1.id
      LEFT JOIN users u2 ON t.created_by_id = u2.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    // If user is a counselor, only show tasks assigned to them or created by them
    if (isCounselor(user.role)) {
      query += ` AND (t.assigned_to_id = $${paramIndex} OR t.created_by_id = $${paramIndex})`
      params.push(user.id)
      paramIndex++
    }

    if (status) {
      query += ` AND t.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    // Only allow filtering by assignedToId if user is Admin or Super Admin
    if (assignedToId && !isCounselor(user.role)) {
      query += ` AND t.assigned_to_id = $${paramIndex}`
      params.push(assignedToId)
      paramIndex++
    }

    // Only allow filtering by createdById if user is Admin or Super Admin
    if (createdById && !isCounselor(user.role)) {
      query += ` AND t.created_by_id = $${paramIndex}`
      params.push(createdById)
      paramIndex++
    }

    query += ' ORDER BY t.due_date ASC, t.created_at DESC'

    const result = await pool.query(query, params)

    // Get tags for each task
    const tasks = await Promise.all(
      result.rows.map(async (row) => {
        const tagsResult = await pool.query(
          'SELECT tag FROM task_tags WHERE task_id = $1',
          [row.id]
        )

        return {
          id: row.id,
          title: row.title,
          description: row.description,
          status: row.status,
          priority: row.priority,
          assignedToId: row.assigned_to_id,
          assignedTo: row.assigned_to_name,
          createdById: row.created_by_id,
          dueDate: row.due_date,
          relatedLeadId: row.related_lead_id,
          relatedStudentId: row.related_student_id,
          autoReminder: row.auto_reminder,
          calendarSync: row.calendar_sync || 'none',
          reminderSent: row.reminder_sent,
          reminderDate: row.reminder_date,
          tags: tagsResult.rows.map(r => r.tag),
          createdAt: row.created_at?.split('T')[0] || row.created_at
        }
      })
    )

    return NextResponse.json(tasks)
  } catch (error: any) {
    console.error('Get tasks error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create new task
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
      title,
      description,
      status,
      priority,
      assignedToId,
      createdById,
      dueDate,
      relatedLeadId,
      relatedStudentId,
      autoReminder,
      calendarSync,
      reminderDate,
      tags
    } = await request.json()

    if (!title || !dueDate) {
      return NextResponse.json(
        { error: 'Title and dueDate are required' },
        { status: 400 }
      )
    }

    // If counselor creates a task, they can only assign it to themselves
    const finalAssignedToId = isCounselor(user.role)
      ? (assignedToId === user.id ? user.id : user.id)
      : (assignedToId || null)
    
    // Use authenticated user's ID as createdById
    const finalCreatedById = createdById || user.id

    if (!finalAssignedToId) {
      return NextResponse.json(
        { error: 'assignedToId is required' },
        { status: 400 }
      )
    }

    const id = Math.random().toString(36).substr(2, 9)
    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Insert task
      await client.query(
        `INSERT INTO tasks (
          id, title, description, status, priority, assigned_to_id, created_by_id,
          due_date, related_lead_id, related_student_id, auto_reminder,
          calendar_sync, reminder_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          id,
          title,
          description || null,
          status || 'PENDING',
          priority || 'MEDIUM',
          finalAssignedToId,
          finalCreatedById,
          dueDate,
          relatedLeadId || null,
          relatedStudentId || null,
          autoReminder || false,
          calendarSync || 'none',
          reminderDate || null
        ]
      )

      // Insert tags if provided
      if (tags && Array.isArray(tags)) {
        for (const tag of tags) {
          const tagId = Math.random().toString(36).substr(2, 9)
          await client.query(
            'INSERT INTO task_tags (id, task_id, tag) VALUES ($1, $2, $3)',
            [tagId, id, tag]
          )
        }
      }

      await client.query('COMMIT')

      // Get assigned user name
      const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [finalAssignedToId])
      const assignedToName = userResult.rows[0]?.name || 'Unknown'

      // Get tags
      const tagsResult = await pool.query('SELECT tag FROM task_tags WHERE task_id = $1', [id])

      const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [id])
      const task = taskResult.rows[0]

      return NextResponse.json({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedToId: task.assigned_to_id,
        assignedTo: assignedToName,
        createdById: task.created_by_id,
        dueDate: task.due_date,
        relatedLeadId: task.related_lead_id,
        relatedStudentId: task.related_student_id,
        autoReminder: task.auto_reminder,
        calendarSync: task.calendar_sync || 'none',
        reminderSent: task.reminder_sent,
        reminderDate: task.reminder_date,
        tags: tagsResult.rows.map(r => r.tag),
        createdAt: task.created_at?.split('T')[0] || task.created_at
      }, { status: 201 })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Create task error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

