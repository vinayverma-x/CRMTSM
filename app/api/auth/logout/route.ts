import { NextRequest, NextResponse } from 'next/server'

// POST logout (client-side token removal)
export async function POST(request: NextRequest) {
  // Logout is primarily handled client-side by removing the token
  // This endpoint can be used for server-side session invalidation if needed
  return NextResponse.json({ message: 'Logged out successfully' })
}

