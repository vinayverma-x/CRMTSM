// Embedded schema for serverless environments (Vercel)
// This avoids file system access issues

export const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS users (
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
  )`,
  `CREATE TABLE IF NOT EXISTS students (
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
  )`,
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`,
  `CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)`,
  `CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_students_roll_no ON students(roll_no)`,
  // Leads table
  `CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    course VARCHAR(255) NOT NULL,
    source VARCHAR(50) NOT NULL CHECK (source IN ('Website', 'Referral', 'Social Media', 'Email', 'Walk-in', 'Other')),
    status VARCHAR(50) NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Converted', 'Lost')),
    assigned_counselor_id VARCHAR(255),
    last_contact DATE,
    email VARCHAR(255),
    phone VARCHAR(50),
    notes TEXT,
    created_by_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lead_score DECIMAL(5,2),
    engagement_level VARCHAR(20) CHECK (engagement_level IN ('High', 'Medium', 'Low')),
    predicted_conversion_rate DECIMAL(5,2),
    region VARCHAR(100),
    department VARCHAR(100),
    duplicate_check BOOLEAN DEFAULT false,
    last_engagement_date DATE,
    total_interactions INTEGER DEFAULT 0,
    FOREIGN KEY (assigned_counselor_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_counselor ON leads(assigned_counselor_id)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at)`,
  // Lead status history
  `CREATE TABLE IF NOT EXISTS lead_status_history (
    id VARCHAR(255) PRIMARY KEY,
    lead_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(255) NOT NULL,
    changed_by_id VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_id) REFERENCES users(id) ON DELETE SET NULL
  )`,
  // Recommended courses (many-to-many for leads)
  `CREATE TABLE IF NOT EXISTS lead_recommended_courses (
    id VARCHAR(255) PRIMARY KEY,
    lead_id VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
  )`,
  // Tasks table
  `CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    assigned_to_id VARCHAR(255) NOT NULL,
    created_by_id VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    related_lead_id VARCHAR(255),
    related_student_id VARCHAR(255),
    auto_reminder BOOLEAN DEFAULT false,
    calendar_sync VARCHAR(20) CHECK (calendar_sync IN ('google', 'outlook', 'none')),
    reminder_sent BOOLEAN DEFAULT false,
    reminder_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (related_lead_id) REFERENCES leads(id) ON DELETE SET NULL,
    FOREIGN KEY (related_student_id) REFERENCES students(id) ON DELETE SET NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to_id)`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)`,
  // Task tags (many-to-many)
  `CREATE TABLE IF NOT EXISTS task_tags (
    id VARCHAR(255) PRIMARY KEY,
    task_id VARCHAR(255) NOT NULL,
    tag VARCHAR(100) NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  )`,
  // Notices table
  `CREATE TABLE IF NOT EXISTS notices (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('ANNOUNCEMENT', 'REMINDER', 'ALERT', 'INFO')),
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    created_by_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_notices_is_active ON notices(is_active)`,
  `CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at)`,
  // Notice target roles (many-to-many)
  `CREATE TABLE IF NOT EXISTS notice_target_roles (
    id VARCHAR(255) PRIMARY KEY,
    notice_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE
  )`,
  // Payments table
  `CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(255) PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('Tuition', 'Registration', 'Library', 'Hostel', 'Other')),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('Cash', 'Card', 'Bank Transfer', 'UPI', 'Cheque', 'Other')),
    payment_date DATE NOT NULL,
    due_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Failed', 'Refunded')),
    transaction_id VARCHAR(255),
    receipt_number VARCHAR(255),
    notes TEXT,
    created_by_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id)`,
  `CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)`,
  // Documents table
  `CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(255) PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size DECIMAL(10,2),
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    notes TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_documents_student_id ON documents(student_id)`,
  `CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type)`,
  // Auto assignment rules
  `CREATE TABLE IF NOT EXISTS auto_assignment_rules (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    assigned_counselor_id VARCHAR(255) NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_counselor_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  // Auto assignment criteria (JSON stored as TEXT, or separate table)
  `CREATE TABLE IF NOT EXISTS auto_assignment_criteria (
    id VARCHAR(255) PRIMARY KEY,
    rule_id VARCHAR(255) NOT NULL,
    criteria_type VARCHAR(50) NOT NULL CHECK (criteria_type IN ('region', 'department', 'source', 'course')),
    criteria_value VARCHAR(255) NOT NULL,
    FOREIGN KEY (rule_id) REFERENCES auto_assignment_rules(id) ON DELETE CASCADE
  )`,
  // Chat messages
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(255) PRIMARY KEY,
    sender_id VARCHAR(255) NOT NULL,
    receiver_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_chat_sender ON chat_messages(sender_id)`,
  `CREATE INDEX IF NOT EXISTS idx_chat_receiver ON chat_messages(receiver_id)`,
  `CREATE INDEX IF NOT EXISTS idx_chat_created_at ON chat_messages(created_at)`,
  // Activity logs
  `CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('lead', 'user', 'task', 'notice', 'document', 'student', 'payment')),
    entity_id VARCHAR(255) NOT NULL,
    entity_name VARCHAR(255),
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity_logs(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_logs(entity_type, entity_id)`,
  `CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_logs(created_at)`,
  // System settings
  `CREATE TABLE IF NOT EXISTS system_settings (
    id VARCHAR(255) PRIMARY KEY DEFAULT '1',
    university_name VARCHAR(255) NOT NULL,
    logo VARCHAR(500),
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    chatbot_enabled BOOLEAN DEFAULT true,
    notifications_enabled BOOLEAN DEFAULT true,
    reports_enabled BOOLEAN DEFAULT true,
    email_api_key VARCHAR(500),
    sms_api_key VARCHAR(500),
    payment_api_key VARCHAR(500),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`
]

