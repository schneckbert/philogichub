import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { generateN8nJWT } from '@/lib/n8n';

/**
 * Generate n8n authentication token
 * This endpoint creates a JWT that can be used for n8n authentication
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const token = generateN8nJWT({
      userId: session.user.id,
      email: session.user.email!,
      name: session.user.name,
      roles: session.user.roles,
      permissions: session.user.permissions,
    });

    return NextResponse.json({
      token,
      expiresIn: 28800, // 8 hours in seconds
      message: 'n8n authentication token generated successfully',
    });
  } catch (error) {
    console.error('Failed to generate n8n token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
