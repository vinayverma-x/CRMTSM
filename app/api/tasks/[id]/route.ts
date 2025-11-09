import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'

// GET task by ID
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
      `SELECT t.*,
              u1.name as assigned_to_name,
              u2.name as created_by_name
       FROM tasks t
       LEFT JOIN users u1 ON t.assigned_to_id = u1.id
       LEFT JOIN users u2 ON t.created_by_id = u2.id
       WHERE t.id = $1`,
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const task = result.rows[0]

    // Get tags
    const tagsResult = await pool.query('SELECT tag FROM task_tags WHERE task_id = $1', [params.id])

    return NextResponse.json({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedToId: task.assigned_to_id,
      assignedTo: task.assigned_to_name,
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
    })
  } catch (error: any) {
    console.error('Get task error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT update task
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
      title,
      description,
      status,
      priority,
      assignedToId,
      dueDate,
      autoReminder,
      calendarSync,
      reminderDate,
      tags
    } = await request.json()

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Update task
      await client.query(
        `UPDATE tasks 
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             status = COALESCE($3, status),
             priority = COALESCE($4, priority),
             assigned_to_id = COALESCE($5, assigned_to_id),
             due_date = COALESCE($6, due_date),
             auto_reminder = COALESCE($7, auto_reminder),
             calendar_sync = COALESCE($8, calendar_sync),
             reminder_date = COALESCE($9, reminder_date)
         WHERE id = $10
         RETURNING *`,
        [
          title,
          description,
          status,
          priority,
          assignedToId,
          dueDate,
          autoReminder,
          calendarSync,
          reminderDate,
          params.id
        ]
      )

      // Update tags if provided
      if (tags !== undefined) {
        // Delete existing tags
        await client.query('DELETE FROM task_tags WHERE task_id = $1', [params.id])

        // Insert new tags
        if (Array.isArray(tags)) {
          for (const tag of tags) {
            const tagId = Math.random().toString(36).substr(2, 9)
            await client.query(
              'INSERT INTO task_tags (id, task_id, tag) VALUES ($1, $2, $3)',
              [tagId, params.id, tag]
            )
          }
        }
      }

      await client.query('COMMIT')

      // Fetch updated task
      const taskResult = await pool.query(
        `SELECT t.*, u.name as assigned_to_name
         FROM tasks t
         LEFT JOIN users u ON t.assigned_to_id = u.id
         WHERE t.id = $1`,
        [params.id]
      )

      const task = taskResult.rows[0]
      const tagsResult = await pool.query('SELECT tag FROM task_tags WHERE task_id = $1', [params.id])

      return NextResponse.json({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedToId: task.assigned_to_id,
        assignedTo: task.assigned_to_name,
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
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Update task error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [params.id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error: any) {
    console.error('Delete task error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

