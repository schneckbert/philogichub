'use client';

import { useState, useEffect } from 'react';

interface Role {
  id: string;
  name: string;
  description: string | null;
  _count: {
    users: number;
    permissions: number;
  };
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    try {
      const res = await fetch('/api/roles');
      if (!res.ok) throw new Error('Failed to load roles');
      const data = await res.json();
      setRoles(data.roles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading roles');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading roles...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-12">Error: {error}</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
        <p className="mt-2 text-gray-600">
          System roles with their associated permissions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`bg-white rounded-lg shadow p-6 border-t-4 ${
              role.name === 'superadmin'
                ? 'border-purple-600'
                : role.name === 'admin'
                ? 'border-blue-600'
                : role.name === 'domain_owner'
                ? 'border-green-600'
                : 'border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {role.name}
                </h3>
                {role.description && (
                  <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                )}
              </div>
              {role.name === 'superadmin' && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                  SYSTEM
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Users</span>
                <span className="text-lg font-semibold text-gray-900">
                  {role._count.users}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Permissions</span>
                <span className="text-lg font-semibold text-gray-900">
                  {role._count.permissions}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Role Hierarchy
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center">
            <span className="font-semibold mr-2">1. Superadmin:</span>
            <span>Full system access, cannot be restricted</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold mr-2">2. Admin:</span>
            <span>Manage users, content, and system settings</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold mr-2">3. Domain Owner:</span>
            <span>Manage domain-specific content and users</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold mr-2">4. Standard User:</span>
            <span>Create and edit own content</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold mr-2">5. Read Only:</span>
            <span>View-only access to content</span>
          </div>
        </div>
      </div>
    </div>
  );
}
