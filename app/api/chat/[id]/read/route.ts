import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'

// PUT mark message as read
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    const result = await pool.query(
      'UPDATE chat_messages SET read = true WHERE id = $1 RETURNING *',
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const message = result.rows[0]

    // Get sender and receiver names
    const senderResult = await pool.query('SELECT name FROM users WHERE id = $1', [message.sender_id])
    const receiverResult = await pool.query('SELECT name FROM users WHERE id = $1', [message.receiver_id])

    return NextResponse.json({
      id: message.id,
      senderId: message.sender_id,
      senderName: senderResult.rows[0]?.name || 'Unknown',
      receiverId: message.receiver_id,
      receiverName: receiverResult.rows[0]?.name || 'Unknown',
      message: message.message,
      timestamp: message.created_at,
      read: message.read,
      type: message.message_type || 'text'
    })
  } catch (error: any) {
    console.error('Mark message as read error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

