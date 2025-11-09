import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'
import { getUserFromRequest } from '@/lib/auth'

// GET all notices
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
    const isActive = searchParams.get('isActive')
    const role = searchParams.get('role') // Filter by target role

    // If role not specified, use user's role to filter notices
    const targetRole = role || user.role

    let query = `
      SELECT n.*, u.name as created_by_name
      FROM notices n
      LEFT JOIN users u ON n.created_by_id = u.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (isActive !== null) {
      query += ` AND n.is_active = $${paramIndex}`
      params.push(isActive === 'true')
      paramIndex++
    }

    query += ' ORDER BY n.created_at DESC'

    const result = await pool.query(query, params)

    // Get target roles for each notice
    const notices = await Promise.all(
      result.rows.map(async (row) => {
        const rolesResult = await pool.query(
          'SELECT role FROM notice_target_roles WHERE notice_id = $1',
          [row.id]
        )

        const targetRoles = rolesResult.rows.map(r => r.role)

        // Filter by role - if notice has target roles, user's role must be in the list
        // If notice has no target roles, it's visible to all
        if (targetRoles.length > 0 && !targetRoles.includes(targetRole)) {
          return null
        }

        return {
          id: row.id,
          title: row.title,
          content: row.content,
          type: row.type,
          priority: row.priority,
          createdById: row.created_by_id,
          createdBy: row.created_by_name,
          createdAt: row.created_at?.split('T')[0] || row.created_at,
          targetRoles: targetRoles.length > 0 ? targetRoles : undefined,
          isActive: row.is_active
        }
      })
    )

    return NextResponse.json(notices.filter(n => n !== null))
  } catch (error: any) {
    console.error('Get notices error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create new notice
export async function POST(request: NextRequest) {
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
      createdById,
      targetRoles,
      isActive
    } = await request.json()

    if (!title || !content || !type || !createdById) {
      return NextResponse.json(
        { error: 'Title, content, type, and createdById are required' },
        { status: 400 }
      )
    }

    const id = Math.random().toString(36).substr(2, 9)
    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Insert notice
      await client.query(
        `INSERT INTO notices (id, title, content, type, priority, created_by_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          id,
          title,
          content,
          type,
          priority || 'MEDIUM',
          createdById,
          isActive !== undefined ? isActive : true
        ]
      )

      // Insert target roles if provided
      if (targetRoles && Array.isArray(targetRoles)) {
        for (const role of targetRoles) {
          const roleId = Math.random().toString(36).substr(2, 9)
          await client.query(
            'INSERT INTO notice_target_roles (id, notice_id, role) VALUES ($1, $2, $3)',
            [roleId, id, role]
          )
        }
      }

      await client.query('COMMIT')

      // Get created by name
      const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [createdById])
      const createdByName = userResult.rows[0]?.name || 'Unknown'

      // Get target roles
      const rolesResult = await pool.query(
        'SELECT role FROM notice_target_roles WHERE notice_id = $1',
        [id]
      )

      const noticeResult = await pool.query('SELECT * FROM notices WHERE id = $1', [id])
      const notice = noticeResult.rows[0]

      return NextResponse.json({
        id: notice.id,
        title: notice.title,
        content: notice.content,
        type: notice.type,
        priority: notice.priority,
        createdById: notice.created_by_id,
        createdBy: createdByName,
        createdAt: notice.created_at?.split('T')[0] || notice.created_at,
        targetRoles: rolesResult.rows.length > 0 ? rolesResult.rows.map(r => r.role) : undefined,
        isActive: notice.is_active
      }, { status: 201 })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Create notice error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

