'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Company {
  id: string;
  nameLegal: string;
  nameBrand: string | null;
  wzCode: string | null;
  statusSales: string;
  tier: string | null;
  hqLocation: {
    city: string | null;
  } | null;
  _count: {
    contacts: number;
    opportunities: number;
  };
}

// Transform snake_case API response to camelCase
function transformCompany(raw: any): Company {
  return {
    id: raw.id,
    nameLegal: raw.name_legal,
    nameBrand: raw.name_brand,
    wzCode: raw.wz_code,
    statusSales: raw.status_sales,
    tier: raw.tier,
    hqLocation: raw.company_location_company_hq_location_idTocompany_location ? {
      city: raw.company_location_company_hq_location_idTocompany_location.city
    } : null,
    _count: {
      contacts: raw._count.contact || 0,
      opportunities: raw._count.opportunity || 0
    }
  };
}

export default function CompaniesClient() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadCompanies = async () => {
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCompanies(data.map(transformCompany));
      } else {
        console.error('Invalid data format:', data);
        setCompanies([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading companies:', err);
      setCompanies([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = search === '' || 
      company.nameLegal.toLowerCase().includes(search.toLowerCase()) ||
      (company.nameBrand && company.nameBrand.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === '' || company.statusSales === statusFilter;
    const matchesTier = tierFilter === '' || company.tier === tierFilter;

    return matchesSearch && matchesStatus && matchesTier;
  });

  const stats = {
    total: companies.length,
    customers: companies.filter(c => c.statusSales === 'customer').length,
    prospects: companies.filter(c => c.statusSales === 'prospect').length,
    tierA: companies.filter(c => c.tier === 'A').length,
  };

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--clr-surface-a0)' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--clr-surface-a30)', backgroundColor: 'var(--clr-surface-a10)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                CRM · Baufirmen
              </h1>
              <p className="text-sm mt-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                Alle Companies aus dem Bau-CRM
              </p>
            </div>
            <button 
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: 'var(--clr-info-a10)', color: 'var(--clr-light-a0)' }}
              onClick={() => setShowCreateModal(true)}
            >
              + Neue Firma
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
            <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Gesamt</div>
            <div className="text-3xl font-bold mt-1" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{stats.total}</div>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
            <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Kunden</div>
            <div className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-success-a10)' }}>{stats.customers}</div>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
            <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Prospects</div>
            <div className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-info-a10)' }}>{stats.prospects}</div>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
            <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Tier A</div>
            <div className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-warning-a10)' }}>{stats.tierA}</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Firma suchen..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: 'var(--clr-surface-a10)',
                border: '1px solid var(--clr-surface-a30)',
                color: 'rgb(255 255 255 / 0.9)'
              }}
            >
              <option value="">Alle Status</option>
              <option value="customer">Kunde</option>
              <option value="prospect">Prospect</option>
              <option value="lead">Lead</option>
            </select>
            <select 
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: 'var(--clr-surface-a10)',
                border: '1px solid var(--clr-surface-a30)',
                color: 'rgb(255 255 255 / 0.9)'
              }}
            >
              <option value="">Alle Tiers</option>
              <option value="A">Tier A</option>
              <option value="B">Tier B</option>
              <option value="C">Tier C</option>
            </select>
          </div>
          <div className="mt-3 text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
            {filteredCompanies.length} von {companies.length} Firmen
          </div>
        </div>

        {/* Companies Table */}
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--clr-surface-a30)', backgroundColor: 'var(--clr-surface-a10)' }}>
                <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Firma</th>
                <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>WZ-Code</th>
                <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Tier</th>
                <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Standort</th>
                <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Kontakte</th>
                <th className="text-right px-6 py-4 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                      Lade Companies...
                    </div>
                  </td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                      Keine Companies gefunden
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => {
                  const statusStyle = getStatusStyle(company.statusSales);
                  return (
                    <tr 
                      key={company.id} 
                      className="transition-colors"
                      style={{ borderBottom: '1px solid var(--clr-surface-a30)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--clr-surface-a10)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="px-6 py-4">
                        <Link 
                          href={`/crm/${company.id}`} 
                          className="font-medium hover:underline"
                          style={{ color: 'rgb(255 255 255 / 0.9)' }}
                        >
                          {company.nameLegal}
                        </Link>
                        {company.nameBrand && (
                          <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>{company.nameBrand}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                        {company.wzCode || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="inline-block px-2 py-1 rounded text-xs font-medium"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}
                        >
                          {company.statusSales}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold" style={{ color: getTierColor(company.tier) }}>
                          {company.tier || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                        {company.hqLocation?.city || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                        {company._count.contacts} Kontakte
                        <div className="text-xs" style={{ color: 'rgb(255 255 255 / 0.5)' }}>{company._count.opportunities} Opps</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/crm/${company.id}`}
                          className="text-sm font-medium hover:underline"
                          style={{ color: 'var(--clr-info-a10)' }}
                        >
                          Details →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Create Company Modal */}
      {showCreateModal && (
        <CreateCompanyModal 
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadCompanies();
          }}
        />
      )}
    </div>
  );
}

function CreateCompanyModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameLegal: '',
    nameBrand: '',
    wzCode: '',
    statusSales: 'prospect',
    tier: '',
    notesProfile: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to create company');
      onCreated();
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Fehler beim Erstellen der Firma');
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
            Neue Firma erstellen
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
                Rechtlicher Name *
              </label>
              <input
                type="text"
                required
                value={formData.nameLegal}
                onChange={(e) => setFormData({ ...formData, nameLegal: e.target.value })}
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
                Markenname
              </label>
              <input
                type="text"
                value={formData.nameBrand}
                onChange={(e) => setFormData({ ...formData, nameBrand: e.target.value })}
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
                  WZ-Code
                </label>
                <input
                  type="text"
                  value={formData.wzCode}
                  onChange={(e) => setFormData({ ...formData, wzCode: e.target.value })}
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
                  Tier
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--clr-surface-a10)',
                    border: '1px solid var(--clr-surface-a30)',
                    color: 'rgb(255 255 255 / 0.9)'
                  }}
                >
                  <option value="">Kein Tier</option>
                  <option value="A">Tier A</option>
                  <option value="B">Tier B</option>
                  <option value="C">Tier C</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
                Status
              </label>
              <select
                value={formData.statusSales}
                onChange={(e) => setFormData({ ...formData, statusSales: e.target.value })}
                className="w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--clr-surface-a10)',
                  border: '1px solid var(--clr-surface-a30)',
                  color: 'rgb(255 255 255 / 0.9)'
                }}
              >
                <option value="prospect">Prospect</option>
                <option value="lead">Lead</option>
                <option value="customer">Kunde</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
                Notizen
              </label>
              <textarea
                value={formData.notesProfile}
                onChange={(e) => setFormData({ ...formData, notesProfile: e.target.value })}
                rows={3}
                className="w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--clr-surface-a10)',
                  border: '1px solid var(--clr-surface-a30)',
                  color: 'rgb(255 255 255 / 0.9)'
                }}
              />
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
