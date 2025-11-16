'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Opportunity {
  id: string;
  stage: string;
  estimatedValue: number | null;
  currency: string;
  expectedCloseDate: string | null;
  probability: number | null;
  offerType: string | null;
  projectType: string | null;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    nameLegal: string;
    nameBrand: string | null;
    tier: string | null;
  };
  primaryContact: {
    id: string;
    firstName: string;
    lastName: string;
    emailWork: string | null;
    phoneWork: string | null;
    jobTitle: string | null;
  } | null;
  activities: Array<{
    id: string;
    activityType: string;
    channel: string | null;
    activityDatetime: string;
    subject: string | null;
    outcome: string | null;
  }>;
}

type TabType = 'overview' | 'activities' | 'timeline';

// Helper to generate display title
const getOpportunityTitle = (opp: Opportunity) => {
  if (opp.offerType && opp.projectType) {
    return `${opp.offerType} - ${opp.projectType}`;
  }
  if (opp.offerType) return opp.offerType;
  if (opp.projectType) return opp.projectType;
  return `Opportunity ${opp.id.substring(0, 8)}`;
};

export default function OpportunityDetailClient({ opportunity }: { opportunity: Opportunity }) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: Array<{ id: TabType; label: string; count?: number }> = [
    { id: 'overview', label: 'Übersicht' },
    { id: 'activities', label: 'Aktivitäten', count: opportunity.activities.length },
    { id: 'timeline', label: 'Timeline' },
  ];

  const getStageStyle = (stage: string): { bg: string; text: string; border: string } => {
    switch (stage) {
      case 'new':
        return { bg: 'rgb(96 165 250 / 0.2)', text: 'var(--clr-info-a10)', border: 'var(--clr-info-a20)' };
      case 'qualification':
        return { bg: 'rgb(168 85 247 / 0.2)', text: 'var(--clr-primary-a20)', border: 'var(--clr-primary-a30)' };
      case 'proposal':
        return { bg: 'rgb(96 165 250 / 0.2)', text: 'var(--clr-info-a10)', border: 'var(--clr-info-a20)' };
      case 'negotiation':
        return { bg: 'rgb(251 191 36 / 0.2)', text: 'var(--clr-warning-a10)', border: 'var(--clr-warning-a20)' };
      case 'closed_won':
        return { bg: 'rgb(34 197 94 / 0.2)', text: 'var(--clr-success-a10)', border: 'var(--clr-success-a20)' };
      case 'closed_lost':
        return { bg: 'rgb(239 68 68 / 0.2)', text: 'var(--clr-danger-a10)', border: 'var(--clr-danger-a20)' };
      default:
        return { bg: 'rgb(255 255 255 / 0.1)', text: 'rgb(255 255 255 / 0.75)', border: 'var(--clr-surface-a30)' };
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'A': return 'var(--clr-warning-a10)';
      case 'B': return 'var(--clr-info-a10)';
      case 'C': return 'rgb(255 255 255 / 0.75)';
      default: return 'rgb(255 255 255 / 0.6)';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number | null, currency: string = 'EUR') => {
    if (!value) return '—';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(value);
  };

  const stageLabels: Record<string, string> = {
    'qualification': 'Qualifizierung',
    'proposal': 'Angebot',
    'negotiation': 'Verhandlung',
    'closed_won': 'Gewonnen',
    'closed_lost': 'Verloren',
  };

  const stageStyle = getStageStyle(opportunity.stage);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--clr-surface-a0)' }}>
      {/* Header */}
      <header style={{ borderBottomWidth: '1px', borderColor: 'var(--clr-surface-a30)', backgroundColor: 'var(--clr-surface-a10)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/opportunities" className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                ← Zurück zur Liste
              </Link>
              <div className="flex items-center gap-3 mt-2">
                <h1 className="text-2xl font-bold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                  {getOpportunityTitle(opportunity)}
                </h1>
                <span 
                  className="inline-block px-2 py-1 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: stageStyle.bg, 
                    color: stageStyle.text,
                    borderWidth: '1px',
                    borderColor: stageStyle.border
                  }}
                >
                  {stageLabels[opportunity.stage] || opportunity.stage}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Link 
                  href={`/crm/${opportunity.company.id}`} 
                  className="text-sm"
                  style={{ color: 'var(--clr-info-a10)' }}
                >
                  {opportunity.company.nameBrand || opportunity.company.nameLegal}
                </Link>
                {opportunity.company.tier && (
                  <span 
                    className="text-sm font-bold"
                    style={{ color: getTierColor(opportunity.company.tier) }}
                  >
                    Tier {opportunity.company.tier}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ 
                  backgroundColor: 'var(--clr-surface-a20)', 
                  color: 'rgb(255 255 255 / 0.9)',
                  borderWidth: '1px',
                  borderColor: 'var(--clr-surface-a30)'
                }}
              >
                Bearbeiten
              </button>
              <button 
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ 
                  backgroundColor: 'var(--clr-info-a10)', 
                  color: 'rgb(255 255 255 / 0.9)'
                }}
              >
                + Neue Aktivität
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ borderBottomWidth: '1px', borderColor: 'var(--clr-surface-a30)', backgroundColor: 'var(--clr-surface-a0)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="py-4 px-1 font-medium text-sm transition-colors"
                style={{
                  borderBottomWidth: '2px',
                  borderColor: activeTab === tab.id ? 'var(--clr-info-a10)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--clr-info-a10)' : 'rgb(255 255 255 / 0.6)'
                }}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span 
                    className="ml-2 px-2 py-0.5 rounded-full text-xs"
                    style={{ backgroundColor: 'var(--clr-surface-a20)' }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Opportunity Details */}
              <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)', borderRadius: '0.5rem', padding: '1.5rem' }}>
                <h2 className="text-lg font-bold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Details</h2>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Wert</dt>
                    <dd className="font-medium text-xl mt-1" style={{ color: 'var(--clr-primary-a10)' }}>
                      {formatCurrency(opportunity.estimatedValue ? Number(opportunity.estimatedValue) : null, opportunity.currency)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Wahrscheinlichkeit</dt>
                    <dd className="font-medium text-xl mt-1" style={{ color: 'var(--clr-success-a10)' }}>
                      {opportunity.probability ? `${opportunity.probability}%` : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Erwartetes Close-Datum</dt>
                    <dd className="font-medium mt-1" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                      {opportunity.expectedCloseDate ? formatDate(opportunity.expectedCloseDate) : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Erstellt am</dt>
                    <dd className="font-medium mt-1" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{formatDate(opportunity.createdAt)}</dd>
                  </div>
                  {opportunity.offerType && (
                    <div>
                      <dt className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Angebotstyp</dt>
                      <dd className="font-medium mt-1" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{opportunity.offerType}</dd>
                    </div>
                  )}
                  {opportunity.projectType && (
                    <div>
                      <dt className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Projekttyp</dt>
                      <dd className="font-medium mt-1" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{opportunity.projectType}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Primary Contact */}
              {opportunity.primaryContact && (
                <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)', borderRadius: '0.5rem', padding: '1.5rem' }}>
                  <h2 className="text-lg font-bold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Hauptkontakt</h2>
                  <div>
                    <p className="font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                      {opportunity.primaryContact.firstName} {opportunity.primaryContact.lastName}
                    </p>
                    {opportunity.primaryContact.jobTitle && (
                      <p className="text-sm mt-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>{opportunity.primaryContact.jobTitle}</p>
                    )}
                    <div className="mt-3 space-y-1">
                      {opportunity.primaryContact.emailWork && (
                        <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                          <a 
                            href={`mailto:${opportunity.primaryContact.emailWork}`}
                            style={{ color: 'var(--clr-info-a10)' }}
                          >
                            {opportunity.primaryContact.emailWork}
                          </a>
                        </p>
                      )}
                      {opportunity.primaryContact.phoneWork && (
                        <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>{opportunity.primaryContact.phoneWork}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)', borderRadius: '0.5rem', padding: '1.5rem' }}>
                <h3 className="text-sm font-medium mb-4" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Zusammenfassung</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--clr-primary-a10)' }}>
                      {formatCurrency(opportunity.estimatedValue ? Number(opportunity.estimatedValue) : null, opportunity.currency)}
                    </div>
                    <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Geschätzter Wert</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--clr-info-a10)' }}>{opportunity.probability || 0}%</div>
                    <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Erfolgswahrscheinlichkeit</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--clr-primary-a20)' }}>{opportunity.activities.length}</div>
                    <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Aktivitäten</div>
                  </div>
                </div>
              </div>

              {/* Company Info */}
              <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)', borderRadius: '0.5rem', padding: '1.5rem' }}>
                <h3 className="text-sm font-medium mb-4" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Company</h3>
                <Link 
                  href={`/crm/${opportunity.company.id}`}
                  className="block font-medium transition-colors"
                  style={{ color: 'var(--clr-info-a10)' }}
                >
                  {opportunity.company.nameBrand || opportunity.company.nameLegal}
                </Link>
                {opportunity.company.tier && (
                  <div className="mt-2">
                    <span 
                      className="text-sm font-bold"
                      style={{ color: getTierColor(opportunity.company.tier) }}
                    >
                      Tier {opportunity.company.tier}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Aktivitäten</h2>
              <button 
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--clr-info-a10)', color: 'rgb(255 255 255 / 0.9)' }}
              >
                + Neue Aktivität
              </button>
            </div>
            {opportunity.activities.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                Keine Aktivitäten vorhanden
              </div>
            ) : (
              <div className="space-y-4">
                {opportunity.activities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="pl-4 py-2"
                    style={{ borderLeftWidth: '2px', borderColor: 'var(--clr-info-a10)' }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ backgroundColor: 'rgb(96 165 250 / 0.2)', color: 'var(--clr-info-a10)' }}
                          >
                            {activity.activityType}
                          </span>
                          {activity.channel && (
                            <span className="text-xs" style={{ color: 'rgb(255 255 255 / 0.6)' }}>{activity.channel}</span>
                          )}
                        </div>
                        {activity.subject && (
                          <p className="font-medium mt-2" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{activity.subject}</p>
                        )}
                        {activity.outcome && (
                          <p className="text-sm mt-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>{activity.outcome}</p>
                        )}
                      </div>
                      <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                        {formatDate(activity.activityDatetime)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div style={{ backgroundColor: 'var(--clr-surface-a20)', borderWidth: '1px', borderColor: 'var(--clr-surface-a30)', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <h2 className="text-lg font-bold mb-6" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Timeline</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--clr-success-a10)' }}></div>
                  <div className="w-0.5 h-full" style={{ backgroundColor: 'var(--clr-surface-a30)' }}></div>
                </div>
                <div className="flex-1 pb-6">
                  <div className="font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Opportunity erstellt</div>
                  <div className="text-sm mt-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>{formatDate(opportunity.createdAt)}</div>
                </div>
              </div>
              
              {opportunity.activities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--clr-info-a10)' }}></div>
                    {index < opportunity.activities.length - 1 && (
                      <div className="w-0.5 h-full" style={{ backgroundColor: 'var(--clr-surface-a30)' }}></div>
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{activity.activityType}</div>
                    {activity.subject && (
                      <div className="text-sm mt-1" style={{ color: 'rgb(255 255 255 / 0.75)' }}>{activity.subject}</div>
                    )}
                    <div className="text-sm mt-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>{formatDate(activity.activityDatetime)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
