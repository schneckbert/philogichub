'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlayIcon,
  StopIcon,
  CpuChipIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
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

const TYPE_LABELS: Record<string, string> = {
  workflow: 'Workflow',
  scraper: 'Scraper',
  reporter: 'Reporter',
  monitor: 'Monitor',
};

export default function AgentsClient() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    fetchAgents();
  }, [statusFilter, typeFilter]);

  async function fetchAgents() {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);

      const response = await fetch(`/api/agents?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch agents');
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  }

  async function startAgent(agentId: string) {
    try {
      const response = await fetch(`/api/agents/${agentId}/start`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to start agent');
      await fetchAgents();
    } catch (error) {
      console.error('Error starting agent:', error);
      alert('Fehler beim Starten des Agenten');
    }
  }

  async function stopAgent(agentId: string) {
    try {
      const response = await fetch(`/api/agents/${agentId}/stop`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to stop agent');
      await fetchAgents();
    } catch (error) {
      console.error('Error stopping agent:', error);
      alert('Fehler beim Stoppen des Agenten');
    }
  }

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (agent.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: agents.length,
    running: agents.filter(a => a.status === 'running').length,
    idle: agents.filter(a => a.status === 'idle').length,
    error: agents.filter(a => a.status === 'error').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div style={{ color: 'rgb(255 255 255 / 0.5)' }}>Lade Agenten...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ backgroundColor: 'var(--clr-surface-a10)', padding: '1.5rem', borderRadius: '0.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Agenten-Management</h1>
          <p style={{ color: 'rgb(255 255 255 / 0.6)', marginTop: '0.25rem' }}>Überwachung und Steuerung von Automation-Agenten</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderRadius: '0.5rem', padding: '1.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Gesamt</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-primary-a10)' }}>{stats.total}</p>
            </div>
            <CpuChipIcon className="h-12 w-12" style={{ color: 'var(--clr-info-a10)' }} />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderRadius: '0.5rem', padding: '1.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Aktiv</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-success-a10)' }}>{stats.running}</p>
            </div>
            <CheckCircleIcon className="h-12 w-12" style={{ color: 'var(--clr-success-a10)' }} />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderRadius: '0.5rem', padding: '1.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Bereit</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'rgb(255 255 255 / 0.75)' }}>{stats.idle}</p>
            </div>
            <ClockIcon className="h-12 w-12" style={{ color: 'rgb(255 255 255 / 0.5)' }} />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderRadius: '0.5rem', padding: '1.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Fehler</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-danger-a10)' }}>{stats.error}</p>
            </div>
            <ExclamationTriangleIcon className="h-12 w-12" style={{ color: 'var(--clr-danger-a10)' }} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderRadius: '0.5rem', padding: '1rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: 'rgb(255 255 255 / 0.5)' }} />
            <input
              type="text"
              placeholder="Agent suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-lg focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: 'var(--clr-surface-a10)', 
                borderWidth: '1px', 
                borderColor: 'var(--clr-surface-a30)',
                color: 'rgb(255 255 255 / 0.9)'
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
            style={{ 
              backgroundColor: 'var(--clr-surface-a10)', 
              borderWidth: '1px', 
              borderColor: 'var(--clr-surface-a30)',
              color: 'rgb(255 255 255 / 0.9)'
            }}
          >
            <option value="">Alle Status</option>
            <option value="idle">Bereit</option>
            <option value="running">Läuft</option>
            <option value="stopped">Gestoppt</option>
            <option value="error">Fehler</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
            style={{ 
              backgroundColor: 'var(--clr-surface-a10)', 
              borderWidth: '1px', 
              borderColor: 'var(--clr-surface-a30)',
              color: 'rgb(255 255 255 / 0.9)'
            }}
          >
            <option value="">Alle Typen</option>
            <option value="workflow">Workflow</option>
            <option value="scraper">Scraper</option>
            <option value="reporter">Reporter</option>
            <option value="monitor">Monitor</option>
          </select>
        </div>
      </div>

      {/* Agents Table */}
      <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderRadius: '0.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead style={{ backgroundColor: 'var(--clr-surface-a10)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                  Letzter Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                  Runs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                  Logs
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'var(--clr-surface-a20)' }}>
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center" style={{ color: 'rgb(255 255 255 / 0.6)', borderTopWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
                    Keine Agenten gefunden
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent) => {
                  const [isHovered, setIsHovered] = React.useState(false);
                  return (
                    <tr 
                      key={agent.id}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      style={{ 
                        backgroundColor: isHovered ? 'var(--clr-surface-a10)' : 'transparent',
                        borderTopWidth: '1px',
                        borderColor: 'var(--clr-surface-a30)'
                      }}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <Link
                            href={`/agents/${agent.id}`}
                            className="font-medium"
                            style={{ color: 'var(--clr-info-a10)' }}
                          >
                            {agent.name}
                          </Link>
                          {agent.description && (
                            <p className="text-sm mt-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>{agent.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: 'rgb(96 165 250 / 0.2)', color: 'var(--clr-info-a10)' }}
                        >
                          {TYPE_LABELS[agent.type] || agent.type}
                        </span>
                      </td>
                    <td className="px-6 py-4">
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
                    </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                        {agent.lastRun ? (
                          <div>
                            <div>{new Date(agent.lastRun).toLocaleDateString('de-DE')}</div>
                            <div className="text-xs" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                              {new Date(agent.lastRun).toLocaleTimeString('de-DE')}
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                        {agent.runCount}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                        {agent._count.logs}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {agent.status === 'running' ? (
                          <button
                            onClick={() => stopAgent(agent.id)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{ 
                              backgroundColor: 'rgb(239 68 68 / 0.2)', 
                              color: 'var(--clr-danger-a10)',
                              borderWidth: '0'
                            }}
                          >
                            <StopIcon className="h-4 w-4 mr-1" />
                            Stop
                          </button>
                        ) : (
                          <button
                            onClick={() => startAgent(agent.id)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{ 
                              backgroundColor: 'rgb(34 197 94 / 0.2)', 
                              color: 'var(--clr-success-a10)',
                              borderWidth: '0'
                            }}
                          >
                            <PlayIcon className="h-4 w-4 mr-1" />
                            Start
                          </button>
                        )}
                        <Link
                          href={`/agents/${agent.id}`}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                          style={{ 
                            backgroundColor: 'var(--clr-surface-a10)', 
                            color: 'rgb(255 255 255 / 0.9)',
                            borderWidth: '1px',
                            borderColor: 'var(--clr-surface-a30)'
                          }}
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
