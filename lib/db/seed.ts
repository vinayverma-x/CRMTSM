import { pool } from '../db'

// Note: In production, use bcryptjs. For now, we'll use a simple hash
// Install bcryptjs: npm install bcryptjs @types/bcryptjs

async function hashPassword(password: string): Promise<string> {
  // For demo purposes, we'll use a simple hash
  // In production, use: return bcrypt.hash(password, 10)
  return password // For now, store plain password (NOT FOR PRODUCTION)
}

export async function seedDatabase(forceReseed: boolean = false) {
  try {
    console.log('Starting database seeding...')

    // Hash password for demo (in production, use proper bcrypt)
    const defaultPassword = await hashPassword('password123')

    // Always seed/update Super Admin first
    await pool.query(`
      INSERT INTO users (id, name, email, password_hash, role, status, created_at, last_login, avatar)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        last_login = EXCLUDED.last_login,
        avatar = EXCLUDED.avatar
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
    console.log('Super Admin seeded/updated')

    // Check if we should skip seeding (unless forceReseed is true)
    if (!forceReseed) {
      const adminCount = await pool.query('SELECT COUNT(*) FROM users WHERE role = \'ADMIN\'')
      const counselorCount = await pool.query('SELECT COUNT(*) FROM users WHERE role = \'COUNSELOR\'')
      const studentCount = await pool.query('SELECT COUNT(*) FROM students')
      
      const hasAdmin = parseInt(adminCount.rows[0].count) > 0
      const hasCounselor = parseInt(counselorCount.rows[0].count) > 0
      const hasStudent = parseInt(studentCount.rows[0].count) > 0
      
      if (hasAdmin && hasCounselor && hasStudent) {
        console.log('Database already has seed data. Skipping seed.')
        console.log(`- Admins: ${adminCount.rows[0].count}`)
        console.log(`- Counselors: ${counselorCount.rows[0].count}`)
        console.log(`- Students: ${studentCount.rows[0].count}`)
        return
      } else {
        console.log('Missing seed data. Seeding...')
        console.log(`- Admins: ${adminCount.rows[0].count}, Counselors: ${counselorCount.rows[0].count}, Students: ${studentCount.rows[0].count}`)
      }
    } else {
      console.log('Force reseed requested. Seeding all data...')
    }

    // Insert Admin (use ON CONFLICT to handle existing records)
    await pool.query(`
      INSERT INTO users (id, name, email, password_hash, role, status, created_at, last_login, created_by_id, avatar)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        last_login = EXCLUDED.last_login,
        created_by_id = EXCLUDED.created_by_id,
        avatar = EXCLUDED.avatar
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
    console.log('Admin user seeded/updated')

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
          phone = EXCLUDED.phone,
          created_by_id = EXCLUDED.created_by_id
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
    console.log(`${counselors.length} counselors seeded/updated`)

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
      // Generate separate IDs for user and student record
      const userId = student.id
      const studentId = student.id + '_student'

      // Insert user first
      await pool.query(`
        INSERT INTO users (id, name, email, password_hash, role, status, created_at, last_login, phone, created_by_id)
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
        userId,
        student.name,
        student.email,
        defaultPassword,
        'STUDENT',
        'ACTIVE',
        student.created_at,
        student.last_login,
        student.phone,
        '1' // Created by Super Admin
      ])

      // Insert student details
      // First check if student record exists for this user_id
      const existingStudent = await pool.query('SELECT id FROM students WHERE user_id = $1', [userId])
      
      if (existingStudent.rows.length > 0) {
        // Update existing student record
        await pool.query(`
          UPDATE students SET
            roll_no = $1,
            course = $2,
            year = $3,
            semester = $4,
            admission_date = $5,
            father_name = $6,
            date_of_birth = $7,
            address = $8,
            attendance = $9,
            cgpa = $10,
            photo = $11
          WHERE user_id = $12
        `, [
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
          student.photo,
          userId
        ])
      } else {
        // Insert new student record
        await pool.query(`
          INSERT INTO students (id, user_id, roll_no, course, year, semester, admission_date, father_name, date_of_birth, address, attendance, cgpa, photo)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          studentId,
          userId, // user_id references users table
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
    }
    console.log(`${students.length} students seeded/updated`)

    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

