import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { hasPermission, isSuperadmin } from './rbac';
import { prisma } from './prisma';

/**
 * Middleware to require authentication
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  return { session };
}

/**
 * Middleware to require specific permission
 */
export async function requirePermission(required: string | string[]) {
  const { session, error } = await requireAuth();

  if (error) {
    return { error };
  }

  const requiredPerms = Array.isArray(required) ? required : [required];
  const userPermissions = session!.user.permissions;

  // Check if user has any of the required permissions
  const hasAccess = requiredPerms.some((perm) =>
    hasPermission(userPermissions, perm)
  );

  if (!hasAccess) {
    return {
      error: NextResponse.json(
        { 
          error: 'Forbidden',
          message: `Required permission: ${requiredPerms.join(' or ')}`
        },
        { status: 403 }
      ),
    };
  }

  return { session: session! };
}

/**
 * Middleware to require superadmin role
 */
export async function requireSuperadmin() {
  const { session, error } = await requireAuth();

  if (error) {
    return { error };
  }

  if (!isSuperadmin(session!.user.roles)) {
    return {
      error: NextResponse.json(
        { error: 'Forbidden', message: 'Superadmin access required' },
        { status: 403 }
      ),
    };
  }

  return { session: session! };
}

/**
 * Audit logging utility
 */
export async function auditLog({
  userId,
  action,
  resourceType,
  resourceId,
  metadata,
  ipAddress,
  userAgent,
}: {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resourceType,
        resourceId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Extract IP and User-Agent from request headers
 */
export function getRequestMetadata(headers: Headers) {
  return {
    ipAddress:
      headers.get('x-forwarded-for')?.split(',')[0] ||
      headers.get('x-real-ip') ||
      'unknown',
    userAgent: headers.get('user-agent') || 'unknown',
  };
}
