# Student Permissions & Backend APIs

## Student Role Access

Based on the sidebar menu configuration, **Student** has access to the following features:

### ✅ Student Has Access To:

1. **Dashboard** - View their own academic information (CGPA, attendance, semester, pending fees, documents count)
2. **My Profile** - View and update their own profile information
3. **Payments** - View and manage their own payments
4. **Documents** - View and upload their own documents
5. **Notice Board** - View notices targeted to students
6. **Chatbot** - Use the university chatbot for assistance
7. **Settings** - Update own profile (NOT system settings)

### ❌ Student Does NOT Have Access To:

1. **Leads** - Cannot view or manage leads (Admin/Counselor only)
2. **Auto Assignment** - Cannot access (Admin/Super Admin only)
3. **Students** - Cannot view all students list (Admin/Counselor only)
4. **Tasks** - Cannot view tasks (Admin/Counselor only)
5. **Internal Chat** - Cannot access (Admin/Counselor only)
6. **Reports** - Cannot view reports (Admin/Super Admin only)
7. **Activity Logs** - Cannot view activity logs (Admin/Super Admin only)
8. **User Management** - Cannot manage users (Super Admin only)
9. **System Settings** - Cannot modify system settings (Super Admin only)

## Backend API Authorization

### Student-Specific Filtering:

1. **Dashboard API** (`/api/dashboard`):
   - Returns student-specific data:
     - CGPA
     - Attendance
     - Current semester
     - Pending fees (calculated from pending payments)
     - Documents count
   - Does not return lead statistics or counselor performance

2. **Payments API** (`/api/payments/*`):
   - GET: Only returns payments for the student's own account
   - POST: Student can only create payments for themselves
   - Automatically filters by student's record ID

3. **Documents API** (`/api/documents/*`):
   - GET: Only returns documents uploaded by the student
   - POST: Student can only upload documents for themselves
   - Full CRUD operations restricted to own documents

4. **Profile API** (`/api/profile`):
   - GET: Returns student's own profile with academic details
   - PUT: Student can update their own profile information

5. **Notices API** (`/api/notices`):
   - GET: Only returns notices where target roles include 'STUDENT'
   - Students cannot create notices (read-only)

### Protected Routes (Student Cannot Access):

- `/api/leads/*` - Returns 403 Forbidden
- `/api/auto-assignment/*` - Returns 403 Forbidden
- `/api/students` - Returns 403 Forbidden (use `/api/profile` for own profile)
- `/api/tasks/*` - Returns 403 Forbidden
- `/api/chat/*` - Returns 403 Forbidden
- `/api/reports` - Returns 403 Forbidden
- `/api/activity-logs/*` - Returns 403 Forbidden
- `/api/users/*` - Returns 403 Forbidden
- `/api/settings` - Returns 403 Forbidden (system settings only)

### Student-Accessible Routes:

- `/api/dashboard` - Student-specific academic dashboard
- `/api/profile` - Own profile management
- `/api/payments/*` - Own payments only
- `/api/documents/*` - Own documents only
- `/api/notices` - View notices targeted to students
- `/api/auth/login` - Login endpoint

## Key Implementation Details

### Payment Restrictions:
- Students can only view their own payments
- Students can create payments only for themselves
- Payment filtering is automatic based on student's record ID

### Document Management:
- Students can upload documents only for themselves
- Students can view only their own documents
- Document types can be filtered (e.g., 'Transcript', 'ID Card', 'Certificate')

### Dashboard Data:
- Academic metrics pulled from student record
- Pending fees calculated from pending payments
- Documents count from documents table
- No access to system-wide statistics

### Profile Management:
- Students can update their own profile via `/api/profile`
- Includes both user and student-specific fields
- Password updates allowed

## Authorization Implementation

Authorization is implemented using:
- JWT token verification in `getUserFromRequest()`
- Role checking with `isStudent()` helper
- Query filtering based on user role
- Student record ID lookup from user_id
- 403 Forbidden responses for unauthorized access

## Notes

- Students have the most restricted access level
- All data is automatically filtered to show only student's own information
- Students cannot perform any administrative actions
- Profile access is via `/api/profile` endpoint, not `/api/students`
- Documents API requires a `documents` table in the database schema

