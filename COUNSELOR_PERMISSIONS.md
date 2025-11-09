# Counselor Permissions & Backend APIs

## Counselor Role Access

Based on the sidebar menu configuration, **Counselor** has access to the following features:

### ✅ Counselor Has Access To:

1. **Dashboard** - View analytics for their assigned leads only
2. **Leads** - View and manage only leads assigned to them
3. **Students** - View all students (for counseling purposes)
4. **Tasks** - View and manage tasks assigned to them or created by them
5. **Notice Board** - View and create notices
6. **Internal Chat** - Send and receive messages
7. **Settings** - Update own profile (NOT system settings)

### ❌ Counselor Does NOT Have Access To:

1. **Auto Assignment** - Cannot manage auto-assignment rules (Admin/Super Admin only)
2. **Payments** - Cannot view payments (Admin/Super Admin/Student only)
3. **Reports** - Cannot view reports (Admin/Super Admin only)
4. **Activity Logs** - Cannot view activity logs (Admin/Super Admin only)
5. **User Management** - Cannot manage users (Super Admin only)
6. **System Settings** - Cannot modify system settings (Super Admin only)

## Backend API Authorization

### Counselor-Specific Filtering:

1. **Leads API** (`/api/leads/*`):
   - GET: Only returns leads assigned to the counselor
   - POST: Counselor can only assign leads to themselves
   - GET by ID: Only allows access to leads assigned to the counselor
   - PUT: Only allows updating leads assigned to the counselor
   - DELETE: Not allowed (Admin/Super Admin only)

2. **Dashboard API** (`/api/dashboard`):
   - All metrics filtered to show only counselor's assigned leads
   - Does not show total students or active counselors
   - Does not show counselor performance metrics

3. **Tasks API** (`/api/tasks/*`):
   - GET: Only returns tasks assigned to counselor or created by counselor
   - POST: Counselor can only assign tasks to themselves
   - Filtering by `assignedToId` or `createdById` is not allowed for counselors

4. **Students API** (`/api/students/*`):
   - Counselors can view all students (for counseling purposes)
   - Full read access, but may have restrictions on create/update/delete

### Protected Routes (Counselor Cannot Access):

- `/api/auto-assignment/*` - Returns 403 Forbidden
- `/api/reports` - Returns 403 Forbidden
- `/api/activity-logs/*` - Returns 403 Forbidden
- `/api/payments/*` - Returns 403 Forbidden (unless student)
- `/api/users/*` - Returns 403 Forbidden
- `/api/settings` - Returns 403 Forbidden (system settings only)

### Counselor-Accessible Routes:

- `/api/dashboard` - Filtered to counselor's leads
- `/api/leads/*` - Filtered to counselor's leads
- `/api/students/*` - Full read access
- `/api/tasks/*` - Filtered to counselor's tasks
- `/api/notices/*` - Full access
- `/api/chat/*` - Full access
- `/api/profile` - Own profile management

## Key Implementation Details

### Lead Assignment Restrictions:
- When a counselor creates a lead, it's automatically assigned to them
- Counselors cannot reassign leads to other counselors
- Counselors can only view/edit leads assigned to them

### Task Assignment Restrictions:
- When a counselor creates a task, it's automatically assigned to them
- Counselors cannot assign tasks to other users
- Counselors can only view tasks assigned to them or created by them

### Dashboard Analytics:
- All lead metrics are filtered by `assigned_counselor_id = counselor.id`
- Conversion rates calculated only for counselor's leads
- No access to system-wide statistics

## Authorization Implementation

Authorization is implemented using:
- JWT token verification in `getUserFromRequest()`
- Role checking with `isCounselor()` helper
- Query filtering based on user role
- 403 Forbidden responses for unauthorized access

## Notes

- Counselors have limited scope compared to Admin/Super Admin
- All data is automatically filtered to show only relevant information
- Counselors cannot perform administrative actions
- Student access is allowed for counseling purposes

