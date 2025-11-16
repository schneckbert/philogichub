'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Company {
  id: string;
  nameLegal: string;
  nameBrand: string | null;
  wzCode: string | null;
  statusSales: string;
  tier: string | null;
  website: string | null;
  phoneMain: string | null;
  emailMain: string | null;
  industryGeneral: string | null;
  createdAt: string;
  updatedAt: string;
  wzCodeRef: {
    code: string;
    nameDE: string;
  } | null;
  hqLocation: {
    id: string;
    name: string;
    street: string | null;
    city: string | null;
    zipcode: string | null;
    country: string | null;
  } | null;
  locations: Array<{
    id: string;
    name: string;
    city: string | null;
    locationType: string | null;
  }>;
  contacts: Array<{
    id: string;
    firstName: string;
    lastName: string;
    emailWork: string | null;
    phoneWork: string | null;
    jobTitle: string | null;
    roleStandardized: string | null;
  }>;
  opportunities: Array<{
    id: string;
    title: string;
    stage: string;
    estimatedValue: number | null;
    currency: string;
    expectedCloseDate: string | null;
    probability: number | null;
  }>;
  activities: Array<{
    id: string;
    activityType: string;
    channel: string | null;
    activityDatetime: string;
    subject: string | null;
    outcome: string | null;
  }>;
  techProfile: {
    id: string;
    hasCrm: boolean | null;
    hasErp: boolean | null;
    hasProjectManagement: boolean | null;
    digitalMaturityLevel: string | null;
  } | null;
  companyTrades: Array<{
    id: string;
    isPrimary: boolean;
    trade: {
      id: string;
      nameDE: string;
    };
  }>;
}

type TabType = 'overview' | 'contacts' | 'opportunities' | 'activities' | 'locations' | 'tech';

export default function CompanyDetailClient({ company }: { company: Company }) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: Array<{ id: TabType; label: string; count?: number }> = [
    { id: 'overview', label: 'Übersicht' },
    { id: 'contacts', label: 'Kontakte', count: company.contacts.length },
    { id: 'opportunities', label: 'Opportunities', count: company.opportunities.length },
    { id: 'activities', label: 'Aktivitäten', count: company.activities.length },
    { id: 'locations', label: 'Standorte', count: company.locations.length },
    { id: 'tech', label: 'Tech-Profil' },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'customer': return { bg: 'rgb(34 197 94 / 0.2)', text: 'var(--clr-success-a10)', border: 'var(--clr-success-a0)' };
      case 'prospect': return { bg: 'rgb(59 130 246 / 0.2)', text: 'var(--clr-info-a10)', border: 'var(--clr-info-a0)' };
      case 'lead': return { bg: 'rgb(139 92 246 / 0.2)', text: 'var(--clr-primary-a10)', border: 'var(--clr-primary-a0)' };
      default: return { bg: 'rgb(255 255 255 / 0.1)', text: 'rgb(255 255 255 / 0.6)', border: 'var(--clr-surface-a30)' };
    }
  };

  const getTierColor = (tier: string | null) => {
    if (!tier) return 'rgb(255 255 255 / 0.5)';
    switch (tier) {
      case 'A': return 'var(--clr-warning-a10)';
      case 'B': return 'var(--clr-info-a10)';
      case 'C': return 'rgb(255 255 255 / 0.6)';
      default: return 'rgb(255 255 255 / 0.5)';
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

  const statusStyle = getStatusStyle(company.statusSales);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--clr-surface-a0)' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--clr-surface-a30)', backgroundColor: 'var(--clr-surface-a10)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link 
                href="/crm" 
                className="text-sm hover:underline"
                style={{ color: 'rgb(255 255 255 / 0.6)' }}
              >
                ← Zurück zur Liste
              </Link>
              <div className="flex items-center gap-3 mt-2">
                <h1 className="text-2xl font-bold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                  {company.nameLegal}
                </h1>
                <span 
                  className="inline-block px-2 py-1 rounded text-xs font-medium"
                  style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}
                >
                  {company.statusSales}
                </span>
                {company.tier && (
                  <span className="text-lg font-bold" style={{ color: getTierColor(company.tier) }}>
                    Tier {company.tier}
                  </span>
                )}
              </div>
              {company.nameBrand && (
                <p className="text-sm mt-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                  Brand: {company.nameBrand}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--clr-surface-a20)', color: 'rgb(255 255 255 / 0.9)', border: '1px solid var(--clr-surface-a30)' }}
              >
                Bearbeiten
              </button>
              <button 
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--clr-info-a10)', color: 'var(--clr-light-a0)' }}
              >
                + Neue Aktivität
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--clr-surface-a30)', backgroundColor: 'var(--clr-surface-a10)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="py-4 px-1 font-medium text-sm transition-colors"
                style={{
                  borderBottom: activeTab === tab.id ? '2px solid var(--clr-info-a10)' : '2px solid transparent',
                  color: activeTab === tab.id ? 'var(--clr-info-a10)' : 'rgb(255 255 255 / 0.6)'
                }}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span 
                    className="ml-2 px-2 py-0.5 rounded-full text-xs"
                    style={{ backgroundColor: 'var(--clr-surface-a20)', color: 'rgb(255 255 255 / 0.75)' }}
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
              {/* Company Details */}
              <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
                <h2 className="text-lg font-bold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Unternehmensdaten</h2>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>WZ-Code</dt>
                    <dd className="font-medium mt-1" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                      {company.wzCodeRef ? (
                        <>
                          {company.wzCodeRef.code}
                          <span className="block text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>{company.wzCodeRef.nameDE}</span>
                        </>
                      ) : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Branche</dt>
                    <dd className="font-medium mt-1" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{company.industryGeneral || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Website</dt>
                    <dd className="font-medium mt-1" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                      {company.website ? (
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--clr-info-a10)' }}>
                          {company.website}
                        </a>
                      ) : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Telefon</dt>
                    <dd className="font-medium mt-1" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{company.phoneMain || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>E-Mail</dt>
                    <dd className="font-medium mt-1" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                      {company.emailMain ? (
                        <a href={`mailto:${company.emailMain}`} className="hover:underline" style={{ color: 'var(--clr-info-a10)' }}>
                          {company.emailMain}
                        </a>
                      ) : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Erstellt am</dt>
                    <dd className="font-medium mt-1" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{formatDate(company.createdAt)}</dd>
                  </div>
                </dl>
              </div>

              {/* HQ Location */}
              {company.hqLocation && (
                <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
                  <h2 className="text-lg font-bold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Hauptsitz</h2>
                  <div style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                    <p className="font-medium">{company.hqLocation.name}</p>
                    {company.hqLocation.street && <p className="mt-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>{company.hqLocation.street}</p>}
                    {(company.hqLocation.zipcode || company.hqLocation.city) && (
                      <p style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                        {company.hqLocation.zipcode} {company.hqLocation.city}
                      </p>
                    )}
                    {company.hqLocation.country && <p style={{ color: 'rgb(255 255 255 / 0.6)' }}>{company.hqLocation.country}</p>}
                  </div>
                </div>
              )}

              {/* Trades */}
              {company.companyTrades.length > 0 && (
                <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
                  <h2 className="text-lg font-bold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Gewerke</h2>
                  <div className="flex flex-wrap gap-2">
                    {company.companyTrades.map((ct) => (
                      <span
                        key={ct.id}
                        className="px-3 py-1 rounded-lg text-sm font-medium"
                        style={{
                          backgroundColor: ct.isPrimary ? 'var(--clr-info-a10)' : 'var(--clr-surface-a10)',
                          color: ct.isPrimary ? 'var(--clr-light-a0)' : 'rgb(255 255 255 / 0.75)'
                        }}
                      >
                        {ct.trade.nameDE}
                        {ct.isPrimary && ' (Primär)'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
                <h3 className="text-sm font-medium mb-4" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Statistiken</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{company.contacts.length}</div>
                    <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Kontakte</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--clr-info-a10)' }}>{company.opportunities.length}</div>
                    <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Opportunities</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--clr-primary-a20)' }}>{company.activities.length}</div>
                    <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Aktivitäten</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--clr-success-a10)' }}>{company.locations.length}</div>
                    <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Standorte</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
            <div className="p-6" style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--clr-surface-a30)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Kontakte</h2>
                <button className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors" style={{ backgroundColor: 'var(--clr-info-a10)' }}>
                  + Neuer Kontakt
                </button>
              </div>
            </div>
            {company.contacts.length === 0 ? (
              <div className="p-12 text-center" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                Keine Kontakte vorhanden
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--clr-surface-a30)', backgroundColor: 'var(--clr-surface-a10)' }}>
                    <th className="text-left px-6 py-3 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Name</th>
                    <th className="text-left px-6 py-3 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Position</th>
                    <th className="text-left px-6 py-3 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>E-Mail</th>
                    <th className="text-left px-6 py-3 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Telefon</th>
                    <th className="text-left px-6 py-3 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Rolle</th>
                  </tr>
                </thead>
                <tbody>
                  {company.contacts.map((contact) => (
                    <tr key={contact.id} style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--clr-surface-a30)' }}>
                      <td className="px-6 py-4 font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                        {contact.firstName} {contact.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>{contact.jobTitle || '—'}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                        {contact.emailWork ? (
                          <a href={`mailto:${contact.emailWork}`} className="hover:underline" style={{ color: 'var(--clr-info-a10)' }}>
                            {contact.emailWork}
                          </a>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>{contact.phoneWork || '—'}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>{contact.roleStandardized || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
            <div className="p-6" style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--clr-surface-a30)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Opportunities</h2>
                <button className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors" style={{ backgroundColor: 'var(--clr-info-a10)' }}>
                  + Neue Opportunity
                </button>
              </div>
            </div>
            {company.opportunities.length === 0 ? (
              <div className="p-12 text-center" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                Keine Opportunities vorhanden
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--clr-surface-a30)', backgroundColor: 'var(--clr-surface-a10)' }}>
                    <th className="text-left px-6 py-3 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Titel</th>
                    <th className="text-left px-6 py-3 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Stage</th>
                    <th className="text-left px-6 py-3 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Wert</th>
                    <th className="text-left px-6 py-3 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Wahrscheinlichkeit</th>
                    <th className="text-left px-6 py-3 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Close-Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {company.opportunities.map((opp) => (
                    <tr key={opp.id} style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--clr-surface-a30)' }}>
                      <td className="px-6 py-4 font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{opp.title}</td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: 'var(--clr-surface-a10)',
                            color: 'rgb(255 255 255 / 0.75)'
                          }}
                        >
                          {opp.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                        {formatCurrency(opp.estimatedValue, opp.currency)}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                        {opp.probability ? `${opp.probability}%` : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                        {opp.expectedCloseDate ? formatDate(opp.expectedCloseDate) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
            <div className="p-6" style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--clr-surface-a30)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Aktivitäten</h2>
            </div>
            {company.activities.length === 0 ? (
              <div className="p-12 text-center" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                Keine Aktivitäten vorhanden
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {company.activities.map((activity) => (
                  <div key={activity.id} className="pl-4 py-2" style={{ borderLeftWidth: '2px', borderLeftStyle: 'solid', borderLeftColor: 'var(--clr-info-a10)' }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: 'rgb(96 165 250 / 0.2)',
                              color: 'var(--clr-info-a10)'
                            }}
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

        {/* Locations Tab */}
        {activeTab === 'locations' && (
          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
            <div className="p-6" style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--clr-surface-a30)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Standorte</h2>
                <button className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors" style={{ backgroundColor: 'var(--clr-info-a10)' }}>
                  + Neuer Standort
                </button>
              </div>
            </div>
            {company.locations.length === 0 ? (
              <div className="p-12 text-center" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                Keine Standorte vorhanden
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.locations.map((location) => (
                  <div key={location.id} className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a10)', border: '1px solid var(--clr-surface-a30)' }}>
                    <h3 className="font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{location.name}</h3>
                    {location.city && <p className="text-sm mt-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>{location.city}</p>}
                    {location.locationType && (
                      <span 
                        className="inline-block mt-2 px-2 py-1 rounded text-xs"
                        style={{
                          backgroundColor: 'var(--clr-surface-a20)',
                          color: 'rgb(255 255 255 / 0.75)'
                        }}
                      >
                        {location.locationType}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tech Profile Tab */}
        {activeTab === 'tech' && (
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
            <h2 className="text-lg font-bold mb-6" style={{ color: 'rgb(255 255 255 / 0.9)' }}>Tech-Profil</h2>
            {company.techProfile ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a10)', border: '1px solid var(--clr-surface-a30)' }}>
                    <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>CRM-System</div>
                    <div 
                      className="text-2xl font-bold mt-2"
                      style={{
                        color: company.techProfile.hasCrm ? 'var(--clr-success-a10)' : 'var(--clr-danger-a10)'
                      }}
                    >
                      {company.techProfile.hasCrm ? 'Ja' : 'Nein'}
                    </div>
                  </div>
                  <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a10)', border: '1px solid var(--clr-surface-a30)' }}>
                    <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>ERP-System</div>
                    <div 
                      className="text-2xl font-bold mt-2"
                      style={{
                        color: company.techProfile.hasErp ? 'var(--clr-success-a10)' : 'var(--clr-danger-a10)'
                      }}
                    >
                      {company.techProfile.hasErp ? 'Ja' : 'Nein'}
                    </div>
                  </div>
                  <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a10)', border: '1px solid var(--clr-surface-a30)' }}>
                    <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Projektmanagement</div>
                    <div 
                      className="text-2xl font-bold mt-2"
                      style={{
                        color: company.techProfile.hasProjectManagement ? 'var(--clr-success-a10)' : 'var(--clr-danger-a10)'
                      }}
                    >
                      {company.techProfile.hasProjectManagement ? 'Ja' : 'Nein'}
                    </div>
                  </div>
                </div>
                {company.techProfile.digitalMaturityLevel && (
                  <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a10)', border: '1px solid var(--clr-surface-a30)' }}>
                    <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Digitale Reife</div>
                    <div className="text-xl font-bold mt-2" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{company.techProfile.digitalMaturityLevel}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                Kein Tech-Profil vorhanden
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
