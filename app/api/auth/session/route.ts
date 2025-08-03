import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/auth';
import { getSessionTokenFromRequest } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = getSessionTokenFromRequest(request);
    
    console.log('🔍 Session validation request:', { 
      hasToken: !!sessionToken, 
      tokenLength: sessionToken?.length,
      userAgent: request.headers.get('user-agent')
    });
    
    if (!sessionToken) {
      console.log('❌ No session token found');
      return NextResponse.json(
        { authenticated: false, user: null, reason: 'no_token' },
        { status: 401 }
      );
    }

    // Validate session
    const sessionData = await validateSession(sessionToken);
    
    if (!sessionData) {
      console.log('❌ Session validation failed');
      return NextResponse.json(
        { authenticated: false, user: null, reason: 'invalid_session' },
        { status: 401 }
      );
    }

    console.log('✅ Session validation successful');
    return NextResponse.json({
      authenticated: true,
      user: {
        id: sessionData.userId,
        email: sessionData.email,
        role: sessionData.role,
      },
    });
  } catch (error) {
    console.error('❌ Session validation error:', error);
    
    return NextResponse.json(
      { authenticated: false, user: null, reason: 'error', error: String(error) },
      { status: 500 }
    );
  }
} 