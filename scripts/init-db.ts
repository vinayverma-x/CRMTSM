import { pool } from '../lib/db'
import { readFileSync } from 'fs'
import { join } from 'path'
import { seedDatabase } from '../lib/db/seed'

async function initDatabase() {
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

    console.log('Database initialization completed!')
    process.exit(0)
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  }
}

initDatabase()

