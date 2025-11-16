/**
 * RBAC Permission Checker
 * 
 * Checks if a user has a specific permission.
 * Supports wildcards and scope matching.
 */
export function hasPermission(
  userPermissions: string[],
  required: string
): boolean {
  // Superadmin wildcard
  if (userPermissions.includes('*')) {
    return true;
  }

  // Exact match
  if (userPermissions.includes(required)) {
    return true;
  }

  // Wildcard matching
  const [resource, action, scope] = required.split(':');

  return userPermissions.some((perm) => {
    if (perm === '*') return true;

    const [permResource, permAction, permScope] = perm.split(':');

    // Check resource match
    if (permResource !== resource && permResource !== '*') return false;

    // Check action match
    if (permAction !== action && permAction !== '*') return false;

    // Check scope match
    if (permScope !== scope && permScope !== '*') return false;

    return true;
  });
}

/**
 * Check if user has ANY of the provided permissions
 */
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.some((perm) =>
    hasPermission(userPermissions, perm)
  );
}

/**
 * Check if user has ALL of the provided permissions
 */
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.every((perm) =>
    hasPermission(userPermissions, perm)
  );
}

/**
 * Check if user has a specific role
 */
export function hasRole(userRoles: string[], requiredRole: string): boolean {
  return userRoles.includes(requiredRole);
}

/**
 * Check if user has ANY of the provided roles
 */
export function hasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.some((role) => userRoles.includes(role));
}

/**
 * Check if user is superadmin
 */
export function isSuperadmin(userRoles: string[]): boolean {
  return userRoles.includes('superadmin');
}
