import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, createSession } from '@/lib/auth/auth';
import { setSessionTokenInResponse } from '@/lib/auth/session';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    console.log('�� Login attempt:', { email, hasPassword: !!password });

    // Authenticate user
    const user = await authenticateUser({ email, password });
    
    console.log('🔐 Authentication result:', { 
      success: !!user, 
      userId: user?.id,
      email: user?.email 
    });
    
    if (!user) {
      console.log('❌ Authentication failed');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = await createSession(user.id);
    
    console.log('🔐 Session created:', { 
      hasToken: !!sessionToken, 
      tokenLength: sessionToken?.length 
    });
    
    // Set session cookie
    const response = NextResponse.json(
      { 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      },
      { status: 200 }
    );

    const finalResponse = setSessionTokenInResponse(response, sessionToken);
    
    console.log('🔐 Login successful, response sent');
    return finalResponse;
  } catch (error) {
    console.error('❌ Login error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 