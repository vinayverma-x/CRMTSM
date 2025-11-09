import { pool } from '../db'

let isInitialized = false
let initializationPromise: Promise<boolean> | null = null

export async function ensureDatabaseInitialized(): Promise<boolean> {
  // Return cached result if already initialized
  if (isInitialized) {
    return true
  }

  // If initialization is in progress, wait for it
  if (initializationPromise) {
    return initializationPromise
  }

  // Start initialization
  initializationPromise = (async () => {
    try {
      // Check if users table exists
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        )
      `)

      if (!tableCheck.rows[0].exists) {
        console.log('Database not initialized. Initializing...')
        await initializeDatabase()
        isInitialized = true
        return true
      }

      // Check if we have any users (if not, seed the database)
      const userCount = await pool.query('SELECT COUNT(*) FROM users')
      if (parseInt(userCount.rows[0].count) === 0) {
        console.log('Database empty. Seeding...')
        const { seedDatabase } = await import('./seed')
        await seedDatabase()
      }

      isInitialized = true
      return true
    } catch (error) {
      console.error('Database initialization check failed:', error)
      // Don't throw - let the app continue, initialization can happen on first API call
      return false
    }
  })()

  return initializationPromise
}

async function initializeDatabase() {
  const fs = await import('fs')
  const path = await import('path')

  // Read and execute schema
  const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf-8')

  // Execute schema statements one by one (in case of multiple statements)
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  for (const statement of statements) {
    if (statement) {
      try {
        await pool.query(statement)
      } catch (error: any) {
        // Ignore "already exists" errors
        if (!error.message?.includes('already exists')) {
          throw error
        }
      }
    }
  }

  // Seed database
  const { seedDatabase } = await import('./seed')
  await seedDatabase()
}

