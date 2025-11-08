import {
  User,
  Lead,
  Notice,
  Task,
  SystemSettings,
  DashboardAnalytics,
  Student,
  ActivityLog,
  ChatMessage,
  Document,
  AutoAssignmentRule,
  AIRecommendation,
  Notification,
  LeadStatusHistory,
} from "@/lib/types"

// Dummy Users
export const dummyUsers: User[] = [
  {
    id: "1",
    name: "Super Admin",
    email: "superadmin@tsm.university",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    createdAt: "2024-01-01",
    lastLogin: "2024-11-01",
    avatar: "/admin-profile.png",
  },
  {
    id: "2",
    name: "Admin User",
    email: "admin@tsm.university",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: "2024-01-15",
    lastLogin: "2024-11-01",
    createdById: "1",
    avatar: "/admin-profile.png",
  },
  {
    id: "3",
    name: "Sarah Johnson",
    email: "sarah.johnson@tsm.university",
    role: "COUNSELOR",
    status: "ACTIVE",
    createdAt: "2024-02-01",
    lastLogin: "2024-10-31",
    createdById: "2",
    phone: "+1-555-0101",
  },
  {
    id: "4",
    name: "Michael Chen",
    email: "michael.chen@tsm.university",
    role: "COUNSELOR",
    status: "ACTIVE",
    createdAt: "2024-02-05",
    lastLogin: "2024-10-30",
    createdById: "2",
    phone: "+1-555-0102",
  },
  {
    id: "5",
    name: "David Kumar",
    email: "david.kumar@tsm.university",
    role: "COUNSELOR",
    status: "ACTIVE",
    createdAt: "2024-02-10",
    lastLogin: "2024-10-29",
    createdById: "2",
    phone: "+1-555-0103",
  },
  // Student Users
  {
    id: "6",
    name: "Raj Kumar",
    email: "raj.kumar@tsm.university",
    role: "STUDENT",
    status: "ACTIVE",
    createdAt: "2024-07-15",
    lastLogin: "2024-11-01",
    phone: "+91-9876543210",
  },
  {
    id: "7",
    name: "Priya Sharma",
    email: "priya.sharma@tsm.university",
    role: "STUDENT",
    status: "ACTIVE",
    createdAt: "2024-07-20",
    lastLogin: "2024-10-30",
    phone: "+91-9876543211",
  },
  {
    id: "8",
    name: "Amit Patel",
    email: "amit.patel@tsm.university",
    role: "STUDENT",
    status: "ACTIVE",
    createdAt: "2024-08-01",
    lastLogin: "2024-10-29",
    phone: "+91-9876543212",
  },
]

// Dummy Leads (Enhanced with AI features)
export const dummyLeads: Lead[] = [
  {
    id: "1",
    name: "John Smith",
    course: "Computer Science",
    source: "Website",
    status: "New",
    assignedCounselorId: "3",
    assignedCounselor: "Sarah Johnson",
    lastContact: "2024-11-01",
    email: "john@example.com",
    phone: "+1-555-0201",
    createdById: "2",
    createdAt: "2024-11-01",
    leadScore: 85,
    engagementLevel: "High",
    predictedConversionRate: 78,
    region: "North",
    department: "Technology",
    totalInteractions: 12,
    lastEngagementDate: "2024-11-01",
    recommendedCourses: ["Computer Science", "Data Science", "AI & ML"],
    duplicateCheck: false,
  },
  {
    id: "2",
    name: "Emily Davis",
    course: "Business Administration",
    source: "Referral",
    status: "In Progress",
    assignedCounselorId: "4",
    assignedCounselor: "Michael Chen",
    lastContact: "2024-10-28",
    email: "emily@example.com",
    phone: "+1-555-0202",
    createdById: "2",
    createdAt: "2024-10-25",
    leadScore: 72,
    engagementLevel: "Medium",
    predictedConversionRate: 65,
    region: "South",
    department: "Business",
    totalInteractions: 8,
    lastEngagementDate: "2024-10-28",
    recommendedCourses: ["Business Administration", "MBA", "Finance"],
    duplicateCheck: false,
  },
  {
    id: "3",
    name: "Alex Thompson",
    course: "Engineering",
    source: "Social Media",
    status: "Converted",
    assignedCounselorId: "3",
    assignedCounselor: "Sarah Johnson",
    lastContact: "2024-10-15",
    email: "alex@example.com",
    phone: "+1-555-0203",
    createdById: "2",
    createdAt: "2024-10-10",
    leadScore: 95,
    engagementLevel: "High",
    predictedConversionRate: 92,
    region: "East",
    department: "Engineering",
    totalInteractions: 20,
    lastEngagementDate: "2024-10-15",
    recommendedCourses: ["Engineering", "Mechanical Engineering"],
    duplicateCheck: false,
  },
  {
    id: "4",
    name: "Jessica Lee",
    course: "Medicine",
    source: "Email",
    status: "In Progress",
    assignedCounselorId: "5",
    assignedCounselor: "David Kumar",
    lastContact: "2024-10-20",
    email: "jessica@example.com",
    phone: "+1-555-0204",
    createdById: "2",
    createdAt: "2024-10-18",
    leadScore: 68,
    engagementLevel: "Medium",
    predictedConversionRate: 55,
    region: "West",
    department: "Medicine",
    totalInteractions: 6,
    lastEngagementDate: "2024-10-20",
    recommendedCourses: ["Medicine", "Nursing", "Pharmacy"],
    duplicateCheck: false,
  },
  {
    id: "5",
    name: "Robert Wilson",
    course: "Law",
    source: "Website",
    status: "Lost",
    assignedCounselorId: "4",
    assignedCounselor: "Michael Chen",
    lastContact: "2024-09-30",
    email: "robert@example.com",
    phone: "+1-555-0205",
    createdById: "2",
    createdAt: "2024-09-25",
    leadScore: 35,
    engagementLevel: "Low",
    predictedConversionRate: 25,
    region: "North",
    department: "Law",
    totalInteractions: 3,
    lastEngagementDate: "2024-09-30",
    recommendedCourses: ["Law", "Criminal Justice"],
    duplicateCheck: false,
  },
  {
    id: "6",
    name: "Maria Garcia",
    course: "Data Science",
    source: "Website",
    status: "New",
    assignedCounselorId: "3",
    assignedCounselor: "Sarah Johnson",
    lastContact: "2024-11-02",
    email: "maria@example.com",
    phone: "+1-555-0206",
    createdById: "2",
    createdAt: "2024-11-02",
    leadScore: 90,
    engagementLevel: "High",
    predictedConversionRate: 85,
    region: "Central",
    department: "Technology",
    totalInteractions: 15,
    lastEngagementDate: "2024-11-02",
    recommendedCourses: ["Data Science", "AI & ML", "Computer Science"],
    duplicateCheck: false,
  },
]

// Dummy Notices
export const dummyNotices: Notice[] = [
  {
    id: "1",
    title: "New Admission Process Guidelines",
    content: "Please review the updated admission process guidelines. All counselors must follow the new protocol when handling leads.",
    type: "ANNOUNCEMENT",
    priority: "HIGH",
    createdById: "2",
    createdBy: "Admin User",
    createdAt: "2024-11-01",
    targetRoles: ["ADMIN", "COUNSELOR"],
    isActive: true,
  },
  {
    id: "2",
    title: "Quarterly Performance Review",
    content: "The quarterly performance review meeting will be held on November 15th. All counselors are requested to prepare their reports.",
    type: "REMINDER",
    priority: "MEDIUM",
    createdById: "2",
    createdBy: "Admin User",
    createdAt: "2024-10-28",
    targetRoles: ["COUNSELOR"],
    isActive: true,
  },
  {
    id: "3",
    title: "System Maintenance",
    content: "The CRM system will undergo maintenance on November 5th from 2 AM to 4 AM. Please save your work before that time.",
    type: "ALERT",
    priority: "URGENT",
    createdById: "1",
    createdBy: "Super Admin",
    createdAt: "2024-10-30",
    isActive: true,
  },
  {
    id: "4",
    title: "Mid-Semester Examinations",
    content: "Mid-semester examinations will begin on November 20th. Please check your examination schedule on the student portal.",
    type: "ANNOUNCEMENT",
    priority: "HIGH",
    createdById: "2",
    createdBy: "Admin User",
    createdAt: "2024-11-01",
    targetRoles: ["STUDENT"],
    isActive: true,
  },
  {
    id: "5",
    title: "Fee Payment Deadline",
    content: "Reminder: The deadline for fee payment for the current semester is November 15th. Please complete your payment to avoid late fees.",
    type: "REMINDER",
    priority: "HIGH",
    createdById: "2",
    createdBy: "Admin User",
    createdAt: "2024-10-28",
    targetRoles: ["STUDENT"],
    isActive: true,
  },
]

// Dummy Tasks
export const dummyTasks: Task[] = [
  {
    id: "1",
    title: "Follow up with John Smith",
    description: "Call John Smith to discuss Computer Science program details",
    status: "PENDING",
    priority: "HIGH",
    assignedToId: "3",
    assignedTo: "Sarah Johnson",
    createdById: "2",
    dueDate: "2024-11-05",
    relatedLeadId: "1",
  },
  {
    id: "2",
    title: "Send admission documents to Emily",
    description: "Email admission documents and fee structure to Emily Davis",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    assignedToId: "4",
    assignedTo: "Michael Chen",
    createdById: "2",
    dueDate: "2024-11-03",
    relatedLeadId: "2",
  },
  {
    id: "3",
    title: "Update student records",
    description: "Update student records for converted leads",
    status: "PENDING",
    priority: "LOW",
    assignedToId: "3",
    assignedTo: "Sarah Johnson",
    createdById: "2",
    dueDate: "2024-11-10",
  },
]

// Dummy System Settings
export const dummySystemSettings: SystemSettings = {
  id: "1",
  universityName: "T.S. Mishra University",
  logo: "/tsm-logo.png",
  theme: "light",
  apiKeys: {
    email: "*******",
    sms: "*******",
    payment: "*******",
  },
  features: {
    chatbot: true,
    notifications: true,
    reports: true,
  },
}

// Dummy Analytics
export const dummyAnalytics: DashboardAnalytics = {
  totalLeads: 150,
  newLeads: 25,
  convertedLeads: 45,
  totalStudents: 120,
  activeCounselors: 3,
  conversionRate: 30,
  leadsBySource: [
    { source: "Website", count: 60 },
    { source: "Referral", count: 40 },
    { source: "Social Media", count: 30 },
    { source: "Email", count: 20 },
  ],
  leadsByStatus: [
    { status: "New", count: 50 },
    { status: "In Progress", count: 55 },
    { status: "Converted", count: 45 },
    { status: "Lost", count: 0 },
  ],
  counselorPerformance: [
    {
      counselorId: "3",
      counselorName: "Sarah Johnson",
      totalLeads: 50,
      converted: 18,
      conversionRate: 36,
    },
    {
      counselorId: "4",
      counselorName: "Michael Chen",
      totalLeads: 45,
      converted: 15,
      conversionRate: 33,
    },
    {
      counselorId: "5",
      counselorName: "David Kumar",
      totalLeads: 55,
      converted: 12,
      conversionRate: 22,
    },
  ],
}

// Helper function to get current user (for demo purposes)
export function getCurrentUser(): User | Student | null {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("currentUser")
  if (!userStr) return null
  try {
    const user = JSON.parse(userStr)
    // If it's a student, try to get full student data
    if (user.role === "STUDENT") {
      const student = getStudentByEmail(user.email)
      return student || user
    }
    return user
  } catch {
    return null
  }
}

// Helper function to set current user
export function setCurrentUser(user: User | Student | null) {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user))
  } else {
    localStorage.removeItem("currentUser")
  }
}

// Helper function to get users by role
export function getUsersByRole(role: string): User[] {
  return dummyUsers.filter((user) => user.role === role)
}

// Helper function to get counselors
export function getCounselors(): User[] {
  return dummyUsers.filter((user) => user.role === "COUNSELOR" && user.status === "ACTIVE")
}

// Helper function to get leads for a counselor
export function getLeadsForCounselor(counselorId: string): Lead[] {
  return dummyLeads.filter((lead) => lead.assignedCounselorId === counselorId)
}

// Helper function to get notices for a role
export function getNoticesForRole(role: User["role"]): Notice[] {
  return dummyNotices.filter(
    (notice) => notice.isActive && (!notice.targetRoles || notice.targetRoles.includes(role))
  )
}

// Dummy Students (Student-specific data)
export const dummyStudents: Student[] = [
  {
    id: "6",
    name: "Raj Kumar",
    email: "raj.kumar@tsm.university",
    role: "STUDENT",
    status: "ACTIVE",
    createdAt: "2024-07-15",
    lastLogin: "2024-11-01",
    phone: "+91-9876543210",
    rollNo: "STU001",
    course: "B.Tech Computer Science",
    year: "3rd Year",
    semester: "5th Semester",
    admissionDate: "2022-07-15",
    fatherName: "Ramesh Kumar",
    dateOfBirth: "2002-05-15",
    address: "123 Main Street, Delhi, India",
    attendance: 92,
    cgpa: 8.4,
    photo: "/student-profile.png",
  },
  {
    id: "7",
    name: "Priya Sharma",
    email: "priya.sharma@tsm.university",
    role: "STUDENT",
    status: "ACTIVE",
    createdAt: "2024-07-20",
    lastLogin: "2024-10-30",
    phone: "+91-9876543211",
    rollNo: "STU002",
    course: "B.Tech Business Administration",
    year: "2nd Year",
    semester: "3rd Semester",
    admissionDate: "2023-07-20",
    fatherName: "Suresh Sharma",
    dateOfBirth: "2003-08-20",
    address: "456 Park Avenue, Mumbai, India",
    attendance: 88,
    cgpa: 8.1,
    photo: "/student-profile.png",
  },
  {
    id: "8",
    name: "Amit Patel",
    email: "amit.patel@tsm.university",
    role: "STUDENT",
    status: "ACTIVE",
    createdAt: "2024-08-01",
    lastLogin: "2024-10-29",
    phone: "+91-9876543212",
    rollNo: "STU003",
    course: "B.Tech Engineering",
    year: "1st Year",
    semester: "1st Semester",
    admissionDate: "2024-08-01",
    fatherName: "Mahesh Patel",
    dateOfBirth: "2004-03-10",
    address: "789 Tech Street, Bangalore, India",
    attendance: 95,
    cgpa: 8.7,
    photo: "/student-profile.png",
  },
]

// Helper function to get student by ID
export function getStudentById(studentId: string): Student | undefined {
  return dummyStudents.find((student) => student.id === studentId)
}

// Helper function to get student by email
export function getStudentByEmail(email: string): Student | undefined {
  return dummyStudents.find((student) => student.email.toLowerCase() === email.toLowerCase())
}

// Dummy Activity Logs
export const dummyActivityLogs: ActivityLog[] = [
  {
    id: "1",
    userId: "3",
    userName: "Sarah Johnson",
    action: "Updated Lead Status",
    entityType: "lead",
    entityId: "1",
    entityName: "John Smith",
    details: "Status changed from 'New' to 'In Progress'",
    ipAddress: "192.168.1.100",
    timestamp: "2024-11-01T10:30:00Z",
  },
  {
    id: "2",
    userId: "2",
    userName: "Admin User",
    action: "Created Lead",
    entityType: "lead",
    entityId: "6",
    entityName: "Maria Garcia",
    details: "New lead created from website",
    ipAddress: "192.168.1.101",
    timestamp: "2024-11-02T09:15:00Z",
  },
  {
    id: "3",
    userId: "1",
    userName: "Super Admin",
    action: "Created User",
    entityType: "user",
    entityId: "5",
    entityName: "David Kumar",
    details: "New counselor account created",
    ipAddress: "192.168.1.102",
    timestamp: "2024-10-15T14:20:00Z",
  },
]

// Dummy Chat Messages
export const dummyChatMessages: ChatMessage[] = [
  {
    id: "1",
    senderId: "2",
    senderName: "Admin User",
    receiverId: "3",
    receiverName: "Sarah Johnson",
    message: "Please follow up with the new leads assigned to you",
    timestamp: "2024-11-01T11:00:00Z",
    read: false,
    type: "text",
  },
  {
    id: "2",
    senderId: "3",
    senderName: "Sarah Johnson",
    receiverId: "2",
    receiverName: "Admin User",
    message: "Will do. I've already contacted John Smith.",
    timestamp: "2024-11-01T11:05:00Z",
    read: true,
    type: "text",
  },
]

// Dummy Documents
export const dummyDocuments: Document[] = [
  {
    id: "1",
    name: "Admission Letter",
    type: "Admission Letter",
    studentId: "6",
    uploadedBy: "Raj Kumar",
    uploadedById: "6",
    uploadedDate: "2024-07-15",
    status: "Approved",
    fileSize: 256000,
    mimeType: "application/pdf",
    approvedBy: "Admin User",
    approvedById: "2",
    approvedDate: "2024-07-16",
  },
  {
    id: "2",
    name: "ID Proof (Aadhar)",
    type: "ID Proof",
    studentId: "6",
    uploadedBy: "Raj Kumar",
    uploadedById: "6",
    uploadedDate: "2024-07-15",
    status: "Approved",
    fileSize: 512000,
    mimeType: "image/jpeg",
    approvedBy: "Admin User",
    approvedById: "2",
    approvedDate: "2024-07-16",
  },
]

// Dummy Auto Assignment Rules
export const dummyAutoAssignmentRules: AutoAssignmentRule[] = [
  {
    id: "1",
    name: "North Region - Technology",
    criteria: {
      region: ["North"],
      department: ["Technology"],
    },
    assignedCounselorId: "3",
    assignedCounselor: "Sarah Johnson",
    priority: 1,
    isActive: true,
  },
  {
    id: "2",
    name: "South Region - Business",
    criteria: {
      region: ["South"],
      department: ["Business"],
    },
    assignedCounselorId: "4",
    assignedCounselor: "Michael Chen",
    priority: 1,
    isActive: true,
  },
]

// Dummy AI Recommendations
export const dummyAIRecommendations: AIRecommendation[] = [
  {
    id: "1",
    leadId: "1",
    type: "course",
    recommendation: "Recommend Data Science course based on high engagement with tech content",
    confidence: 85,
    reasoning: "Lead shows high interest in technology and has engaged with multiple tech-related pages",
    createdAt: "2024-11-01T10:00:00Z",
  },
  {
    id: "2",
    leadId: "1",
    type: "follow_up",
    recommendation: "Schedule follow-up call within 24 hours - high conversion probability",
    confidence: 78,
    reasoning: "Lead score is 85 with high engagement level. Immediate follow-up recommended.",
    createdAt: "2024-11-01T10:00:00Z",
  },
]

// Dummy Notifications
export const dummyNotifications: Notification[] = [
  {
    id: "1",
    userId: "3",
    type: "task",
    title: "Task Due Soon",
    message: "Follow up with John Smith is due in 2 days",
    read: false,
    link: "/tasks",
    createdAt: "2024-11-01T08:00:00Z",
    priority: "high",
  },
  {
    id: "2",
    userId: "2",
    type: "lead",
    title: "New High-Score Lead",
    message: "Maria Garcia has a lead score of 90",
    read: false,
    link: "/leads",
    createdAt: "2024-11-02T09:00:00Z",
    priority: "medium",
  },
]

// Helper functions for new features
export function getActivityLogs(entityType?: ActivityLog["entityType"], entityId?: string): ActivityLog[] {
  let logs = dummyActivityLogs
  if (entityType) {
    logs = logs.filter((log) => log.entityType === entityType)
  }
  if (entityId) {
    logs = logs.filter((log) => log.entityId === entityId)
  }
  return logs
}

export function getChatMessages(userId: string): ChatMessage[] {
  return dummyChatMessages.filter((msg) => msg.senderId === userId || msg.receiverId === userId)
}

export function getUnreadNotifications(userId: string): Notification[] {
  return dummyNotifications.filter((notif) => notif.userId === userId && !notif.read)
}

export function getAIRecommendations(leadId: string): AIRecommendation[] {
  return dummyAIRecommendations.filter((rec) => rec.leadId === leadId)
}

