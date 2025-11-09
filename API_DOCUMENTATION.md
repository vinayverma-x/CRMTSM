# API Documentation - Super Admin Backend

All API routes are prefixed with `/api` and require database initialization.

## Authentication

### POST `/api/auth/login`
Login user
- Body: `{ email, password }`
- Returns: User/Student object

## Dashboard

### GET `/api/dashboard`
Get dashboard analytics
- Returns: Analytics data including total leads, new leads, converted leads, students, counselors, conversion rates, leads by source/status, and counselor performance

## Leads

### GET `/api/leads`
Get all leads
- Query params: `status`, `counselorId`
- Returns: Array of leads with recommended courses

### POST `/api/leads`
Create new lead
- Body: `{ name, course, source, email, phone, assignedCounselorId, createdById, region, department, notes, recommendedCourses }`
- Returns: Created lead

### GET `/api/leads/[id]`
Get lead by ID
- Returns: Lead with status history and recommended courses

### PUT `/api/leads/[id]`
Update lead
- Body: `{ name, course, source, status, email, phone, assignedCounselorId, region, department, notes, leadScore, engagementLevel, predictedConversionRate, recommendedCourses }`
- Returns: Updated lead

### DELETE `/api/leads/[id]`
Delete lead

## Tasks

### GET `/api/tasks`
Get all tasks
- Query params: `status`, `assignedToId`, `createdById`
- Returns: Array of tasks with tags

### POST `/api/tasks`
Create new task
- Body: `{ title, description, status, priority, assignedToId, createdById, dueDate, relatedLeadId, relatedStudentId, autoReminder, calendarSync, reminderDate, tags }`
- Returns: Created task

### GET `/api/tasks/[id]`
Get task by ID
- Returns: Task with tags

### PUT `/api/tasks/[id]`
Update task
- Body: `{ title, description, status, priority, assignedToId, dueDate, autoReminder, calendarSync, reminderDate, tags }`
- Returns: Updated task

### DELETE `/api/tasks/[id]`
Delete task

## Notices

### GET `/api/notices`
Get all notices
- Query params: `isActive`, `role` (filter by target role)
- Returns: Array of notices with target roles

### POST `/api/notices`
Create new notice
- Body: `{ title, content, type, priority, createdById, targetRoles, isActive }`
- Returns: Created notice

### GET `/api/notices/[id]`
Get notice by ID
- Returns: Notice with target roles

### PUT `/api/notices/[id]`
Update notice
- Body: `{ title, content, type, priority, targetRoles, isActive }`
- Returns: Updated notice

### DELETE `/api/notices/[id]`
Delete notice

## Payments

### GET `/api/payments`
Get all payments
- Query params: `studentId`, `status`
- Returns: Array of payments with student info

### POST `/api/payments`
Create new payment
- Body: `{ studentId, amount, paymentType, paymentMethod, paymentDate, dueDate, status, transactionId, receiptNumber, notes, createdById }`
- Returns: Created payment

### GET `/api/payments/[id]`
Get payment by ID
- Returns: Payment with student info

### PUT `/api/payments/[id]`
Update payment
- Body: `{ amount, paymentType, paymentMethod, paymentDate, dueDate, status, transactionId, receiptNumber, notes }`
- Returns: Updated payment

### DELETE `/api/payments/[id]`
Delete payment

## Auto Assignment

### GET `/api/auto-assignment`
Get all auto assignment rules
- Returns: Array of rules with criteria

### POST `/api/auto-assignment`
Create new rule
- Body: `{ name, criteria: { region?, department?, source?, course? }, assignedCounselorId, priority, isActive }`
- Returns: Created rule

### GET `/api/auto-assignment/[id]`
Get rule by ID
- Returns: Rule with criteria

### PUT `/api/auto-assignment/[id]`
Update rule
- Body: `{ name, criteria, assignedCounselorId, priority, isActive }`
- Returns: Updated rule

### DELETE `/api/auto-assignment/[id]`
Delete rule

## Chat

### GET `/api/chat`
Get chat messages
- Query params: `userId` (required), `conversationWith` (optional)
- Returns: Array of messages

### POST `/api/chat`
Send new message
- Body: `{ senderId, receiverId, message, type }`
- Returns: Created message

### PUT `/api/chat/[id]/read`
Mark message as read
- Returns: Updated message

## Activity Logs

### GET `/api/activity-logs`
Get activity logs
- Query params: `userId`, `entityType`, `entityId`, `limit` (default: 100)
- Returns: Array of activity logs

### POST `/api/activity-logs`
Create activity log
- Body: `{ userId, action, entityType, entityId, entityName, details, ipAddress }`
- Returns: Created log

## Reports

### GET `/api/reports`
Get reports data
- Query params: `type` (overview|leads|counselors|payments|students), `startDate`, `endDate`
- Returns: Report data based on type

## Settings

### GET `/api/settings`
Get system settings
- Returns: System settings object

### PUT `/api/settings`
Update system settings
- Body: `{ universityName, logo, theme, features: { chatbot, notifications, reports }, apiKeys: { email, sms, payment } }`
- Returns: Updated settings

## Users (Already Created)

### GET `/api/users`
Get all users (except students)

### POST `/api/users`
Create new user

### GET `/api/users/[id]`
Get user by ID

### PUT `/api/users/[id]`
Update user

### DELETE `/api/users/[id]`
Delete user

## Students (Already Created)

### GET `/api/students`
Get all students

### POST `/api/students`
Create new student

### GET `/api/students/[id]`
Get student by ID

### PUT `/api/students/[id]`
Update student

### DELETE `/api/students/[id]`
Delete student

## Database Initialization

### POST `/api/db/init`
Initialize database (creates tables and seeds data)
- Note: This is automatically called on first API request

