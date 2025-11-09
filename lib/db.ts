import { Pool } from 'pg'

// Database connection string
const connectionString = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_j2J4eydRhPHf@ep-calm-heart-ahxf6w1a-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

// Create a connection pool
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

export { pool }

