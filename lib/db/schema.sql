-- Users table (for admins, counselors)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'COUNSELOR', 'STUDENT')),
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'INACTIVE')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  assigned_counselor_id VARCHAR(255),
  created_by_id VARCHAR(255),
  avatar VARCHAR(500),
  phone VARCHAR(50),
  FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Students table (extends users with student-specific data)
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  roll_no VARCHAR(100) UNIQUE NOT NULL,
  course VARCHAR(255) NOT NULL,
  year VARCHAR(50) NOT NULL,
  semester VARCHAR(50) NOT NULL,
  admission_date DATE NOT NULL,
  father_name VARCHAR(255),
  date_of_birth DATE,
  address TEXT,
  attendance DECIMAL(5,2),
  cgpa DECIMAL(4,2),
  photo VARCHAR(500),
  student_id VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_roll_no ON students(roll_no);

