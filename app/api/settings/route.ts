import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'
import { getUserFromRequest, isSuperAdmin } from '@/lib/auth'

// GET system settings
export async function GET(request: NextRequest) {
  // Only Super Admin can view system settings
  const user = getUserFromRequest(request)
  if (!isSuperAdmin(user?.role || null)) {
    return NextResponse.json({ error: 'Unauthorized. Only Super Admin can access system settings.' }, { status: 403 })
  }
  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    const result = await pool.query('SELECT * FROM system_settings WHERE id = $1', ['1'])

    if (result.rows.length === 0) {
      // Return default settings if none exist
      return NextResponse.json({
        id: '1',
        universityName: 'T.S. Mishra University',
        logo: '/tsm-logo.png',
        theme: 'light',
        features: {
          chatbot: true,
          notifications: true,
          reports: true
        },
        apiKeys: {
          email: '',
          sms: '',
          payment: ''
        }
      })
    }

    const settings = result.rows[0]

    return NextResponse.json({
      id: settings.id,
      universityName: settings.university_name,
      logo: settings.logo,
      theme: settings.theme,
      features: {
        chatbot: settings.chatbot_enabled,
        notifications: settings.notifications_enabled,
        reports: settings.reports_enabled
      },
      apiKeys: {
        email: settings.email_api_key || '',
        sms: settings.sms_api_key || '',
        payment: settings.payment_api_key || ''
      }
    })
  } catch (error: any) {
    console.error('Get settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT update system settings
export async function PUT(request: NextRequest) {
  // Only Super Admin can update system settings
  const user = getUserFromRequest(request)
  if (!isSuperAdmin(user?.role || null)) {
    return NextResponse.json({ error: 'Unauthorized. Only Super Admin can update system settings.' }, { status: 403 })
  }

  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    const {
      universityName,
      logo,
      theme,
      features,
      apiKeys
    } = await request.json()

    // Check if settings exist
    const existing = await pool.query('SELECT id FROM system_settings WHERE id = $1', ['1'])

    if (existing.rows.length === 0) {
      // Insert new settings
      await pool.query(
        `INSERT INTO system_settings (
          id, university_name, logo, theme, chatbot_enabled, notifications_enabled,
          reports_enabled, email_api_key, sms_api_key, payment_api_key
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          '1',
          universityName || 'T.S. Mishra University',
          logo || null,
          theme || 'light',
          features?.chatbot !== undefined ? features.chatbot : true,
          features?.notifications !== undefined ? features.notifications : true,
          features?.reports !== undefined ? features.reports : true,
          apiKeys?.email || null,
          apiKeys?.sms || null,
          apiKeys?.payment || null
        ]
      )
    } else {
      // Update existing settings
      await pool.query(
        `UPDATE system_settings 
         SET university_name = COALESCE($1, university_name),
             logo = COALESCE($2, logo),
             theme = COALESCE($3, theme),
             chatbot_enabled = COALESCE($4, chatbot_enabled),
             notifications_enabled = COALESCE($5, notifications_enabled),
             reports_enabled = COALESCE($6, reports_enabled),
             email_api_key = COALESCE($7, email_api_key),
             sms_api_key = COALESCE($8, sms_api_key),
             payment_api_key = COALESCE($9, payment_api_key),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = '1'`,
        [
          universityName,
          logo,
          theme,
          features?.chatbot,
          features?.notifications,
          features?.reports,
          apiKeys?.email,
          apiKeys?.sms,
          apiKeys?.payment
        ]
      )
    }

    // Fetch updated settings
    const result = await pool.query('SELECT * FROM system_settings WHERE id = $1', ['1'])
    const settings = result.rows[0]

    return NextResponse.json({
      id: settings.id,
      universityName: settings.university_name,
      logo: settings.logo,
      theme: settings.theme,
      features: {
        chatbot: settings.chatbot_enabled,
        notifications: settings.notifications_enabled,
        reports: settings.reports_enabled
      },
      apiKeys: {
        email: settings.email_api_key || '',
        sms: settings.sms_api_key || '',
        payment: settings.payment_api_key || ''
      }
    })
  } catch (error: any) {
    console.error('Update settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

