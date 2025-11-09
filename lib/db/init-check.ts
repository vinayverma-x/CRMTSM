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
      // First, test database connection
      await pool.query('SELECT 1')
      
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
      const totalUsers = parseInt(userCount.rows[0].count)
      
      if (totalUsers === 0) {
        console.log('Database empty. Seeding...')
        const { seedDatabase } = await import('./seed')
        await seedDatabase()
      } else {
        // Check if we have seed data (at least 1 admin, 1 counselor, 1 student)
        const adminCount = await pool.query('SELECT COUNT(*) FROM users WHERE role = \'ADMIN\'')
        const counselorCount = await pool.query('SELECT COUNT(*) FROM users WHERE role = \'COUNSELOR\'')
        const studentCount = await pool.query('SELECT COUNT(*) FROM students')
        
        const hasAdmin = parseInt(adminCount.rows[0].count) > 0
        const hasCounselor = parseInt(counselorCount.rows[0].count) > 0
        const hasStudent = parseInt(studentCount.rows[0].count) > 0
        
        if (!hasAdmin || !hasCounselor || !hasStudent) {
          console.log('Database has users but missing seed data. Seeding...')
          console.log(`Admin: ${hasAdmin}, Counselor: ${hasCounselor}, Student: ${hasStudent}`)
          const { seedDatabase } = await import('./seed')
          // Temporarily allow seeding even if some users exist
          await seedDatabase()
        } else {
          console.log(`Database initialized with ${totalUsers} users (${adminCount.rows[0].count} admins, ${counselorCount.rows[0].count} counselors, ${studentCount.rows[0].count} students)`)
        }
      }

      isInitialized = true
      return true
    } catch (error: any) {
      console.error('Database initialization check failed:', error)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      })
      // Reset promise so it can be retried
      initializationPromise = null
      // Don't throw - let the app continue, but return false
      return false
    }
  })()

  return initializationPromise
}

async function initializeDatabase() {
  try {
    // Try to use embedded schema first (better for serverless/Vercel)
    let statements: string[] = []
    
    try {
      const { schemaStatements } = await import('./schema-embedded')
      statements = schemaStatements
      console.log('Using embedded schema')
    } catch {
      // Fallback to reading from file
      const fs = await import('fs')
      const path = await import('path')
      const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql')
      
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf-8')
        statements = schema
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'))
        console.log('Using schema file')
      } else {
        throw new Error(`Schema file not found at: ${schemaPath}`)
      }
    }

    // Execute schema statements one by one
    for (const statement of statements) {
      if (statement) {
        try {
          await pool.query(statement)
        } catch (error: any) {
          // Ignore "already exists" errors
          if (!error.message?.includes('already exists') && !error.message?.includes('duplicate')) {
            console.error('Schema execution error:', error.message)
            throw error
          }
        }
      }
    }

    // Seed database
    const { seedDatabase } = await import('./seed')
    await seedDatabase()
  } catch (error: any) {
    console.error('initializeDatabase error:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      path: error?.path
    })
    throw error
  }
}

