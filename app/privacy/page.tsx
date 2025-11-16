'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--clr-surface-a30)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold">
                Philogic<span style={{ color: 'var(--clr-primary-a10)' }}>Hub</span>
              </h1>
            </Link>
            <Link
              href="/auth/signin"
              className="text-sm"
              style={{ color: 'rgb(255 255 255 / 0.6)' }}
            >
              Zum Login
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold mb-8" style={{ color: 'rgb(255 255 255 / 0.95)' }}>
          Datenschutzerklärung
        </h1>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              1. Verantwortlicher
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br />
              PhilogicHub<br />
              E-Mail: privacy@philogic.de
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              2. Erhebung und Speicherung personenbezogener Daten
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Wir erheben und verarbeiten folgende personenbezogene Daten:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              <li>
                <strong>Benutzerkonto-Daten:</strong> Name, E-Mail-Adresse, verschlüsseltes Passwort
              </li>
              <li>
                <strong>CRM-Daten:</strong> Firmeninformationen, Kontaktdaten, Opportunities, Notizen
              </li>
              <li>
                <strong>Session-Daten:</strong> Authentifizierungs-Token (JWT) für die Anmeldung
              </li>
              <li>
                <strong>Audit-Logs:</strong> Zeitstempel und Benutzer-IDs für sicherheitsrelevante Aktionen
              </li>
              <li>
                <strong>Dokumente:</strong> Von Ihnen hochgeladene Dateien und Dokumente
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              3. Zweck der Datenverarbeitung
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Die Verarbeitung Ihrer personenbezogenen Daten erfolgt zu folgenden Zwecken:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              <li>Bereitstellung und Verwaltung Ihres Benutzerkontos</li>
              <li>Authentifizierung und Autorisierung mittels NextAuth.js</li>
              <li>Speicherung und Verwaltung Ihrer CRM-Daten in der Prisma-Datenbank</li>
              <li>Bereitstellung der AI-Assistenz-Funktionen (llama.cpp - lokal, keine externe Weitergabe)</li>
              <li>Sicherheitsüberwachung und Audit-Logging</li>
              <li>Optimierung und Verbesserung unserer Dienste</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              4. Rechtsgrundlage
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) 
              sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Bereitstellung einer sicheren Plattform).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              5. Cookies und lokale Speicherung
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Unsere Website verwendet folgende Cookies und lokale Speichertechnologien:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              <li>
                <strong>Session-Cookie (NextAuth):</strong> Essentiell für die Authentifizierung, 
                Ablauf nach Session-Ende
              </li>
              <li>
                <strong>Cookie-Consent (localStorage):</strong> Speichert Ihre Cookie-Einstellungen
              </li>
            </ul>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }} className="mt-4">
              Sie können Cookies in Ihren Browser-Einstellungen deaktivieren. Dies kann jedoch die 
              Funktionalität der Website einschränken.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              6. Weitergabe von Daten
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Wir geben Ihre Daten nicht an Dritte weiter, außer:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              <li>Es besteht eine gesetzliche Verpflichtung</li>
              <li>Sie haben ausdrücklich eingewilligt</li>
              <li>Die Weitergabe ist zur Vertragserfüllung erforderlich</li>
            </ul>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }} className="mt-4">
              <strong>Wichtig:</strong> Unsere KI-Assistenz (llama.cpp) läuft lokal auf unseren Servern. 
              Ihre Daten werden nicht an externe KI-Dienste übertragen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              7. Speicherdauer
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Ihre Daten werden gespeichert, solange Ihr Benutzerkonto aktiv ist. Nach Löschung Ihres 
              Kontos werden Ihre Daten innerhalb von 30 Tagen vollständig entfernt, sofern keine 
              gesetzlichen Aufbewahrungspflichten bestehen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              8. Ihre Rechte
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
              <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
              <li>Recht auf Löschung (Art. 17 DSGVO)</li>
              <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
              <li>Beschwerderecht bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
            </ul>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }} className="mt-4">
              Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter: <strong>privacy@philogic.de</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              9. Datensicherheit
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre Daten zu schützen:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              <li>Verschlüsselte Passwort-Speicherung (bcrypt)</li>
              <li>HTTPS-Verschlüsselung für alle Datenübertragungen</li>
              <li>Rollenbasierte Zugriffskontrolle (RBAC)</li>
              <li>Verschlüsselte Speicherung sensibler API-Keys (AES-256-GCM)</li>
              <li>Audit-Logs für sicherheitsrelevante Aktionen</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              10. Technologie-Stack
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Unsere Plattform nutzt folgende Technologien:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              <li><strong>Next.js 16:</strong> Web-Framework</li>
              <li><strong>Prisma 6.19.0:</strong> Datenbank-ORM für sichere Datenverwaltung</li>
              <li><strong>NextAuth.js:</strong> Authentifizierungslösung mit JWT-Tokens</li>
              <li><strong>llama.cpp:</strong> Lokale KI-Verarbeitung (keine Cloud-Dienste)</li>
              <li><strong>PostgreSQL:</strong> Relationale Datenbank für strukturierte Daten</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              11. Änderungen dieser Datenschutzerklärung
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte 
              Rechtslagen oder Änderungen unserer Dienste anzupassen. Die aktuelle Version finden 
              Sie stets auf dieser Seite.
            </p>
          </section>

          <section>
            <p style={{ color: 'rgb(255 255 255 / 0.6)' }} className="text-sm mt-12">
              Stand: {new Date().toLocaleDateString('de-DE')}
            </p>
          </section>
        </div>

        <div className="mt-12">
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: 'var(--clr-surface-a10)',
              color: 'rgb(255 255 255 / 0.9)',
            }}
          >
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
