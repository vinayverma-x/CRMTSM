import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'
import { getUserFromRequest, isAdminOrSuperAdmin } from '@/lib/auth'

// GET activity logs
export async function GET(request: NextRequest) {
  // Only Admin and Super Admin can access activity logs
  const user = getUserFromRequest(request)
  if (!isAdminOrSuperAdmin(user?.role || null)) {
    return NextResponse.json({ error: 'Unauthorized. Only Admin and Super Admin can access activity logs.' }, { status: 403 })
  }

  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = `
      SELECT a.*, u.name as user_name
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (userId) {
      query += ` AND a.user_id = $${paramIndex}`
      params.push(userId)
      paramIndex++
    }

    if (entityType) {
      query += ` AND a.entity_type = $${paramIndex}`
      params.push(entityType)
      paramIndex++
    }

    if (entityId) {
      query += ` AND a.entity_id = $${paramIndex}`
      params.push(entityId)
      paramIndex++
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramIndex}`
    params.push(limit)

    const result = await pool.query(query, params)

    const logs = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      entityName: row.entity_name,
      details: row.details,
      ipAddress: row.ip_address,
      timestamp: row.created_at
    }))

    return NextResponse.json(logs)
  } catch (error: any) {
    console.error('Get activity logs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create activity log
export async function POST(request: NextRequest) {
  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    const {
      userId,
      action,
      entityType,
      entityId,
      entityName,
      details,
      ipAddress
    } = await request.json()

    if (!userId || !action || !entityType || !entityId) {
      return NextResponse.json(
        { error: 'userId, action, entityType, and entityId are required' },
        { status: 400 }
      )
    }

    const id = Math.random().toString(36).substr(2, 9)

    const result = await pool.query(
      `INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, entity_name, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, userId, action, entityType, entityId, entityName || null, details || null, ipAddress || null]
    )

    const log = result.rows[0]

    // Get user name
    const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [userId])

    return NextResponse.json({
      id: log.id,
      userId: log.user_id,
      userName: userResult.rows[0]?.name || 'Unknown',
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      entityName: log.entity_name,
      details: log.details,
      ipAddress: log.ip_address,
      timestamp: log.created_at
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create activity log error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

