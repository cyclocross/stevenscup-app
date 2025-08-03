import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { adminUsers, adminSessions } from '@/lib/db/schema';
import { eq, and, gt, lt } from 'drizzle-orm';
import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SESSION_EXPIRY_HOURS = 24; // 24 hours

export interface AdminUser {
  id: number;
  email: string;
  role: string;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SessionData {
  userId: number;
  email: string;
  role: string;
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Session utilities
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export function generateJWT(payload: SessionData): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${SESSION_EXPIRY_HOURS}h` });
}

export function verifyJWT(token: string): SessionData | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionData;
    return decoded;
  } catch {
    return null;
  }
}

// User authentication
export async function authenticateUser(credentials: LoginCredentials): Promise<AdminUser | null> {
  try {
    const user = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, credentials.email),
    });

    if (!user || !user.isActive) {
      return null;
    }

    const isValidPassword = await verifyPassword(credentials.password, user.passwordHash);
    if (!isValidPassword) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role || 'admin',
      isActive: user.isActive || true,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Session management
export async function createSession(userId: number): Promise<string> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS);

  await db.insert(adminSessions).values({
    userId,
    sessionToken,
    expiresAt: expiresAt,
  });

  return sessionToken;
}

export async function validateSession(sessionToken: string): Promise<SessionData | null> {
  try {
    const session = await db.query.adminSessions.findFirst({
      where: and(
        eq(adminSessions.sessionToken, sessionToken),
        gt(adminSessions.expiresAt, new Date())
      ),
    });
    console.log('session', session);
    if (!session) {
      return null;
    }

    const user = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, session.userId),
    });

    if (!user || !user.isActive) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export async function deleteSession(sessionToken: string): Promise<void> {
  try {
    await db.delete(adminSessions).where(eq(adminSessions.sessionToken, sessionToken));
  } catch (error) {
    console.error('Session deletion error:', error);
  }
}

export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
  } catch (error) {
    console.error('Session cleanup error:', error);
  }
}

// Create initial admin user (for first-time setup)
export async function createInitialAdminUser(email: string, password: string): Promise<AdminUser | null> {
  try {
    const existingUser = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, email),
    });

    if (existingUser) {
      return null; // User already exists
    }

    const passwordHash = await hashPassword(password);
    
    const [newUser] = await db.insert(adminUsers).values({
      email,
      passwordHash,
      role: 'admin',
      isActive: true,
    }).returning();

    return {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role || 'admin',
      isActive: newUser.isActive || true,
    };
  } catch (error) {
    console.error('Create admin user error:', error);
    return null;
  }
} 

export async function createUser(credentials: LoginCredentials): Promise<AdminUser | null> {
  try {
    const existingUser = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, credentials.email),
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await hashPassword(credentials.password);

    const [newUser] = await db.insert(adminUsers).values({
      email: credentials.email,
      passwordHash,
      role: 'admin',
      isActive: true,
    }).returning();

    if (!newUser) {
      return null;
    }

    return {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role || 'admin',
      isActive: newUser.isActive || true,
    };
  } catch (error) {
    console.error('Create user error:', error);
    return null;
  }
} 