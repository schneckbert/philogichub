'use client';

import { usePermission, useRole } from '@/hooks/usePermission';
import { ReactNode } from 'react';

interface ProtectedProps {
  permission?: string | string[];
  role?: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function Protected({ permission, role, children, fallback = null }: ProtectedProps) {
  const { hasPermission: hasPerm, isLoading: permLoading } = usePermission(
    permission || []
  );
  const { hasRole: hasRoleAccess, isLoading: roleLoading } = useRole(
    role || []
  );

  if (permLoading || roleLoading) {
    return <>{fallback}</>;
  }

  // If both permission and role are provided, check both
  if (permission && role) {
    if (!hasPerm || !hasRoleAccess) {
      return <>{fallback}</>;
    }
  }
  // If only permission is provided
  else if (permission && !hasPerm) {
    return <>{fallback}</>;
  }
  // If only role is provided
  else if (role && !hasRoleAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
