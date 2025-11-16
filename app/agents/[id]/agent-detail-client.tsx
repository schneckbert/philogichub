'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PlayIcon,
  StopIcon,
  CpuChipIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface AgentLog {
  id: string;
  level: string;
  message: string;
  data: any;
  createdAt: string;
}

interface Agent {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string | null;
  config: any;
  lastRun: string | null;
  lastError: string | null;
  runCount: number;
  createdAt: string;
  updatedAt: string;
  logs: AgentLog[];
  _count: {
    logs: number;
  };
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  idle: { bg: 'rgb(255 255 255 / 0.1)', text: 'rgb(255 255 255 / 0.75)' },
  running: { bg: 'rgb(34 197 94 / 0.2)', text: 'var(--clr-success-a10)' },
  stopped: { bg: 'rgb(239 68 68 / 0.2)', text: 'var(--clr-danger-a10)' },
  error: { bg: 'rgb(239 68 68 / 0.2)', text: 'var(--clr-danger-a10)' },
};

const STATUS_LABELS: Record<string, string> = {
  idle: 'Bereit',
  running: 'Läuft',
  stopped: 'Gestoppt',
  error: 'Fehler',
};

// Note: LOG_LEVEL_COLORS is no longer used - replaced by getLogLevelStyle() function

const LOG_LEVEL_ICONS: Record<string, any> = {
  info: InformationCircleIcon,
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: ExclamationCircleIcon,
};

export default function AgentDetailClient({ agent: initialAgent }: { agent: Agent }) {
  const [agent, setAgent] = useState(initialAgent);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'config'>('overview');

  async function startAgent() {
    try {
      const response = await fetch(`/api/agents/${agent.id}/start`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to start agent');
      const updatedAgent = await response.json();
      setAgent({ ...agent, status: updatedAgent.status, lastRun: updatedAgent.lastRun });
    } catch (error) {
      console.error('Error starting agent:', error);
      alert('Fehler beim Starten des Agenten');
    }
  }

  async function stopAgent() {
    try {
      const response = await fetch(`/api/agents/${agent.id}/stop`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to stop agent');
      const updatedAgent = await response.json();
      setAgent({ ...agent, status: updatedAgent.status });
    } catch (error) {
      console.error('Error stopping agent:', error);
      alert('Fehler beim Stoppen des Agenten');
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ backgroundColor: 'var(--clr-surface-a10)', padding: '1.5rem', borderRadius: '0.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
        <div className="flex items-center gap-4">
          <Link
            href="/agents"
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'rgb(255 255 255 / 0.75)' }}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{agent.name}</h1>
            {agent.description && (
              <p style={{ color: 'rgb(255 255 255 / 0.6)', marginTop: '0.25rem' }}>{agent.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(() => {
            const statusStyle = STATUS_STYLES[agent.status];
            return (
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
              >
                {STATUS_LABELS[agent.status] || agent.status}
              </span>
            );
          })()}
          {agent.status === 'running' ? (
            <button
              onClick={stopAgent}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                backgroundColor: 'var(--clr-danger-a10)', 
                color: 'rgb(255 255 255 / 0.9)',
                borderWidth: '0'
              }}
            >
              <StopIcon className="h-4 w-4 mr-2" />
              Agent stoppen
            </button>
          ) : (
            <button
              onClick={startAgent}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                backgroundColor: 'var(--clr-success-a10)', 
                color: 'rgb(255 255 255 / 0.9)',
                borderWidth: '0'
              }}
            >
              <PlayIcon className="h-4 w-4 mr-2" />
              Agent starten
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottomWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className="py-4 px-1 font-medium text-sm"
            style={{
              borderBottomWidth: '2px',
              borderColor: activeTab === 'overview' ? 'var(--clr-info-a10)' : 'transparent',
              color: activeTab === 'overview' ? 'var(--clr-info-a10)' : 'rgb(255 255 255 / 0.6)'
            }}
          >
            Übersicht
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className="py-4 px-1 font-medium text-sm"
            style={{
              borderBottomWidth: '2px',
              borderColor: activeTab === 'logs' ? 'var(--clr-info-a10)' : 'transparent',
              color: activeTab === 'logs' ? 'var(--clr-info-a10)' : 'rgb(255 255 255 / 0.6)'
            }}
          >
            Logs ({agent._count.logs})
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className="py-4 px-1 font-medium text-sm"
            style={{
              borderBottomWidth: '2px',
              borderColor: activeTab === 'config' ? 'var(--clr-info-a10)' : 'transparent',
              color: activeTab === 'config' ? 'var(--clr-info-a10)' : 'rgb(255 255 255 / 0.6)'
            }}
          >
            Konfiguration
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderRadius: '0.5rem', padding: '1.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Agent-Details</h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Typ</dt>
                  <dd className="mt-1 text-sm" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{agent.type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Status</dt>
                  <dd className="mt-1">
                    {(() => {
                      const statusStyle = STATUS_STYLES[agent.status];
                      return (
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                        >
                          {STATUS_LABELS[agent.status] || agent.status}
                        </span>
                      );
                    })()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Erstellt am</dt>
                  <dd className="mt-1 text-sm" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                    {new Date(agent.createdAt).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Zuletzt aktualisiert</dt>
                  <dd className="mt-1 text-sm" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                    {new Date(agent.updatedAt).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Letzter Run</dt>
                  <dd className="mt-1 text-sm" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                    {agent.lastRun ? (
                      <>
                        {new Date(agent.lastRun).toLocaleDateString('de-DE')}
                        {' '}
                        {new Date(agent.lastRun).toLocaleTimeString('de-DE')}
                      </>
                    ) : (
                      'Noch nicht ausgeführt'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Anzahl Runs</dt>
                  <dd className="mt-1 text-sm" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{agent.runCount}</dd>
                </div>
              </dl>
            </div>

            {agent.lastError && (
              <div style={{ backgroundColor: 'rgb(239 68 68 / 0.1)', borderWidth: '1px', borderColor: 'var(--clr-danger-a20)', borderRadius: '0.5rem', padding: '1rem' }}>
                <div className="flex">
                  <ExclamationCircleIcon className="h-5 w-5" style={{ color: 'var(--clr-danger-a10)' }} />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium" style={{ color: 'var(--clr-danger-a10)' }}>Letzter Fehler</h3>
                    <div className="mt-2 text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                      <p>{agent.lastError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-4">
            <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderRadius: '0.5rem', padding: '1.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Log-Einträge</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-primary-a10)' }}>{agent._count.logs}</p>
                </div>
                <CpuChipIcon className="h-12 w-12" style={{ color: 'var(--clr-info-a10)' }} />
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderRadius: '0.5rem', padding: '1.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Gesamt-Runs</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-primary-a10)' }}>{agent.runCount}</p>
                </div>
                <ClockIcon className="h-12 w-12" style={{ color: 'var(--clr-primary-a20)' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderRadius: '0.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              Log-Verlauf ({agent.logs.length})
            </h2>
            <div className="space-y-3">
              {agent.logs.length === 0 ? (
                <p className="text-center py-8" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Noch keine Logs vorhanden</p>
              ) : (
                agent.logs.map((log) => {
                  const Icon = LOG_LEVEL_ICONS[log.level] || InformationCircleIcon;
                  const getLevelStyle = (level: string) => {
                    switch(level) {
                      case 'error':
                        return { bg: 'rgb(239 68 68 / 0.1)', border: 'var(--clr-danger-a20)', iconColor: 'var(--clr-danger-a10)' };
                      case 'warning':
                        return { bg: 'rgb(251 191 36 / 0.1)', border: 'var(--clr-warning-a20)', iconColor: 'var(--clr-warning-a10)' };
                      case 'success':
                        return { bg: 'rgb(34 197 94 / 0.1)', border: 'var(--clr-success-a20)', iconColor: 'var(--clr-success-a10)' };
                      default:
                        return { bg: 'rgb(96 165 250 / 0.1)', border: 'var(--clr-info-a20)', iconColor: 'var(--clr-info-a10)' };
                    }
                  };
                  const style = getLevelStyle(log.level);
                  return (
                    <div
                      key={log.id}
                      className="border rounded-lg p-4"
                      style={{ backgroundColor: style.bg, borderColor: style.border }}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 flex-shrink-0" style={{ color: style.iconColor }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{log.message}</p>
                            <span className="text-xs" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                              {new Date(log.createdAt).toLocaleString('de-DE')}
                            </span>
                          </div>
                          {log.data && Object.keys(log.data).length > 0 && (
                            <pre className="mt-2 text-xs rounded p-2 overflow-x-auto" style={{ color: 'rgb(255 255 255 / 0.75)', backgroundColor: 'var(--clr-surface-a10)' }}>
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderRadius: '0.5rem', padding: '1.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Konfiguration</h2>
          <pre className="rounded-lg p-4 overflow-x-auto text-sm" style={{ backgroundColor: 'var(--clr-surface-a10)', color: 'rgb(255 255 255 / 0.9)' }}>
            {JSON.stringify(agent.config, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
