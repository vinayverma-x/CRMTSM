# Debugging Display Issues - Students and Users

## Issue
Students and users are not displaying in the frontend even though data exists in the database.

## Fixes Applied

### 1. API Query Improvements
- Added type casting fallback for ID mismatches
- Added comprehensive error logging
- Added debug queries to check database contents
- Improved null/undefined handling in data mapping

### 2. Frontend Error Handling
- Added array validation before setting state
- Improved error messages
- Added console logging for debugging
- Fixed filter function to handle null values

## How to Debug

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for logs starting with:
   - `[GET /api/students]` - Student API logs
   - `[GET /api/users]` - User API logs
   - `Fetched students:` - Frontend student data
   - `Fetched users:` - Frontend user data

### Check Server Logs
1. Check your Next.js server console/terminal
2. Look for:
   - Database query results
   - Authorization errors
   - Type mismatch errors
   - Debug information about IDs

### Common Issues and Solutions

#### Issue 1: Authorization Error (403)
**Symptom:** Console shows "Unauthorized" error
**Solution:** 
- Make sure you're logged in as SUPER_ADMIN or ADMIN
- Check that JWT token is valid
- Verify token is being sent in Authorization header

#### Issue 2: ID Type Mismatch
**Symptom:** Query returns 0 results but data exists in database
**Solution:**
- Check server logs for debug info about ID types
- The API now tries both simple JOIN and type-cast JOIN
- Verify that `users.id` and `students.user_id` have compatible types

#### Issue 3: Empty Array Response
**Symptom:** API returns `[]` but data exists
**Solution:**
- Check server logs for debug queries
- Verify JOIN condition is correct
- Check if `users.role = 'STUDENT'` matches your data
- Verify `users.role != 'STUDENT'` for users API

#### Issue 4: Frontend Not Rendering
**Symptom:** Data received but not displayed
**Solution:**
- Check browser console for data format errors
- Verify `students` and `users` state arrays are populated
- Check if filter function is filtering out all data
- Verify component is receiving data correctly

## Testing Steps

1. **Login as SUPER_ADMIN**
   - Email: `superadmin@tsm.university`
   - Password: `password123`

2. **Check Students Page**
   - Navigate to `/students`
   - Open browser console
   - Check for API logs
   - Verify data is received

3. **Check Users Page**
   - Navigate to `/users`
   - Open browser console
   - Check for API logs
   - Verify data is received

4. **Check Server Logs**
   - Look for debug information
   - Check for error messages
   - Verify database queries

## Database Verification

Run these queries directly in your database to verify data:

```sql
-- Check students
SELECT u.id, u.name, u.email, u.role, s.id as student_id, s.roll_no
FROM users u
LEFT JOIN students s ON u.id = s.user_id
WHERE u.role = 'STUDENT';

-- Check non-student users
SELECT id, name, email, role
FROM users
WHERE role != 'STUDENT';

-- Check ID types
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('users', 'students') 
  AND column_name IN ('id', 'user_id');
```

## Next Steps

If issues persist:
1. Check server logs for specific error messages
2. Verify database schema matches expected structure
3. Test API endpoints directly (using curl or Postman)
4. Check network tab in browser DevTools for API responses
5. Verify JWT token is valid and contains correct role

