'use client';

import { useState, useEffect } from 'react';
import {
  UserCircleIcon,
  CogIcon,
  CircleStackIcon,
  BellIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  UsersIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface SystemInfo {
  database: {
    status: string;
    schema: string;
    tables: number;
  };
  app: {
    version: string;
    environment: string;
    buildDate: string;
  };
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'inactive';
  created_at: Date;
  last_login: Date | null;
}

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'database' | 'notifications' | 'users'>('profile');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    // Load system info
    setSystemInfo({
      database: {
        status: 'Connected',
        schema: 'baucrm + public',
        tables: 15,
      },
      app: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        buildDate: new Date().toLocaleDateString('de-DE'),
      },
    });

    // Load users
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        await loadUsers();
        setShowUserModal(false);
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async (userId: string, userData: Partial<User>) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        await loadUsers();
        setEditingUser(null);
        setShowUserModal(false);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Möchten Sie diesen Benutzer wirklich löschen?')) return;
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await loadUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Einstellungen</h1>
        <p className="mt-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Verwalten Sie Ihre Profil- und Systemeinstellungen</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: activeTab === 'profile' ? 'rgb(96 165 250 / 0.2)' : 'transparent',
                color: activeTab === 'profile' ? 'var(--clr-info-a10)' : 'rgb(255 255 255 / 0.75)'
              }}
            >
              <UserCircleIcon className="h-5 w-5" />
              Profil
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: activeTab === 'system' ? 'rgb(96 165 250 / 0.2)' : 'transparent',
                color: activeTab === 'system' ? 'var(--clr-info-a10)' : 'rgb(255 255 255 / 0.75)'
              }}
            >
              <CogIcon className="h-5 w-5" />
              System
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: activeTab === 'database' ? 'rgb(96 165 250 / 0.2)' : 'transparent',
                color: activeTab === 'database' ? 'var(--clr-info-a10)' : 'rgb(255 255 255 / 0.75)'
              }}
            >
              <CircleStackIcon className="h-5 w-5" />
              Datenbank
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: activeTab === 'notifications' ? 'rgb(96 165 250 / 0.2)' : 'transparent',
                color: activeTab === 'notifications' ? 'var(--clr-info-a10)' : 'rgb(255 255 255 / 0.75)'
              }}
            >
              <BellIcon className="h-5 w-5" />
              Benachrichtigungen
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: activeTab === 'users' ? 'rgb(96 165 250 / 0.2)' : 'transparent',
                color: activeTab === 'users' ? 'var(--clr-info-a10)' : 'rgb(255 255 255 / 0.75)'
              }}
            >
              <UsersIcon className="h-5 w-5" />
              Benutzerverwaltung
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--clr-surface-a20)' }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Profil-Informationen</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                      Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Admin User"
                      className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{
                        backgroundColor: 'var(--clr-surface-a10)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--clr-surface-a30)',
                        color: 'rgb(255 255 255 / 0.9)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                      E-Mail
                    </label>
                    <input
                      type="email"
                      defaultValue="admin@philogic.de"
                      className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{
                        backgroundColor: 'var(--clr-surface-a10)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--clr-surface-a30)',
                        color: 'rgb(255 255 255 / 0.9)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                      Rolle
                    </label>
                    <input
                      type="text"
                      defaultValue="Administrator"
                      disabled
                      className="w-full px-4 py-2 rounded-lg"
                      style={{
                        backgroundColor: 'var(--clr-surface-a0)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--clr-surface-a30)',
                        color: 'rgb(255 255 255 / 0.5)'
                      }}
                    />
                  </div>
                  <div className="pt-4">
                    <button className="px-4 py-2 text-white rounded-lg transition-colors" style={{ backgroundColor: 'var(--clr-info-a10)' }}>
                      Änderungen speichern
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--clr-surface-a20)' }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Sicherheit</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                      Aktuelles Passwort
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{
                        backgroundColor: 'var(--clr-surface-a10)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--clr-surface-a30)',
                        color: 'rgb(255 255 255 / 0.9)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                      Neues Passwort
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{
                        backgroundColor: 'var(--clr-surface-a10)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--clr-surface-a30)',
                        color: 'rgb(255 255 255 / 0.9)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                      Passwort bestätigen
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{
                        backgroundColor: 'var(--clr-surface-a10)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--clr-surface-a30)',
                        color: 'rgb(255 255 255 / 0.9)'
                      }}
                    />
                  </div>
                  <div className="pt-4">
                    <button className="px-4 py-2 text-white rounded-lg transition-colors" style={{ backgroundColor: 'var(--clr-info-a10)' }}>
                      Passwort ändern
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && systemInfo && (
            <div className="space-y-6">
              <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--clr-surface-a20)' }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>System-Informationen</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Version</dt>
                    <dd className="mt-1 text-sm font-mono" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{systemInfo.app.version}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Umgebung</dt>
                    <dd className="mt-1">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: systemInfo.app.environment === 'production' 
                            ? 'rgb(34 197 94 / 0.2)' 
                            : 'rgb(251 191 36 / 0.2)',
                          color: systemInfo.app.environment === 'production'
                            ? 'var(--clr-success-a10)'
                            : 'var(--clr-warning-a10)'
                        }}
                      >
                        {systemInfo.app.environment}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Build-Datum</dt>
                    <dd className="mt-1 text-sm" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{systemInfo.app.buildDate}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Framework</dt>
                    <dd className="mt-1 text-sm" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Next.js 14.2.5</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--clr-surface-a20)' }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Anwendungs-Einstellungen</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Dark Mode</p>
                      <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Dunkles Design aktivieren</p>
                    </div>
                    <button
                      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{ backgroundColor: 'var(--clr-surface-a30)' }}
                    >
                      <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Auto-Refresh</p>
                      <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Daten automatisch aktualisieren</p>
                    </div>
                    <button
                      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{ backgroundColor: 'var(--clr-info-a10)' }}
                    >
                      <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && systemInfo && (
            <div className="space-y-6">
              <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--clr-surface-a20)' }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Datenbank-Status</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Verbindungsstatus</dt>
                    <dd className="mt-1">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: 'rgb(34 197 94 / 0.2)',
                          color: 'var(--clr-success-a10)'
                        }}
                      >
                        <span className="mr-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--clr-success-a10)' }}></span>
                        {systemInfo.database.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Schema</dt>
                    <dd className="mt-1 text-sm font-mono" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{systemInfo.database.schema}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Tabellen</dt>
                    <dd className="mt-1 text-sm" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{systemInfo.database.tables}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Provider</dt>
                    <dd className="mt-1 text-sm" style={{ color: 'rgb(255 255 255 / 0.9)' }}>PostgreSQL (Supabase)</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--clr-surface-a20)' }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Schema-Übersicht</h2>
                <div className="space-y-3">
                  <div 
                    className="rounded-lg p-4"
                    style={{
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--clr-surface-a30)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CircleStackIcon className="h-5 w-5" style={{ color: 'var(--clr-info-a10)' }} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>baucrm Schema</p>
                          <p className="text-xs" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Bau-CRM Entities</p>
                        </div>
                      </div>
                      <span className="text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>10 Tabellen</span>
                    </div>
                    <div className="mt-3 text-xs" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                      Company, Contact, Opportunity, Activity, CompanyLocation, CompanyTechProfile, Trade, CompanyTrade, WzCode
                    </div>
                  </div>
                  <div 
                    className="rounded-lg p-4"
                    style={{
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--clr-surface-a30)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CircleStackIcon className="h-5 w-5" style={{ color: 'var(--clr-primary-a20)' }} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>public Schema</p>
                          <p className="text-xs" style={{ color: 'rgb(255 255 255 / 0.6)' }}>System & Automation</p>
                        </div>
                      </div>
                      <span className="text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>2 Tabellen</span>
                    </div>
                    <div className="mt-3 text-xs" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                      Agent, AgentLog
                    </div>
                  </div>
                </div>
              </div>

              <div 
                className="rounded-lg p-4"
                style={{
                  backgroundColor: 'rgb(96 165 250 / 0.1)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--clr-info-a20)'
                }}
              >
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--clr-info-a10)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Datenbank-Backup</p>
                    <p className="text-sm mt-1" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                      Automatische Backups werden von Supabase verwaltet. Point-in-time Recovery ist aktiviert.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--clr-surface-a20)' }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Benachrichtigungs-Einstellungen</h2>
                <div className="space-y-4">
                  <div 
                    className="flex items-center justify-between py-3"
                    style={{
                      borderBottomWidth: '1px',
                      borderBottomStyle: 'solid',
                      borderBottomColor: 'var(--clr-surface-a30)'
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Neue Opportunities</p>
                      <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Bei neuen Opportunities benachrichtigen</p>
                    </div>
                    <button
                      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{ backgroundColor: 'var(--clr-info-a10)' }}
                    >
                      <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                    </button>
                  </div>
                  <div 
                    className="flex items-center justify-between py-3"
                    style={{
                      borderBottomWidth: '1px',
                      borderBottomStyle: 'solid',
                      borderBottomColor: 'var(--clr-surface-a30)'
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Agent-Fehler</p>
                      <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Bei Agent-Fehlern benachrichtigen</p>
                    </div>
                    <button
                      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{ backgroundColor: 'var(--clr-info-a10)' }}
                    >
                      <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                    </button>
                  </div>
                  <div 
                    className="flex items-center justify-between py-3"
                    style={{
                      borderBottomWidth: '1px',
                      borderBottomStyle: 'solid',
                      borderBottomColor: 'var(--clr-surface-a30)'
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Wöchentlicher Bericht</p>
                      <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Wöchentliche Zusammenfassung per E-Mail</p>
                    </div>
                    <button
                      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{ backgroundColor: 'var(--clr-surface-a30)' }}
                    >
                      <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>System-Updates</p>
                      <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Über System-Updates informieren</p>
                    </div>
                    <button
                      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{ backgroundColor: 'var(--clr-info-a10)' }}
                    >
                      <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--clr-surface-a20)' }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>E-Mail-Einstellungen</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                      Benachrichtigungs-E-Mail
                    </label>
                    <input
                      type="email"
                      defaultValue="admin@philogic.de"
                      className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{
                        backgroundColor: 'var(--clr-surface-a10)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--clr-surface-a30)',
                        color: 'rgb(255 255 255 / 0.9)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                      Benachrichtigungs-Frequenz
                    </label>
                    <select 
                      className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{
                        backgroundColor: 'var(--clr-surface-a10)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--clr-surface-a30)',
                        color: 'rgb(255 255 255 / 0.9)'
                      }}
                    >
                      <option>Sofort</option>
                      <option>Täglich (Zusammenfassung)</option>
                      <option>Wöchentlich (Zusammenfassung)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Header with Add Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Benutzerverwaltung</h2>
                  <p className="text-sm mt-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                    Benutzer anlegen, Berechtigungen ändern und Zugriffe verwalten
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setShowUserModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: 'var(--clr-info-a10)' }}
                >
                  <PlusIcon className="h-5 w-5" />
                  Neuer Benutzer
                </button>
              </div>

              {/* Users Table */}
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--clr-surface-a20)' }}>
                <table className="min-w-full divide-y" style={{ borderColor: 'var(--clr-surface-a30)' }}>
                  <thead style={{ backgroundColor: 'var(--clr-surface-a10)' }}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                        Benutzer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                        Rolle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                        Letzter Login
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--clr-surface-a30)' }}>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--clr-info-a10)' }}>
                                <span className="text-white font-medium">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                                {user.name}
                              </div>
                              <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: user.role === 'admin' 
                                ? 'rgb(168 85 247 / 0.2)' 
                                : user.role === 'user'
                                ? 'rgb(59 130 246 / 0.2)'
                                : 'rgb(107 114 128 / 0.2)',
                              color: user.role === 'admin'
                                ? 'var(--clr-primary-a20)'
                                : user.role === 'user'
                                ? 'var(--clr-info-a10)'
                                : 'rgb(255 255 255 / 0.6)'
                            }}
                          >
                            {user.role === 'admin' ? 'Administrator' : user.role === 'user' ? 'Benutzer' : 'Betrachter'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: user.status === 'active' ? 'rgb(34 197 94 / 0.2)' : 'rgb(239 68 68 / 0.2)',
                              color: user.status === 'active' ? 'var(--clr-success-a10)' : 'var(--clr-danger-a10)'
                            }}
                          >
                            {user.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                          {user.last_login ? new Date(user.last_login).toLocaleDateString('de-DE') : 'Nie'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowUserModal(true);
                            }}
                            className="inline-flex items-center p-2 rounded-lg transition-colors mr-2"
                            style={{ color: 'var(--clr-info-a10)' }}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="inline-flex items-center p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--clr-danger-a10)' }}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {users.length === 0 && (
                  <div className="text-center py-12">
                    <UsersIcon className="mx-auto h-12 w-12" style={{ color: 'rgb(255 255 255 / 0.3)' }} />
                    <p className="mt-2 text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                      Noch keine Benutzer vorhanden
                    </p>
                  </div>
                )}
              </div>

              {/* User Modal */}
              {showUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
                  <div className="rounded-lg p-6 max-w-md w-full" style={{ backgroundColor: 'var(--clr-surface-a20)' }}>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                      {editingUser ? 'Benutzer bearbeiten' : 'Neuer Benutzer'}
                    </h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const userData = {
                          name: formData.get('name') as string,
                          email: formData.get('email') as string,
                          role: formData.get('role') as 'admin' | 'user' | 'viewer',
                          status: formData.get('status') as 'active' | 'inactive',
                          password: formData.get('password') as string,
                        };
                        
                        if (editingUser) {
                          handleUpdateUser(editingUser.id, userData);
                        } else {
                          handleCreateUser(userData);
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          defaultValue={editingUser?.name}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            backgroundColor: 'var(--clr-surface-a10)',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: 'var(--clr-surface-a30)',
                            color: 'rgb(255 255 255 / 0.9)'
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                          E-Mail
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          defaultValue={editingUser?.email}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            backgroundColor: 'var(--clr-surface-a10)',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: 'var(--clr-surface-a30)',
                            color: 'rgb(255 255 255 / 0.9)'
                          }}
                        />
                      </div>
                      {!editingUser && (
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                            Passwort
                          </label>
                          <input
                            type="password"
                            name="password"
                            required
                            className="w-full px-4 py-2 rounded-lg"
                            style={{
                              backgroundColor: 'var(--clr-surface-a10)',
                              borderWidth: '1px',
                              borderStyle: 'solid',
                              borderColor: 'var(--clr-surface-a30)',
                              color: 'rgb(255 255 255 / 0.9)'
                            }}
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                          Rolle
                        </label>
                        <select
                          name="role"
                          required
                          defaultValue={editingUser?.role || 'user'}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            backgroundColor: 'var(--clr-surface-a10)',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: 'var(--clr-surface-a30)',
                            color: 'rgb(255 255 255 / 0.9)'
                          }}
                        >
                          <option value="admin">Administrator</option>
                          <option value="user">Benutzer</option>
                          <option value="viewer">Betrachter</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                          Status
                        </label>
                        <select
                          name="status"
                          required
                          defaultValue={editingUser?.status || 'active'}
                          className="w-full px-4 py-2 rounded-lg"
                          style={{
                            backgroundColor: 'var(--clr-surface-a10)',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: 'var(--clr-surface-a30)',
                            color: 'rgb(255 255 255 / 0.9)'
                          }}
                        >
                          <option value="active">Aktiv</option>
                          <option value="inactive">Inaktiv</option>
                        </select>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserModal(false);
                            setEditingUser(null);
                          }}
                          className="flex-1 px-4 py-2 rounded-lg transition-colors"
                          style={{
                            backgroundColor: 'var(--clr-surface-a30)',
                            color: 'rgb(255 255 255 / 0.75)'
                          }}
                        >
                          Abbrechen
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2 text-white rounded-lg transition-colors"
                          style={{ backgroundColor: 'var(--clr-info-a10)' }}
                        >
                          {editingUser ? 'Aktualisieren' : 'Erstellen'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
