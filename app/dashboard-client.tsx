'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardData {
  companyStats: {
    total: number;
    customers: number;
    prospects: number;
    newThisMonth: number;
    tierA: number;
    tierB: number;
    tierC: number;
  };
  opportunityPipeline: Array<{
    stage: string;
    count: number;
    totalValue: number;
    avgProbability: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    channel: string | null;
    subject: string | null;
    datetime: string;
    outcome: string | null;
    company: {
      id: string;
      name: string;
    } | null;
    contact: {
      id: string;
      name: string;
    } | null;
  }>;
  topCompanies: Array<{
    id: string;
    nameLegal: string;
    nameBrand: string | null;
    statusSales: string;
    tier: string | null;
    pipelineValue: number;
    opportunityCount: number;
    contactCount: number;
  }>;
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading dashboard:', err);
        setLoading(false);
      });
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStageStyle = (stage: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      'qualification': { bg: 'rgb(139 92 246 / 0.2)', text: 'var(--clr-primary-a10)' },
      'proposal': { bg: 'rgb(59 130 246 / 0.2)', text: 'var(--clr-info-a10)' },
      'negotiation': { bg: 'rgb(245 158 11 / 0.2)', text: 'var(--clr-warning-a10)' },
      'closed_won': { bg: 'rgb(34 197 94 / 0.2)', text: 'var(--clr-success-a10)' },
      'closed_lost': { bg: 'rgb(239 68 68 / 0.2)', text: 'var(--clr-danger-a10)' },
    };
    return styles[stage] || { bg: 'rgb(255 255 255 / 0.1)', text: 'rgb(255 255 255 / 0.6)' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--clr-surface-a0)' }}>
        <div style={{ color: 'rgb(255 255 255 / 0.6)' }}>Dashboard wird geladen...</div>
      </div>
    );
  }

  if (!data || !data.companyStats) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--clr-surface-a0)' }}>
        <div style={{ color: 'rgb(255 255 255 / 0.6)' }}>Fehler beim Laden des Dashboards</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--clr-surface-a0)' }}>
      {/* Header */}
      <header 
        style={{ 
          borderBottom: '1px solid var(--clr-surface-a30)',
          backgroundColor: 'var(--clr-surface-a10)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Dashboard</h1>
              <p className="text-sm mt-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                Zentrale Übersicht · Philogic-Hub
              </p>
            </div>
            <div className="flex gap-2">
              <Link 
                href="/crm"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--clr-info-a10)',
                  color: 'var(--clr-light-a0)'
                }}
              >
                CRM öffnen
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Company Stats */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Companies</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
              <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Gesamt</div>
              <div className="text-3xl font-bold mt-1" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{data.companyStats.total}</div>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
              <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Kunden</div>
              <div className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-success-a10)' }}>{data.companyStats.customers}</div>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
              <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Prospects</div>
              <div className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-info-a10)' }}>{data.companyStats.prospects}</div>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
              <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Neu (30 Tage)</div>
              <div className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-primary-a10)' }}>{data.companyStats.newThisMonth}</div>
            </div>
          </div>
        </section>

        {/* Tier Distribution */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Tier-Verteilung</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
              <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Tier A</div>
              <div className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-warning-a10)' }}>{data.companyStats.tierA}</div>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
              <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Tier B</div>
              <div className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-info-a10)' }}>{data.companyStats.tierB}</div>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
              <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Tier C</div>
              <div className="text-3xl font-bold mt-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>{data.companyStats.tierC}</div>
            </div>
          </div>
        </section>

        {/* Opportunity Pipeline */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Opportunity Pipeline</h2>
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--clr-surface-a30)', backgroundColor: 'var(--clr-surface-a10)' }}>
                  <th className="text-left px-6 py-3 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Stage</th>
                  <th className="text-right px-6 py-3 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Anzahl</th>
                  <th className="text-right px-6 py-3 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Gesamt-Wert</th>
                  <th className="text-right px-6 py-3 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Ø Wahrscheinlichkeit</th>
                </tr>
              </thead>
              <tbody>
                {data.opportunityPipeline.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                      Keine Opportunities vorhanden
                    </td>
                  </tr>
                ) : (
                  data.opportunityPipeline.map((item) => {
                    const stageStyle = getStageStyle(item.stage);
                    return (
                      <tr 
                        key={item.stage} 
                        className="transition-colors"
                        style={{ borderBottom: '1px solid var(--clr-surface-a30)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--clr-surface-a10)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td className="px-6 py-4">
                          <span 
                            className="inline-block px-3 py-1 rounded text-xs font-medium"
                            style={{ backgroundColor: stageStyle.bg, color: stageStyle.text }}
                          >
                            {item.stage}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{item.count}</td>
                        <td className="px-6 py-4 text-right font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{formatCurrency(item.totalValue)}</td>
                        <td className="px-6 py-4 text-right" style={{ color: 'rgb(255 255 255 / 0.75)' }}>{item.avgProbability.toFixed(1)}%</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <section>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Letzte Aktivitäten</h2>
            <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
              {data.recentActivities.length === 0 ? (
                <div className="text-center py-8" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                  Keine Aktivitäten vorhanden
                </div>
              ) : (
                <div className="space-y-4">
                  {data.recentActivities.map((activity) => (
                    <div key={activity.id} className="pl-4 py-2" style={{ borderLeft: '2px solid var(--clr-info-a10)' }}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span 
                              className="px-2 py-1 rounded text-xs font-medium"
                              style={{ backgroundColor: 'rgb(59 130 246 / 0.2)', color: 'var(--clr-info-a10)' }}
                            >
                              {activity.type}
                            </span>
                            {activity.channel && (
                              <span className="text-xs" style={{ color: 'rgb(255 255 255 / 0.6)' }}>{activity.channel}</span>
                            )}
                          </div>
                          {activity.subject && (
                            <p className="text-sm font-medium mt-2" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{activity.subject}</p>
                          )}
                          {activity.company && (
                            <Link 
                              href={`/crm/${activity.company.id}`}
                              className="text-xs mt-1 block hover:underline"
                              style={{ color: 'rgb(255 255 255 / 0.6)' }}
                            >
                              {activity.company.name}
                            </Link>
                          )}
                          {activity.outcome && (
                            <p className="text-xs mt-1" style={{ color: 'rgb(255 255 255 / 0.5)' }}>{activity.outcome}</p>
                          )}
                        </div>
                        <div className="text-xs ml-4" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                          {formatDate(activity.datetime)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Top Companies */}
          <section>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Top Companies (Pipeline)</h2>
            <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
              {data.topCompanies.length === 0 ? (
                <div className="text-center py-8" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                  Keine Companies vorhanden
                </div>
              ) : (
                <div className="space-y-3">
                  {data.topCompanies.slice(0, 10).map((company) => (
                    <Link
                      key={company.id}
                      href={`/crm/${company.id}`}
                      className="block p-3 rounded-lg transition-colors"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--clr-surface-a10)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                              {company.nameBrand || company.nameLegal}
                            </span>
                            {company.tier && (
                              <span 
                                className="text-xs font-bold"
                                style={{ 
                                  color: company.tier === 'A' ? 'var(--clr-warning-a10)' :
                                         company.tier === 'B' ? 'var(--clr-info-a10)' :
                                         'rgb(255 255 255 / 0.6)'
                                }}
                              >
                                {company.tier}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                            <span>{company.opportunityCount} Opps</span>
                            <span>·</span>
                            <span>{company.contactCount} Kontakte</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                            {formatCurrency(company.pipelineValue)}
                          </div>
                          <div className="text-xs mt-1" style={{ color: 'rgb(255 255 255 / 0.5)' }}>Pipeline</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
