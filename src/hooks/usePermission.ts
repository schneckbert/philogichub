'use client';

import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/rbac';

export function usePermission(permission: string | string[]) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return {
      hasPermission: false,
      isLoading: true,
      session: null,
    };
  }

  if (!session?.user) {
    return {
      hasPermission: false,
      isLoading: false,
      session: null,
    };
  }

  const permissions = session.user.permissions || [];
  const required = Array.isArray(permission) ? permission : [permission];

  const hasAccess = required.some((perm) =>
    hasPermission(permissions, perm)
  );

  return {
    hasPermission: hasAccess,
    isLoading: false,
    session,
  };
}

export function useRole(role: string | string[]) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return {
      hasRole: false,
      isLoading: true,
      session: null,
    };
  }

  if (!session?.user) {
    return {
      hasRole: false,
      isLoading: false,
      session: null,
    };
  }

  const roles = session.user.roles || [];
  const required = Array.isArray(role) ? role : [role];

  const hasAccess = required.some((r) => roles.includes(r));

  return {
    hasRole: hasAccess,
    isLoading: false,
    session,
  };
}
