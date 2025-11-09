import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { readFileSync } from 'fs'
import { join } from 'path'
import { seedDatabase } from '@/lib/db/seed'

export async function POST() {
  try {
    console.log('Initializing database...')

    // Read and execute schema
    const schemaPath = join(process.cwd(), 'lib', 'db', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf-8')

    // Execute schema
    await pool.query(schema)
    console.log('Database schema created successfully!')

    // Seed database
    await seedDatabase()

    return NextResponse.json({ message: 'Database initialized successfully!' })
  } catch (error: any) {
    console.error('Error initializing database:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error.message },
      { status: 500 }
    )
  }
}

