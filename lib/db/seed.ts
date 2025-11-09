import { pool } from '../db'

// Note: In production, use bcryptjs. For now, we'll use a simple hash
// Install bcryptjs: npm install bcryptjs @types/bcryptjs

async function hashPassword(password: string): Promise<string> {
  // For demo purposes, we'll use a simple hash
  // In production, use: return bcrypt.hash(password, 10)
  return password // For now, store plain password (NOT FOR PRODUCTION)
}

export async function seedDatabase() {
  try {
    console.log('Starting database seeding...')

    // Check if data already exists - if so, skip seeding
    const userCount = await pool.query('SELECT COUNT(*) FROM users WHERE role != \'SUPER_ADMIN\'')
    if (parseInt(userCount.rows[0].count) > 0) {
      console.log('Database already has data. Skipping seed.')
      return
    }

    // Hash password for demo (in production, use proper bcrypt)
    const defaultPassword = await hashPassword('password123')

    // Insert Super Admin
    await pool.query(`
      INSERT INTO users (id, name, email, password_hash, role, status, created_at, last_login, avatar)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        last_login = EXCLUDED.last_login
    `, [
      '1',
      'Super Admin',
      'superadmin@tsm.university',
      defaultPassword,
      'SUPER_ADMIN',
      'ACTIVE',
      '2024-01-01',
      '2024-11-01',
      '/admin-profile.png'
    ])

    // Insert Admin
    await pool.query(`
      INSERT INTO users (id, name, email, password_hash, role, status, created_at, last_login, created_by_id, avatar)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        last_login = EXCLUDED.last_login
    `, [
      '2',
      'Admin User',
      'admin@tsm.university',
      defaultPassword,
      'ADMIN',
      'ACTIVE',
      '2024-01-15',
      '2024-11-01',
      '1',
      '/admin-profile.png'
    ])

    // Insert Counselors
    const counselors = [
      {
        id: '3',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@tsm.university',
        phone: '+1-555-0101',
        created_at: '2024-02-01',
        last_login: '2024-10-31'
      },
      {
        id: '4',
        name: 'Michael Chen',
        email: 'michael.chen@tsm.university',
        phone: '+1-555-0102',
        created_at: '2024-02-05',
        last_login: '2024-10-30'
      },
      {
        id: '5',
        name: 'David Kumar',
        email: 'david.kumar@tsm.university',
        phone: '+1-555-0103',
        created_at: '2024-02-10',
        last_login: '2024-10-29'
      }
    ]

    for (const counselor of counselors) {
      await pool.query(`
        INSERT INTO users (id, name, email, password_hash, role, status, created_at, last_login, created_by_id, phone)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          status = EXCLUDED.status,
          last_login = EXCLUDED.last_login,
          phone = EXCLUDED.phone
      `, [
        counselor.id,
        counselor.name,
        counselor.email,
        defaultPassword,
        'COUNSELOR',
        'ACTIVE',
        counselor.created_at,
        counselor.last_login,
        '2',
        counselor.phone
      ])
    }

    // Insert Students (as users first, then student details)
    const students = [
      {
        id: '6',
        name: 'Raj Kumar',
        email: 'raj.kumar@tsm.university',
        phone: '+91-9876543210',
        rollNo: 'STU001',
        course: 'B.Tech Computer Science',
        year: '3rd Year',
        semester: '5th Semester',
        admissionDate: '2022-07-15',
        fatherName: 'Ramesh Kumar',
        dateOfBirth: '2002-05-15',
        address: '123 Main Street, Delhi, India',
        attendance: 92,
        cgpa: 8.4,
        photo: '/student-profile.png',
        created_at: '2024-07-15',
        last_login: '2024-11-01'
      },
      {
        id: '7',
        name: 'Priya Sharma',
        email: 'priya.sharma@tsm.university',
        phone: '+91-9876543211',
        rollNo: 'STU002',
        course: 'B.Tech Business Administration',
        year: '2nd Year',
        semester: '3rd Semester',
        admissionDate: '2023-07-20',
        fatherName: 'Suresh Sharma',
        dateOfBirth: '2003-08-20',
        address: '456 Park Avenue, Mumbai, India',
        attendance: 88,
        cgpa: 8.1,
        photo: '/student-profile.png',
        created_at: '2024-07-20',
        last_login: '2024-10-30'
      },
      {
        id: '8',
        name: 'Amit Patel',
        email: 'amit.patel@tsm.university',
        phone: '+91-9876543212',
        rollNo: 'STU003',
        course: 'B.Tech Engineering',
        year: '1st Year',
        semester: '1st Semester',
        admissionDate: '2024-08-01',
        fatherName: 'Mahesh Patel',
        dateOfBirth: '2004-03-10',
        address: '789 Tech Street, Bangalore, India',
        attendance: 95,
        cgpa: 8.7,
        photo: '/student-profile.png',
        created_at: '2024-08-01',
        last_login: '2024-10-29'
      }
    ]

    for (const student of students) {
      // Insert user first
      await pool.query(`
        INSERT INTO users (id, name, email, password_hash, role, status, created_at, last_login, phone)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          status = EXCLUDED.status,
          last_login = EXCLUDED.last_login,
          phone = EXCLUDED.phone
      `, [
        student.id,
        student.name,
        student.email,
        defaultPassword,
        'STUDENT',
        'ACTIVE',
        student.created_at,
        student.last_login,
        student.phone
      ])

      // Insert student details
      await pool.query(`
        INSERT INTO students (id, user_id, roll_no, course, year, semester, admission_date, father_name, date_of_birth, address, attendance, cgpa, photo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          roll_no = EXCLUDED.roll_no,
          course = EXCLUDED.course,
          year = EXCLUDED.year,
          semester = EXCLUDED.semester,
          admission_date = EXCLUDED.admission_date,
          father_name = EXCLUDED.father_name,
          date_of_birth = EXCLUDED.date_of_birth,
          address = EXCLUDED.address,
          attendance = EXCLUDED.attendance,
          cgpa = EXCLUDED.cgpa,
          photo = EXCLUDED.photo
      `, [
        student.id,
        student.id, // user_id same as id
        student.rollNo,
        student.course,
        student.year,
        student.semester,
        student.admissionDate,
        student.fatherName,
        student.dateOfBirth,
        student.address,
        student.attendance,
        student.cgpa,
        student.photo
      ])
    }

    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

