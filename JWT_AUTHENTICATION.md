# JWT Authentication Implementation

## Overview

The application now uses JWT (JSON Web Tokens) for authentication instead of request headers. This provides better security and is the industry standard.

## How It Works

### 1. Login Flow
1. User submits login credentials to `/api/auth/login`
2. Server validates credentials and generates a JWT token
3. Token is returned in the login response
4. Frontend stores token in `localStorage` as `authToken`
5. Token is automatically included in all subsequent API requests

### 2. API Request Flow
1. Frontend makes API request with `Authorization: Bearer <token>` header
2. Server extracts token from Authorization header
3. Server verifies token signature and expiration
4. Server extracts user info (userId, email, role) from token payload
5. Server processes request with authenticated user context

### 3. Logout Flow
1. User clicks logout
2. Frontend calls `clearAuth()` to remove token from localStorage
3. Optionally calls `/api/auth/logout` endpoint
4. Redirects to login page

## Token Structure

The JWT token contains:
```json
{
  "userId": "user-id",
  "email": "user@example.com",
  "role": "SUPER_ADMIN" | "ADMIN" | "COUNSELOR" | "STUDENT",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Configuration

### Environment Variables
- `JWT_SECRET`: Secret key for signing tokens (default: 'your-secret-key-change-in-production')
- `JWT_EXPIRES_IN`: Token expiration time (default: '7d')

**⚠️ IMPORTANT**: In production, set `JWT_SECRET` to a strong, random string in your Vercel environment variables.

## API Client Helper

Use the `apiRequest` helper from `lib/api-client.ts` for automatic token handling:

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'

// GET request
const response = await apiGet('/api/leads')
const data = await response.json()

// POST request
const response = await apiPost('/api/leads', { name: 'John', ... })
const data = await response.json()

// PUT request
const response = await apiPut('/api/leads/123', { status: 'Converted' })

// DELETE request
const response = await apiDelete('/api/leads/123')
```

## Manual Token Usage

If you need to make requests manually:

```typescript
const token = localStorage.getItem('authToken')
const response = await fetch('/api/leads', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## Backend Authorization

All protected API routes use `getUserFromRequest()` which:
1. Extracts token from `Authorization` header
2. Verifies token signature
3. Checks token expiration
4. Returns user info or null if invalid

Example:
```typescript
import { getUserFromRequest, isSuperAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  if (!isSuperAdmin(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // Process request...
}
```

## Security Features

1. **Token Expiration**: Tokens expire after 7 days (configurable)
2. **Automatic Logout**: 401 responses automatically clear tokens and redirect to login
3. **Role-Based Access**: Token contains user role for authorization checks
4. **Secure Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)

## Production Recommendations

1. **Set Strong JWT_SECRET**: Use a long, random string in Vercel environment variables
2. **Use HTTPS**: Always use HTTPS in production to protect tokens in transit
3. **Consider Refresh Tokens**: Implement refresh tokens for better security
4. **Token Rotation**: Consider implementing token rotation for sensitive operations
5. **Rate Limiting**: Add rate limiting to login endpoint to prevent brute force

## Files Modified

- `lib/jwt.ts` - JWT token generation and verification
- `lib/auth.ts` - Updated to use JWT verification
- `lib/api-client.ts` - Helper functions for authenticated requests
- `lib/data/dummy-data.ts` - Added token storage helpers
- `app/api/auth/login/route.ts` - Returns JWT token on login
- `components/login-form.tsx` - Stores token after login
- `components/layout/navbar.tsx` - Updated logout to clear token

