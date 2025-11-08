// User Role Types
export type UserRole = "SUPER_ADMIN" | "ADMIN" | "COUNSELOR" | "STUDENT"

// User Status
export type UserStatus = "ACTIVE" | "SUSPENDED" | "INACTIVE"

// User Interface
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt: string
  lastLogin?: string
  assignedCounselorId?: string // For leads assigned to counselors
  createdById?: string // Who created this user (for Admins/Counselors)
  avatar?: string
  phone?: string
}

// Lead Interface (extended)
export interface Lead {
  id: string
  name: string
  course: string
  source: "Website" | "Referral" | "Social Media" | "Email" | "Walk-in" | "Other"
  status: "New" | "In Progress" | "Converted" | "Lost"
  assignedCounselorId: string
  assignedCounselor: string
  lastContact: string
  email?: string
  phone?: string
  notes?: string
  createdById?: string
  createdAt?: string
  // Enhanced features
  leadScore?: number // AI-based lead scoring (0-100)
  engagementLevel?: "High" | "Medium" | "Low"
  predictedConversionRate?: number // AI prediction (0-100)
  region?: string
  department?: string
  statusHistory?: LeadStatusHistory[]
  duplicateCheck?: boolean
  recommendedCourses?: string[]
  lastEngagementDate?: string
  totalInteractions?: number
}

// Notice Interface
export interface Notice {
  id: string
  title: string
  content: string
  type: "ANNOUNCEMENT" | "REMINDER" | "ALERT" | "INFO"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  createdById: string
  createdBy: string
  createdAt: string
  targetRoles?: UserRole[] // If specified, only these roles can see it
  isActive: boolean
}

// Task Interface
export interface Task {
  id: string
  title: string
  description: string
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  assignedToId: string
  assignedTo: string
  createdById: string
  dueDate: string
  relatedLeadId?: string
  relatedStudentId?: string
  // Enhanced features
  autoReminder?: boolean
  calendarSync?: "google" | "outlook" | "none"
  reminderSent?: boolean
  reminderDate?: string
  tags?: string[]
}

// System Settings Interface
export interface SystemSettings {
  id: string
  universityName: string
  logo?: string
  theme: "light" | "dark" | "auto"
  apiKeys?: {
    email?: string
    sms?: string
    payment?: string
  }
  features: {
    chatbot: boolean
    notifications: boolean
    reports: boolean
  }
}

// Analytics Interface
export interface DashboardAnalytics {
  totalLeads: number
  newLeads: number
  convertedLeads: number
  totalStudents: number
  activeCounselors: number
  conversionRate: number
  leadsBySource: { source: string; count: number }[]
  leadsByStatus: { status: string; count: number }[]
  counselorPerformance: {
    counselorId: string
    counselorName: string
    totalLeads: number
    converted: number
    conversionRate: number
  }[]
}

// Student Interface (extends User with student-specific data)
export interface Student extends User {
  rollNo: string
  course: string
  year: string
  semester: string
  admissionDate: string
  fatherName?: string
  dateOfBirth?: string
  address?: string
  attendance?: number
  cgpa?: number
  photo?: string
  studentId?: string // Link to student ID if converted from lead
}

// Lead Status History
export interface LeadStatusHistory {
  id: string
  leadId: string
  status: Lead["status"]
  changedBy: string
  changedById: string
  changedAt: string
  notes?: string
}

// Activity Log
export interface ActivityLog {
  id: string
  userId: string
  userName: string
  action: string
  entityType: "lead" | "user" | "task" | "notice" | "document" | "student"
  entityId: string
  entityName: string
  details?: string
  ipAddress?: string
  timestamp: string
}

// Chat Message
export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  receiverId: string
  receiverName: string
  message: string
  timestamp: string
  read: boolean
  type: "text" | "file" | "system"
}

// Document
export interface Document {
  id: string
  name: string
  type: "Admission Letter" | "ID Proof" | "Marksheet" | "Certificate" | "Other"
  studentId?: string
  leadId?: string
  uploadedBy: string
  uploadedById: string
  uploadedDate: string
  status: "Pending" | "Approved" | "Rejected"
  fileUrl?: string
  fileSize?: number
  mimeType?: string
  approvedBy?: string
  approvedById?: string
  approvedDate?: string
  rejectionReason?: string
}

// Auto Assignment Rule
export interface AutoAssignmentRule {
  id: string
  name: string
  criteria: {
    region?: string[]
    department?: string[]
    source?: string[]
    course?: string[]
  }
  assignedCounselorId: string
  assignedCounselor: string
  priority: number
  isActive: boolean
}

// AI Recommendation
export interface AIRecommendation {
  id: string
  leadId: string
  type: "course" | "follow_up" | "conversion"
  recommendation: string
  confidence: number
  reasoning?: string
  createdAt: string
}

// Notification
export interface Notification {
  id: string
  userId: string
  type: "task" | "lead" | "message" | "system" | "reminder"
  title: string
  message: string
  read: boolean
  link?: string
  createdAt: string
  priority: "low" | "medium" | "high"
}

