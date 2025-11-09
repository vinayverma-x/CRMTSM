import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db/init-check'

// GET chat messages
export async function GET(request: NextRequest) {
  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const conversationWith = searchParams.get('conversationWith') // Get conversation between two users

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    let query = `
      SELECT m.*,
             u1.name as sender_name,
             u2.name as receiver_name
      FROM chat_messages m
      LEFT JOIN users u1 ON m.sender_id = u1.id
      LEFT JOIN users u2 ON m.receiver_id = u2.id
      WHERE (m.sender_id = $1 OR m.receiver_id = $1)
    `
    const params: any[] = [userId]
    let paramIndex = 2

    if (conversationWith) {
      query += ` AND ((m.sender_id = $${paramIndex} AND m.receiver_id = $1) OR (m.sender_id = $1 AND m.receiver_id = $${paramIndex}))`
      params.push(conversationWith)
      paramIndex++
    }

    query += ' ORDER BY m.created_at ASC'

    const result = await pool.query(query, params)

    const messages = result.rows.map(row => ({
      id: row.id,
      senderId: row.sender_id,
      senderName: row.sender_name,
      receiverId: row.receiver_id,
      receiverName: row.receiver_name,
      message: row.message,
      timestamp: row.created_at,
      read: row.read,
      type: row.message_type || 'text'
    }))

    return NextResponse.json(messages)
  } catch (error: any) {
    console.error('Get chat messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST send new message
export async function POST(request: NextRequest) {
  try {
    const initialized = await ensureDatabaseInitialized()
    if (!initialized) {
      return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
    }

    const {
      senderId,
      receiverId,
      message,
      type
    } = await request.json()

    if (!senderId || !receiverId || !message) {
      return NextResponse.json(
        { error: 'senderId, receiverId, and message are required' },
        { status: 400 }
      )
    }

    const id = Math.random().toString(36).substr(2, 9)

    const result = await pool.query(
      `INSERT INTO chat_messages (id, sender_id, receiver_id, message, message_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, senderId, receiverId, message, type || 'text']
    )

    const chatMessage = result.rows[0]

    // Get sender and receiver names
    const senderResult = await pool.query('SELECT name FROM users WHERE id = $1', [senderId])
    const receiverResult = await pool.query('SELECT name FROM users WHERE id = $1', [receiverId])

    return NextResponse.json({
      id: chatMessage.id,
      senderId: chatMessage.sender_id,
      senderName: senderResult.rows[0]?.name || 'Unknown',
      receiverId: chatMessage.receiver_id,
      receiverName: receiverResult.rows[0]?.name || 'Unknown',
      message: chatMessage.message,
      timestamp: chatMessage.created_at,
      read: chatMessage.read,
      type: chatMessage.message_type || 'text'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create chat message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

