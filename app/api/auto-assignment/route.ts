import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'
import { getUserFromRequest, isAdminOrSuperAdmin } from '@/lib/auth'

// GET all auto assignment rules
export async function GET(request: NextRequest) {
  // Only Admin and Super Admin can access auto assignment
  const user = getUserFromRequest(request)
  if (!isAdminOrSuperAdmin(user?.role || null)) {
    return NextResponse.json({ error: 'Unauthorized. Only Admin and Super Admin can access auto assignment.' }, { status: 403 })
  }

  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    const result = await pool.query(
      `SELECT r.*, u.name as assigned_counselor_name
       FROM auto_assignment_rules r
       LEFT JOIN users u ON r.assigned_counselor_id = u.id
       ORDER BY r.priority ASC, r.created_at DESC`
    )

    // Get criteria for each rule
    const rules = await Promise.all(
      result.rows.map(async (row) => {
        const criteriaResult = await pool.query(
          'SELECT criteria_type, criteria_value FROM auto_assignment_criteria WHERE rule_id = $1',
          [row.id]
        )

        const criteria: any = {}
        criteriaResult.rows.forEach(c => {
          if (!criteria[c.criteria_type]) {
            criteria[c.criteria_type] = []
          }
          criteria[c.criteria_type].push(c.criteria_value)
        })

        return {
          id: row.id,
          name: row.name,
          criteria,
          assignedCounselorId: row.assigned_counselor_id,
          assignedCounselor: row.assigned_counselor_name,
          priority: row.priority,
          isActive: row.is_active,
          createdAt: row.created_at?.split('T')[0] || row.created_at
        }
      })
    )

    return NextResponse.json(rules)
  } catch (error: any) {
    console.error('Get auto assignment rules error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create new auto assignment rule
export async function POST(request: NextRequest) {
  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    const {
      name,
      criteria,
      assignedCounselorId,
      priority,
      isActive
    } = await request.json()

    if (!name || !assignedCounselorId || !criteria) {
      return NextResponse.json(
        { error: 'Name, assignedCounselorId, and criteria are required' },
        { status: 400 }
      )
    }

    const id = Math.random().toString(36).substr(2, 9)
    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Insert rule
      await client.query(
        `INSERT INTO auto_assignment_rules (id, name, assigned_counselor_id, priority, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          id,
          name,
          assignedCounselorId,
          priority || 1,
          isActive !== undefined ? isActive : true
        ]
      )

      // Insert criteria
      for (const [type, values] of Object.entries(criteria)) {
        if (Array.isArray(values)) {
          for (const value of values) {
            const criteriaId = Math.random().toString(36).substr(2, 9)
            await client.query(
              'INSERT INTO auto_assignment_criteria (id, rule_id, criteria_type, criteria_value) VALUES ($1, $2, $3, $4)',
              [criteriaId, id, type, value]
            )
          }
        }
      }

      await client.query('COMMIT')

      // Get counselor name
      const counselorResult = await pool.query('SELECT name FROM users WHERE id = $1', [assignedCounselorId])
      const counselorName = counselorResult.rows[0]?.name || 'Unknown'

      // Get criteria
      const criteriaResult = await pool.query(
        'SELECT criteria_type, criteria_value FROM auto_assignment_criteria WHERE rule_id = $1',
        [id]
      )

      const criteriaObj: any = {}
      criteriaResult.rows.forEach(c => {
        if (!criteriaObj[c.criteria_type]) {
          criteriaObj[c.criteria_type] = []
        }
        criteriaObj[c.criteria_type].push(c.criteria_value)
      })

      const ruleResult = await pool.query('SELECT * FROM auto_assignment_rules WHERE id = $1', [id])
      const rule = ruleResult.rows[0]

      return NextResponse.json({
        id: rule.id,
        name: rule.name,
        criteria: criteriaObj,
        assignedCounselorId: rule.assigned_counselor_id,
        assignedCounselor: counselorName,
        priority: rule.priority,
        isActive: rule.is_active,
        createdAt: rule.created_at?.split('T')[0] || rule.created_at
      }, { status: 201 })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Create auto assignment rule error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

