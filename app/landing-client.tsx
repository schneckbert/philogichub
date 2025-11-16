'use client';

import Link from 'next/link';
import { 
  SparklesIcon, 
  ChartBarIcon, 
  BuildingOffice2Icon,
  CpuChipIcon,
  ShieldCheckIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

export default function LandingClient() {
  const features = [
    {
      name: 'PhilogicAI',
      description: 'KI-gestützte Assistenz powered by llama.cpp für CRM-Analysen, E-Mails und Reports.',
      icon: SparklesIcon,
    },
    {
      name: 'CRM & Pipeline',
      description: 'Vollständiges Customer Relationship Management mit Opportunities und Deal-Tracking.',
      icon: BuildingOffice2Icon,
    },
    {
      name: 'Analytics',
      description: 'Echtzeit-Dashboards, Win-Rate-Analysen und Pipeline-Visualisierung.',
      icon: ChartBarIcon,
    },
    {
      name: 'Automation Agents',
      description: 'Automatisiere Workflows mit konfigurierbaren Agenten für wiederkehrende Tasks.',
      icon: CpuChipIcon,
    },
    {
      name: 'Enterprise Security',
      description: 'RBAC, Audit Logs, verschlüsselte API Keys und DSGVO-konforme Datenhaltung.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Schnell & Modern',
      description: 'Next.js 16, Turbopack, Tailwind CSS – modernste Technologie für beste Performance.',
      icon: BoltIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header/Navigation */}
      <header className="border-b" style={{ borderColor: 'var(--clr-surface-a30)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">
                Philogic<span style={{ color: 'var(--clr-primary-a10)' }}>Hub</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="text-sm"
                style={{ color: 'rgb(255 255 255 / 0.6)' }}
              >
                Datenschutz
              </Link>
              <Link
                href="/terms"
                className="text-sm"
                style={{ color: 'rgb(255 255 255 / 0.6)' }}
              >
                AGB
              </Link>
              <Link
                href="/auth/signin"
                className="px-6 py-2 rounded-lg font-medium transition-all"
                style={{
                  background: 'linear-gradient(135deg, var(--clr-primary-a10), var(--clr-info-a10))',
                  color: 'var(--clr-light-a0)',
                }}
              >
                Zum Portal
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h2 
            className="text-5xl font-bold mb-6"
            style={{ color: 'rgb(255 255 255 / 0.95)' }}
          >
            Die Zentrale deiner Firma
          </h2>
          <p 
            className="text-xl mb-8 max-w-3xl mx-auto"
            style={{ color: 'rgb(255 255 255 / 0.7)' }}
          >
            Steuerzentrale für echte Business-Intelligenz. CRM, AI-Assistenz, Analytics und Automation – alles in einer Plattform.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/auth/signin"
              className="px-8 py-4 rounded-lg font-medium text-lg transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--clr-primary-a10), var(--clr-info-a10))',
                color: 'var(--clr-light-a0)',
              }}
            >
              Jetzt starten
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
        style={{ 
          backgroundColor: 'var(--clr-surface-a0)',
          borderTop: '1px solid var(--clr-surface-a30)',
          borderBottom: '1px solid var(--clr-surface-a30)',
        }}
      >
        <div className="text-center mb-16">
          <h3 
            className="text-3xl font-bold mb-4"
            style={{ color: 'rgb(255 255 255 / 0.95)' }}
          >
            Features
          </h3>
          <p style={{ color: 'rgb(255 255 255 / 0.6)' }}>
            Alles was du für modernes Business Management brauchst
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="p-6 rounded-lg"
              style={{ backgroundColor: 'var(--clr-surface-a10)' }}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, var(--clr-primary-a10), var(--clr-info-a10))' }}
              >
                <feature.icon className="w-6 h-6" style={{ color: 'var(--clr-light-a0)' }} />
              </div>
              <h4 
                className="text-lg font-semibold mb-2"
                style={{ color: 'rgb(255 255 255 / 0.9)' }}
              >
                {feature.name}
              </h4>
              <p style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div 
          className="rounded-2xl p-12 text-center"
          style={{ 
            background: 'linear-gradient(135deg, var(--clr-primary-a10), var(--clr-info-a10))'
          }}
        >
          <h3 className="text-3xl font-bold mb-4" style={{ color: 'var(--clr-light-a0)' }}>
            Bereit loszulegen?
          </h3>
          <p className="text-lg mb-8" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            Melde dich jetzt an und erlebe die Zukunft des Business Managements.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block px-8 py-4 rounded-lg font-medium text-lg transition-all bg-white"
            style={{ color: 'var(--clr-dark-a0)' }}
          >
            Zum Login
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="border-t"
        style={{ borderColor: 'var(--clr-surface-a30)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-4">
                Philogic<span style={{ color: 'var(--clr-primary-a10)' }}>Hub</span>
              </h4>
              <p style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                Die Zentrale deiner Firma
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                Rechtliches
              </h5>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                    Datenschutzerklärung
                  </Link>
                </li>
                <li>
                  <Link href="/terms" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                    AGB
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                Portal
              </h5>
              <ul className="space-y-2">
                <li>
                  <Link href="/auth/signin" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                    Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8" style={{ borderColor: 'var(--clr-surface-a30)' }}>
            <p className="text-center text-sm" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
              © {new Date().getFullYear()} PhilogicHub. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
