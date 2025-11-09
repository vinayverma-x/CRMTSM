import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'

// GET rule by ID
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
      `SELECT r.*, u.name as assigned_counselor_name
       FROM auto_assignment_rules r
       LEFT JOIN users u ON r.assigned_counselor_id = u.id
       WHERE r.id = $1`,
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 })
    }

    const rule = result.rows[0]

    // Get criteria
    const criteriaResult = await pool.query(
      'SELECT criteria_type, criteria_value FROM auto_assignment_criteria WHERE rule_id = $1',
      [params.id]
    )

    const criteria: any = {}
    criteriaResult.rows.forEach(c => {
      if (!criteria[c.criteria_type]) {
        criteria[c.criteria_type] = []
      }
      criteria[c.criteria_type].push(c.criteria_value)
    })

    return NextResponse.json({
      id: rule.id,
      name: rule.name,
      criteria,
      assignedCounselorId: rule.assigned_counselor_id,
      assignedCounselor: rule.assigned_counselor_name,
      priority: rule.priority,
      isActive: rule.is_active,
      createdAt: rule.created_at?.split('T')[0] || rule.created_at
    })
  } catch (error: any) {
    console.error('Get auto assignment rule error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT update rule
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
      name,
      criteria,
      assignedCounselorId,
      priority,
      isActive
    } = await request.json()

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Update rule
      await client.query(
        `UPDATE auto_assignment_rules 
         SET name = COALESCE($1, name),
             assigned_counselor_id = COALESCE($2, assigned_counselor_id),
             priority = COALESCE($3, priority),
             is_active = COALESCE($4, is_active)
         WHERE id = $5
         RETURNING *`,
        [name, assignedCounselorId, priority, isActive, params.id]
      )

      // Update criteria if provided
      if (criteria !== undefined) {
        // Delete existing criteria
        await client.query('DELETE FROM auto_assignment_criteria WHERE rule_id = $1', [params.id])

        // Insert new criteria
        for (const [type, values] of Object.entries(criteria)) {
          if (Array.isArray(values)) {
            for (const value of values) {
              const criteriaId = Math.random().toString(36).substr(2, 9)
              await client.query(
                'INSERT INTO auto_assignment_criteria (id, rule_id, criteria_type, criteria_value) VALUES ($1, $2, $3, $4)',
                [criteriaId, params.id, type, value]
              )
            }
          }
        }
      }

      await client.query('COMMIT')

      // Fetch updated rule
      const ruleResult = await pool.query(
        `SELECT r.*, u.name as assigned_counselor_name
         FROM auto_assignment_rules r
         LEFT JOIN users u ON r.assigned_counselor_id = u.id
         WHERE r.id = $1`,
        [params.id]
      )

      const rule = ruleResult.rows[0]
      const criteriaResult = await pool.query(
        'SELECT criteria_type, criteria_value FROM auto_assignment_criteria WHERE rule_id = $1',
        [params.id]
      )

      const criteriaObj: any = {}
      criteriaResult.rows.forEach(c => {
        if (!criteriaObj[c.criteria_type]) {
          criteriaObj[c.criteria_type] = []
        }
        criteriaObj[c.criteria_type].push(c.criteria_value)
      })

      return NextResponse.json({
        id: rule.id,
        name: rule.name,
        criteria: criteriaObj,
        assignedCounselorId: rule.assigned_counselor_id,
        assignedCounselor: rule.assigned_counselor_name,
        priority: rule.priority,
        isActive: rule.is_active,
        createdAt: rule.created_at?.split('T')[0] || rule.created_at
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Update auto assignment rule error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE rule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    const result = await pool.query('DELETE FROM auto_assignment_rules WHERE id = $1 RETURNING *', [params.id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Rule deleted successfully' })
  } catch (error: any) {
    console.error('Delete auto assignment rule error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

