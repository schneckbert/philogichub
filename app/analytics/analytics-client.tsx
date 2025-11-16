'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  CurrencyEuroIcon,
  UserGroupIcon,
  CalendarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  stageDistribution: Array<{
    stage: string;
    count: number;
    value: number;
  }>;
  pipelineTrend: Array<{
    month: string;
    count: number;
    value: number;
  }>;
  metrics: {
    totalOpportunities: number;
    wonOpportunities: number;
    lostOpportunities: number;
    winRate: number;
    avgDealSize: number;
  };
  companyPerformance: Array<{
    id: string;
    name: string;
    tier: string | null;
    totalOpportunities: number;
    wonOpportunities: number;
    winRate: number;
    totalValue: number;
  }>;
  activitiesByType: Array<{
    type: string;
    count: number;
  }>;
  recentWins: Array<{
    id: string;
    company: string;
    value: number;
    wonDate: Date | null;
  }>;
}

// Design token colors for Recharts (hex values extracted from CSS variables)
const STAGE_COLORS: Record<string, string> = {
  new: '#60a5fa',      // info-a10
  qualification: '#818cf8', // primary-a10 (approximation)
  proposal: '#fbbf24', // warning-a10
  negotiation: '#4ade80', // success-a10
  closed_won: '#4ade80', // success-a10
  closed_lost: '#f87171', // danger-a10
};

const STAGE_LABELS: Record<string, string> = {
  new: 'Neu',
  qualification: 'Qualifizierung',
  proposal: 'Angebot',
  negotiation: 'Verhandlung',
  closed_won: 'Gewonnen',
  closed_lost: 'Verloren',
};

const ACTIVITY_COLORS: Record<string, string> = {
  call: '#3b82f6',
  meeting: '#8b5cf6',
  email: '#10b981',
  task: '#f59e0b',
  note: '#6b7280',
};

export default function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div style={{ color: 'rgb(255 255 255 / 0.5)' }}>Lade Analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div style={{ color: 'var(--clr-danger-a10)' }}>Fehler beim Laden der Analytics-Daten</div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Prepare stage data for charts
  const stageChartData = data.stageDistribution.map(item => ({
    name: STAGE_LABELS[item.stage] || item.stage,
    stage: item.stage,
    count: item.count,
    value: item.value,
  }));

  // Prepare activity type data
  const activityChartData = data.activitiesByType.map(item => ({
    name: item.type === 'call' ? 'Anrufe' :
          item.type === 'meeting' ? 'Meetings' :
          item.type === 'email' ? 'E-Mails' :
          item.type === 'task' ? 'Aufgaben' :
          item.type === 'note' ? 'Notizen' : item.type,
    value: item.count,
    type: item.type,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div style={{ backgroundColor: 'var(--clr-surface-a10)', padding: '1.5rem', borderRadius: '0.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Analytics Dashboard</h1>
        <p style={{ color: 'rgb(255 255 255 / 0.6)', marginTop: '0.25rem' }}>Übersicht über Performance und Trends</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderRadius: '0.5rem', padding: '1.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Total Opportunities</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-primary-a10)' }}>{data.metrics.totalOpportunities}</p>
            </div>
            <ChartBarIcon className="h-12 w-12" style={{ color: 'var(--clr-info-a10)' }} />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderRadius: '0.5rem', padding: '1.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Win Rate</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-success-a10)' }}>{data.metrics.winRate}%</p>
            </div>
            <ArrowTrendingUpIcon className="h-12 w-12" style={{ color: 'var(--clr-success-a10)' }} />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderRadius: '0.5rem', padding: '1.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Ø Deal-Größe</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--clr-primary-a10)' }}>
                {formatCurrency(data.metrics.avgDealSize)}
              </p>
            </div>
            <CurrencyEuroIcon className="h-12 w-12" style={{ color: 'var(--clr-primary-a20)' }} />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderRadius: '0.5rem', padding: '1.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Gewonnen</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-success-a10)' }}>{data.metrics.wonOpportunities}</p>
              <p className="text-xs mt-1" style={{ color: 'rgb(255 255 255 / 0.5)' }}>Verloren: {data.metrics.lostOpportunities}</p>
            </div>
            <CheckCircleIcon className="h-12 w-12" style={{ color: 'var(--clr-success-a10)' }} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline by Stage */}
        <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderRadius: '0.5rem', padding: '1.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Pipeline nach Stage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stageChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'value') return formatCurrency(value);
                  return value;
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Anzahl" />
              <Bar yAxisId="right" dataKey="value" fill="#10b981" name="Wert (€)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Trend */}
        <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderRadius: '0.5rem', padding: '1.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Pipeline Trend (6 Monate)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.pipelineTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'value') return formatCurrency(value);
                  return value;
                }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="count" stroke="#3b82f6" name="Neue Opportunities" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="value" stroke="#10b981" name="Wert (€)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Distribution */}
        <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderRadius: '0.5rem', padding: '1.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Aktivitäten nach Typ</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={activityChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {activityChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={ACTIVITY_COLORS[entry.type] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Wins */}
        <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderRadius: '0.5rem', padding: '1.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Letzte Erfolge</h2>
          <div className="space-y-3">
            {data.recentWins.length === 0 ? (
              <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Noch keine gewonnenen Opportunities</p>
            ) : (
              data.recentWins.map((win) => (
                <div key={win.id} className="flex items-center justify-between pb-2" style={{ borderBottomWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{win.company}</p>
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                      <CalendarIcon className="h-3 w-3" />
                      {win.wonDate ? new Date(win.wonDate).toLocaleDateString('de-DE') : 'N/A'}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold" style={{ color: 'var(--clr-success-a10)' }}>{formatCurrency(win.value)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Companies */}
      <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderRadius: '0.5rem', padding: '1.5rem', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Top 10 Firmen nach Pipeline-Wert</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead style={{ backgroundColor: 'var(--clr-surface-a10)' }}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Firma</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Tier</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Opportunities</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Gewonnen</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Win Rate</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Gesamt-Wert</th>
              </tr>
            </thead>
            <tbody>
              {data.companyPerformance.map((company, index) => {
                const [isHovered, setIsHovered] = React.useState(false);
                return (
                  <tr 
                    key={company.id}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{ 
                      backgroundColor: isHovered ? 'var(--clr-surface-a10)' : 'transparent',
                      borderTopWidth: index > 0 ? '1px' : '0',
                      borderColor: 'var(--clr-surface-a30)'
                    }}
                  >
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{company.name}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                      {company.tier ? (
                        <span 
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                          style={{ backgroundColor: 'rgb(96 165 250 / 0.2)', color: 'var(--clr-info-a10)' }}
                        >
                          {company.tier}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right" style={{ color: 'rgb(255 255 255 / 0.75)' }}>{company.totalOpportunities}</td>
                    <td className="px-4 py-3 text-sm text-right" style={{ color: 'rgb(255 255 255 / 0.75)' }}>{company.wonOpportunities}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span 
                        className="font-semibold"
                        style={{ color: company.winRate >= 50 ? 'var(--clr-success-a10)' : 'rgb(255 255 255 / 0.75)' }}
                      >
                        {company.winRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold" style={{ color: 'var(--clr-primary-a10)' }}>
                      {formatCurrency(company.totalValue)}
                    </td>
                  </tr>
                );
              })}
              {data.companyPerformance.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                    Keine Daten verfügbar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
