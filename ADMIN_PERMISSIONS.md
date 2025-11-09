# Admin Permissions & Backend APIs

## Admin Role Access

Based on the sidebar menu configuration, **Admin** has access to the following features:

### ✅ Admin Has Access To:

1. **Dashboard** - View analytics and statistics
2. **Leads** - Full CRUD operations on leads
3. **Auto Assignment** - Manage auto-assignment rules
4. **Students** - Full CRUD operations on students
5. **Payments** - View and manage payments
6. **Tasks** - Full CRUD operations on tasks
7. **Notice Board** - Full CRUD operations on notices
8. **Internal Chat** - Send and receive messages
9. **Reports** - View various reports
10. **Activity Logs** - View activity logs
11. **Settings** - Update own profile (NOT system settings)

### ❌ Admin Does NOT Have Access To:

1. **User Management** - Cannot create/edit/delete users (Super Admin only)
2. **System Settings** - Cannot modify system settings or API keys (Super Admin only)

## Backend API Authorization

All backend APIs have been updated with role-based authorization:

### Protected Routes (Super Admin Only):
- `/api/users/*` - User management
- `/api/settings` - System settings (GET & PUT)

### Admin-Accessible Routes:
All other routes are accessible to Admin:
- `/api/dashboard` - Dashboard analytics
- `/api/leads/*` - Lead management
- `/api/auto-assignment/*` - Auto assignment rules
- `/api/students/*` - Student management
- `/api/payments/*` - Payment management
- `/api/tasks/*` - Task management
- `/api/notices/*` - Notice management
- `/api/chat/*` - Internal chat
- `/api/reports` - Reports
- `/api/activity-logs/*` - Activity logs
- `/api/profile` - Own profile management

## New API Endpoint

### Profile Management (`/api/profile`)
- **GET** `/api/profile` - Get current user's profile
- **PUT** `/api/profile` - Update current user's profile (including password)

This endpoint allows Admin (and all users) to update their own profile without needing system settings access.

## Authorization Implementation

Authorization is implemented using:
- `lib/auth.ts` - Helper functions for role checking
- Request headers: `x-user-id` and `x-user-role` (set by frontend after login)
- In production, replace with JWT token verification

## Notes

- Admin can perform all operations that Super Admin can, except user management and system settings
- All APIs check user role before allowing access
- Profile updates are available to all authenticated users via `/api/profile`
- System settings remain Super Admin only

