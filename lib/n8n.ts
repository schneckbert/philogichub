import jwt from 'jsonwebtoken';

/**
 * Map PhilogicHub roles to n8n roles
 */
export function mapRoleToN8nRole(role: string): string {
  switch (role) {
    case 'superadmin':
      return 'owner';
    case 'admin':
      return 'admin';
    case 'domain_owner':
      return 'member';
    case 'standard_user':
      return 'member';
    case 'read_only':
      return 'viewer';
    default:
      return 'viewer';
  }
}

/**
 * Generate JWT for n8n authentication
 */
export function generateN8nJWT({
  userId,
  email,
  name,
  roles,
  permissions,
}: {
  userId: string;
  email: string;
  name?: string | null;
  roles: string[];
  permissions: string[];
}): string {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not configured');
  }

  // Determine highest role for n8n
  const n8nRole = roles.includes('superadmin')
    ? 'owner'
    : roles.includes('admin')
    ? 'admin'
    : roles.includes('domain_owner')
    ? 'member'
    : 'viewer';

  const payload = {
    sub: userId,
    email,
    name: name || email,
    role: n8nRole,
    philogic_roles: roles,
    philogic_permissions: permissions,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 * 8, // 8 hours
  };

  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
  });
}

/**
 * Verify and decode n8n JWT
 */
export function verifyN8nJWT(token: string): any {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not configured');
  }

  try {
    return jwt.verify(token, secret, {
      algorithms: ['HS256'],
    });
  } catch (error) {
    throw new Error('Invalid or expired JWT');
  }
}

/**
 * Check if user has permission for n8n workflow action
 */
export function hasN8nPermission(
  permissions: string[],
  action: 'read' | 'execute' | 'create' | 'manage',
  scope: 'self' | 'team' | 'all' = 'self'
): boolean {
  // Superadmin wildcard
  if (permissions.includes('*')) {
    return true;
  }

  // Check specific permission
  const permissionKey = `n8n:workflow:${action}:${scope}`;
  if (permissions.includes(permissionKey)) {
    return true;
  }

  // Check wildcards
  if (permissions.includes(`n8n:workflow:${action}:*`)) {
    return true;
  }

  if (permissions.includes(`n8n:workflow:*:${scope}`)) {
    return true;
  }

  if (permissions.includes('n8n:workflow:*:*')) {
    return true;
  }

  return false;
}
