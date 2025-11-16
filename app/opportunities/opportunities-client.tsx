'use client';

import { useEffect, useState } from 'react';
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
  } | null;
}

interface Company {
  id: string;
  name_legal: string;
  name_brand: string | null;
}

// Transform snake_case API response to camelCase
function transformOpportunity(raw: any): Opportunity {
  return {
    id: raw.id,
    stage: raw.stage,
    estimatedValue: raw.estimated_value,
    currency: raw.currency,
    expectedCloseDate: raw.expected_close_date,
    probability: raw.probability,
    offerType: raw.offer_type,
    projectType: raw.project_type,
    createdAt: raw.created_at,
    company: {
      id: raw.company.id,
      nameLegal: raw.company.name_legal,
      nameBrand: raw.company.name_brand,
      tier: raw.company.tier
    },
    primaryContact: raw.contact ? {
      id: raw.contact.id,
      firstName: raw.contact.first_name,
      lastName: raw.contact.last_name
    } : null
  };
}

// Helper to generate display title from opportunity data
const getOpportunityTitle = (opp: Opportunity) => {
  if (opp.offerType && opp.projectType) {
    return `${opp.offerType} - ${opp.projectType}`;
  }
  if (opp.offerType) return opp.offerType;
  if (opp.projectType) return opp.projectType;
  return `Opportunity ${opp.id.substring(0, 8)}`;
};

export default function OpportunitiesClient() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadOpportunities = async () => {
    try {
      const params = new URLSearchParams();
      if (stageFilter) params.append('stage', stageFilter);
      
      const res = await fetch(`/api/opportunities?${params.toString()}`);
      const data = await res.json();
      setOpportunities(data.map(transformOpportunity));
      setLoading(false);
    } catch (err) {
      console.error('Error loading opportunities:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
    // Load companies for modal
    fetch('/api/companies')
      .then(res => res.json())
      .then(data => setCompanies(data))
      .catch(err => console.error('Error loading companies:', err));
  }, [stageFilter]);

  const filteredOpportunities = opportunities.filter(opp => {
    const title = getOpportunityTitle(opp);
    const matchesSearch = search === '' || 
      title.toLowerCase().includes(search.toLowerCase()) ||
      opp.company.nameLegal.toLowerCase().includes(search.toLowerCase()) ||
      (opp.company.nameBrand && opp.company.nameBrand.toLowerCase().includes(search.toLowerCase()));

    return matchesSearch;
  });

  const stats = {
    total: opportunities.length,
    qualification: opportunities.filter(o => o.stage === 'qualification').length,
    proposal: opportunities.filter(o => o.stage === 'proposal').length,
    negotiation: opportunities.filter(o => o.stage === 'negotiation').length,
    closedWon: opportunities.filter(o => o.stage === 'closed_won').length,
  };

  const totalValue = opportunities.reduce((sum, opp) => {
    return sum + (opp.estimatedValue ? Number(opp.estimatedValue) : 0);
  }, 0);

  const getStageStyle = (stage: string) => {
    switch (stage) {
      case 'qualification': return { bg: 'rgb(139 92 246 / 0.2)', text: 'var(--clr-primary-a10)', border: 'var(--clr-primary-a0)' };
      case 'proposal': return { bg: 'rgb(59 130 246 / 0.2)', text: 'var(--clr-info-a10)', border: 'var(--clr-info-a0)' };
      case 'negotiation': return { bg: 'rgb(245 158 11 / 0.2)', text: 'var(--clr-warning-a10)', border: 'var(--clr-warning-a0)' };
      case 'closed_won': return { bg: 'rgb(34 197 94 / 0.2)', text: 'var(--clr-success-a10)', border: 'var(--clr-success-a0)' };
      case 'closed_lost': return { bg: 'rgb(239 68 68 / 0.2)', text: 'var(--clr-danger-a10)', border: 'var(--clr-danger-a0)' };
      default: return { bg: 'rgb(255 255 255 / 0.1)', text: 'rgb(255 255 255 / 0.6)', border: 'var(--clr-surface-a30)' };
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'A': return 'var(--clr-warning-a10)';
      case 'B': return 'var(--clr-info-a10)';
      case 'C': return 'rgb(255 255 255 / 0.6)';
      default: return 'rgb(255 255 255 / 0.5)';
    }
  };

  const formatCurrency = (value: number | null, currency: string = 'EUR') => {
    if (!value) return '—';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const stageLabels: Record<string, string> = {
    'qualification': 'Qualifizierung',
    'proposal': 'Angebot',
    'negotiation': 'Verhandlung',
    'closed_won': 'Gewonnen',
    'closed_lost': 'Verloren',
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--clr-surface-a0)' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--clr-surface-a30)', backgroundColor: 'var(--clr-surface-a10)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                Opportunities
              </h1>
              <p className="text-sm mt-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                Sales Pipeline · {filteredOpportunities.length} Opportunities
              </p>
            </div>
            <button 
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: 'var(--clr-info-a10)', color: 'var(--clr-light-a0)' }}
              onClick={() => setShowCreateModal(true)}
            >
              + Neue Opportunity
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
            <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Gesamt</div>
            <div className="text-3xl font-bold mt-1" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{stats.total}</div>
            <div className="text-xs mt-2" style={{ color: 'rgb(255 255 255 / 0.5)' }}>{formatCurrency(totalValue)}</div>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
            <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Qualifizierung</div>
            <div className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-primary-a10)' }}>{stats.qualification}</div>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
            <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Angebot</div>
            <div className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-info-a10)' }}>{stats.proposal}</div>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
            <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Verhandlung</div>
            <div className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-warning-a10)' }}>{stats.negotiation}</div>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
            <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Gewonnen</div>
            <div className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-success-a10)' }}>{stats.closedWon}</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Opportunity oder Firma suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: 'var(--clr-surface-a10)',
                border: '1px solid var(--clr-surface-a30)',
                color: 'rgb(255 255 255 / 0.9)'
              }}
            />
            <select 
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: 'var(--clr-surface-a10)',
                border: '1px solid var(--clr-surface-a30)',
                color: 'rgb(255 255 255 / 0.9)'
              }}
            >
              <option value="">Alle Stages</option>
              <option value="qualification">Qualifizierung</option>
              <option value="proposal">Angebot</option>
              <option value="negotiation">Verhandlung</option>
              <option value="closed_won">Gewonnen</option>
              <option value="closed_lost">Verloren</option>
            </select>
          </div>
          <div className="mt-3 text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
            {filteredOpportunities.length} von {opportunities.length} Opportunities
          </div>
        </div>

        {/* Opportunities Table */}
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--clr-surface-a30)', backgroundColor: 'var(--clr-surface-a10)' }}>
                <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Titel</th>
                <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Firma</th>
                <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Stage</th>
                <th className="text-right px-6 py-4 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Wert</th>
                <th className="text-right px-6 py-4 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Wahrscheinlichkeit</th>
                <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Close-Datum</th>
                <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Kontakt</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                      Lade Opportunities...
                    </div>
                  </td>
                </tr>
              ) : filteredOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                      Keine Opportunities gefunden
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOpportunities.map((opp) => {
                  const stageStyle = getStageStyle(opp.stage);
                  return (
                    <tr 
                      key={opp.id} 
                      className="transition-colors"
                      style={{ borderBottom: '1px solid var(--clr-surface-a30)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--clr-surface-a10)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="px-6 py-4">
                        <Link 
                          href={`/opportunities/${opp.id}`} 
                          className="font-medium hover:underline"
                          style={{ color: 'rgb(255 255 255 / 0.9)' }}
                        >
                          {getOpportunityTitle(opp)}
                        </Link>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                            {opp.company.nameBrand || opp.company.nameLegal}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/crm/${opp.company.id}`} 
                          className="text-sm hover:underline"
                          style={{ color: 'rgb(255 255 255 / 0.75)' }}
                        >
                          {opp.company.nameBrand || opp.company.nameLegal}
                        </Link>
                        {opp.company.tier && (
                          <span className="ml-2 text-xs font-bold" style={{ color: getTierColor(opp.company.tier) }}>
                            {opp.company.tier}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="inline-block px-2 py-1 rounded text-xs font-medium"
                          style={{ backgroundColor: stageStyle.bg, color: stageStyle.text, border: `1px solid ${stageStyle.border}` }}
                        >
                          {stageLabels[opp.stage] || opp.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-sm" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                        {formatCurrency(opp.estimatedValue ? Number(opp.estimatedValue) : null, opp.currency)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                        {opp.probability ? `${opp.probability}%` : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                        {formatDate(opp.expectedCloseDate)}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                        {opp.primaryContact ? `${opp.primaryContact.firstName} ${opp.primaryContact.lastName}` : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Create Opportunity Modal */}
      {showCreateModal && (
        <CreateOpportunityModal 
          companies={companies}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadOpportunities();
          }}
        />
      )}
    </div>
  );
}

function CreateOpportunityModal({ 
  companies, 
  onClose, 
  onCreated 
}: { 
  companies: Company[];
  onClose: () => void; 
  onCreated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyId: '',
    stage: 'qualification',
    estimatedValue: '',
    currency: 'EUR',
    expectedCloseDate: '',
    probability: '',
    offerType: '',
    projectType: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: formData.companyId,
          stage: formData.stage,
          estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
          currency: formData.currency,
          expectedCloseDate: formData.expectedCloseDate || null,
          probability: formData.probability ? parseInt(formData.probability) : null,
          offerType: formData.offerType || null,
          projectType: formData.projectType || null
        })
      });

      if (!res.ok) throw new Error('Failed to create opportunity');
      onCreated();
    } catch (error) {
      console.error('Error creating opportunity:', error);
      alert('Fehler beim Erstellen der Opportunity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div 
        className="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
            Neue Opportunity erstellen
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
                Firma *
              </label>
              <select
                required
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                className="w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--clr-surface-a10)',
                  border: '1px solid var(--clr-surface-a30)',
                  color: 'rgb(255 255 255 / 0.9)'
                }}
              >
                <option value="">Firma auswählen...</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name_brand || company.name_legal}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
                  Stage
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--clr-surface-a10)',
                    border: '1px solid var(--clr-surface-a30)',
                    color: 'rgb(255 255 255 / 0.9)'
                  }}
                >
                  <option value="qualification">Qualifizierung</option>
                  <option value="proposal">Angebot</option>
                  <option value="negotiation">Verhandlung</option>
                  <option value="closed_won">Gewonnen</option>
                  <option value="closed_lost">Verloren</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
                  Wahrscheinlichkeit (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--clr-surface-a10)',
                    border: '1px solid var(--clr-surface-a30)',
                    color: 'rgb(255 255 255 / 0.9)'
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
                  Geschätzter Wert
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--clr-surface-a10)',
                    border: '1px solid var(--clr-surface-a30)',
                    color: 'rgb(255 255 255 / 0.9)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
                  Währung
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--clr-surface-a10)',
                    border: '1px solid var(--clr-surface-a30)',
                    color: 'rgb(255 255 255 / 0.9)'
                  }}
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="CHF">CHF</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
                Erwartetes Abschlussdatum
              </label>
              <input
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                className="w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--clr-surface-a10)',
                  border: '1px solid var(--clr-surface-a30)',
                  color: 'rgb(255 255 255 / 0.9)'
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
                  Angebotstyp
                </label>
                <input
                  type="text"
                  value={formData.offerType}
                  onChange={(e) => setFormData({ ...formData, offerType: e.target.value })}
                  placeholder="z.B. Neubau, Sanierung"
                  className="w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--clr-surface-a10)',
                    border: '1px solid var(--clr-surface-a30)',
                    color: 'rgb(255 255 255 / 0.9)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
                  Projekttyp
                </label>
                <input
                  type="text"
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  placeholder="z.B. Wohnbau, Gewerbe"
                  className="w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--clr-surface-a10)',
                    border: '1px solid var(--clr-surface-a30)',
                    color: 'rgb(255 255 255 / 0.9)'
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--clr-surface-a30)',
                  color: 'rgb(255 255 255 / 0.7)'
                }}
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: loading ? 'var(--clr-surface-a30)' : 'var(--clr-info-a10)',
                  color: 'var(--clr-light-a0)',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Erstelle...' : 'Erstellen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
