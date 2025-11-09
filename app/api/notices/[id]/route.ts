import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'

// GET notice by ID
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
      `SELECT n.*, u.name as created_by_name
       FROM notices n
       LEFT JOIN users u ON n.created_by_id = u.id
       WHERE n.id = $1`,
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 })
    }

    const notice = result.rows[0]

    // Get target roles
    const rolesResult = await pool.query(
      'SELECT role FROM notice_target_roles WHERE notice_id = $1',
      [params.id]
    )

    return NextResponse.json({
      id: notice.id,
      title: notice.title,
      content: notice.content,
      type: notice.type,
      priority: notice.priority,
      createdById: notice.created_by_id,
      createdBy: notice.created_by_name,
      createdAt: notice.created_at?.split('T')[0] || notice.created_at,
      targetRoles: rolesResult.rows.length > 0 ? rolesResult.rows.map(r => r.role) : undefined,
      isActive: notice.is_active
    })
  } catch (error: any) {
    console.error('Get notice error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT update notice
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
      content,
      type,
      priority,
      targetRoles,
      isActive
    } = await request.json()

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Update notice
      await client.query(
        `UPDATE notices 
         SET title = COALESCE($1, title),
             content = COALESCE($2, content),
             type = COALESCE($3, type),
             priority = COALESCE($4, priority),
             is_active = COALESCE($5, is_active)
         WHERE id = $6
         RETURNING *`,
        [title, content, type, priority, isActive, params.id]
      )

      // Update target roles if provided
      if (targetRoles !== undefined) {
        // Delete existing roles
        await client.query('DELETE FROM notice_target_roles WHERE notice_id = $1', [params.id])

        // Insert new roles
        if (Array.isArray(targetRoles)) {
          for (const role of targetRoles) {
            const roleId = Math.random().toString(36).substr(2, 9)
            await client.query(
              'INSERT INTO notice_target_roles (id, notice_id, role) VALUES ($1, $2, $3)',
              [roleId, params.id, role]
            )
          }
        }
      }

      await client.query('COMMIT')

      // Fetch updated notice
      const noticeResult = await pool.query(
        `SELECT n.*, u.name as created_by_name
         FROM notices n
         LEFT JOIN users u ON n.created_by_id = u.id
         WHERE n.id = $1`,
        [params.id]
      )

      const notice = noticeResult.rows[0]
      const rolesResult = await pool.query(
        'SELECT role FROM notice_target_roles WHERE notice_id = $1',
        [params.id]
      )

      return NextResponse.json({
        id: notice.id,
        title: notice.title,
        content: notice.content,
        type: notice.type,
        priority: notice.priority,
        createdById: notice.created_by_id,
        createdBy: notice.created_by_name,
        createdAt: notice.created_at?.split('T')[0] || notice.created_at,
        targetRoles: rolesResult.rows.length > 0 ? rolesResult.rows.map(r => r.role) : undefined,
        isActive: notice.is_active
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Update notice error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE notice
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    const result = await pool.query('DELETE FROM notices WHERE id = $1 RETURNING *', [params.id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Notice deleted successfully' })
  } catch (error: any) {
    console.error('Delete notice error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

