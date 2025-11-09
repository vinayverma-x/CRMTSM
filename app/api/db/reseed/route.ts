import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { seedDatabase } from '@/lib/db/seed'

// Force reseed the database (useful for development/debugging)
export async function POST() {
  try {
    console.log('Force reseeding database...')

    // Clear existing data (except SUPER_ADMIN)
    await pool.query('DELETE FROM students')
    await pool.query("DELETE FROM users WHERE role != 'SUPER_ADMIN'")
    
    console.log('Cleared existing data')

    // Seed database
    await seedDatabase(true) // Force reseed

    // Verify data
    const adminCount = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'ADMIN'")
    const counselorCount = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'COUNSELOR'")
    const studentCount = await pool.query('SELECT COUNT(*) FROM students')

    return NextResponse.json({
      message: 'Database reseeded successfully!',
      counts: {
        admins: parseInt(adminCount.rows[0].count),
        counselors: parseInt(counselorCount.rows[0].count),
        students: parseInt(studentCount.rows[0].count)
      }
    })
  } catch (error: any) {
    console.error('Error reseeding database:', error)
    return NextResponse.json(
      { error: 'Failed to reseed database', details: error.message },
      { status: 500 }
    )
  }
}

