'use client';

import { useSession } from 'next-auth/react';

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {session?.user?.name || session?.user?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Management Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Manage users, assign roles, and control access permissions.
          </p>
          <a
            href="/admin/users"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Manage Users →
          </a>
        </div>

        {/* Academy Content Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Academy Content</h2>
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Review and approve knowledge contributions from users.
          </p>
          <a
            href="/admin/academy"
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            Review Content →
          </a>
        </div>

        {/* API Keys Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Manage API keys for external services and monitor usage.
          </p>
          <a
            href="/admin/apikeys"
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            Manage Keys →
          </a>
        </div>

        {/* Roles Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Roles & Permissions</h2>
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Configure roles and their associated permissions.
          </p>
          <a
            href="/admin/roles"
            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            View Roles →
          </a>
        </div>

        {/* Audit Logs Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Audit Logs</h2>
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Track all critical actions and system changes.
          </p>
          <a
            href="/admin/audit"
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            View Logs →
          </a>
        </div>

        {/* n8n Integration Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">n8n Workflows</h2>
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Manage workflow automation and integrations.
          </p>
          <a
            href="/admin/n8n"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Open n8n →
          </a>
        </div>
      </div>

      {/* System Info */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Your Role</p>
            <p className="text-lg font-semibold text-gray-900">
              {session?.user?.isSuperadmin ? 'Superadmin' : 'Admin'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Permissions</p>
            <p className="text-lg font-semibold text-gray-900">
              {session?.user?.permissions.length || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-semibold text-gray-900 truncate">
              {session?.user?.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">RBAC Version</p>
            <p className="text-lg font-semibold text-gray-900">1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
