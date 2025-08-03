import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth/auth';
import { getSessionTokenFromRequest, clearSessionTokenInResponse } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const sessionToken = getSessionTokenFromRequest(request);
    
    if (sessionToken) {
      // Delete session from database
      await deleteSession(sessionToken);
    }

    // Clear session cookie
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    return clearSessionTokenInResponse(response);
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, clear the cookie
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    return clearSessionTokenInResponse(response);
  }
} 