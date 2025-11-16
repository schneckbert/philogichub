'use client';

import Link from 'next/link';

export default function TermsPage() {
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
          Allgemeine Geschäftsbedingungen (AGB)
        </h1>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              1. Geltungsbereich
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der PhilogicHub-Plattform 
              (nachfolgend "Dienst" genannt). Mit der Registrierung und Nutzung des Dienstes erklären Sie 
              sich mit diesen AGB einverstanden.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              2. Leistungsbeschreibung
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              PhilogicHub bietet eine integrierte Business-Management-Plattform mit folgenden Kernfunktionen:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              <li><strong>CRM-System:</strong> Verwaltung von Firmen, Kontakten und Opportunities</li>
              <li><strong>AI-Assistenz:</strong> KI-gestützte Unterstützung für CRM-Analysen und E-Mails</li>
              <li><strong>Analytics:</strong> Echtzeit-Dashboards und Visualisierungen</li>
              <li><strong>Automation:</strong> Konfigurierbare Agenten für Workflow-Automatisierung</li>
              <li><strong>Dokumentenverwaltung:</strong> Zentrale Speicherung und Verwaltung von Dateien</li>
              <li><strong>Admin-Tools:</strong> Benutzerverwaltung, Rollen, Audit Logs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              3. Registrierung und Nutzerkonto
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Zur Nutzung des Dienstes ist eine Registrierung erforderlich. Sie verpflichten sich:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              <li>Wahrheitsgemäße und vollständige Angaben zu machen</li>
              <li>Ihre Zugangsdaten vertraulich zu behandeln</li>
              <li>Unbefugte Zugriffe auf Ihr Konto unverzüglich zu melden</li>
              <li>Ihr Konto nicht an Dritte weiterzugeben</li>
            </ul>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }} className="mt-4">
              Wir behalten uns das Recht vor, Registrierungen ohne Angabe von Gründen abzulehnen oder 
              Konten zu sperren, die gegen diese AGB verstoßen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              4. Nutzungsrechte und Pflichten
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Sie erhalten ein nicht-exklusives, nicht-übertragbares Nutzungsrecht für die Dauer der 
              Vertragsbeziehung. Sie verpflichten sich:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              <li>Den Dienst nur für rechtmäßige Zwecke zu nutzen</li>
              <li>Keine rechtswidrigen, beleidigenden oder schädlichen Inhalte hochzuladen</li>
              <li>Keine automatisierten Zugriffe (Bots, Scraper) ohne Genehmigung durchzuführen</li>
              <li>Die Sicherheit und Funktionalität des Dienstes nicht zu gefährden</li>
              <li>Keine Reverse-Engineering-Maßnahmen durchzuführen</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              5. Verfügbarkeit und Wartung
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Wir bemühen uns um eine hohe Verfügbarkeit des Dienstes, übernehmen jedoch keine Garantie 
              für eine ununterbrochene Erreichbarkeit. Geplante Wartungsarbeiten werden nach Möglichkeit 
              angekündigt. Im Falle von Störungen bemühen wir uns um eine schnellstmögliche Behebung.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              6. Datenschutz
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Die Verarbeitung Ihrer personenbezogenen Daten erfolgt gemäß unserer{' '}
              <Link href="/privacy" className="underline" style={{ color: 'var(--clr-primary-a10)' }}>
                Datenschutzerklärung
              </Link>
              . Durch die Nutzung des Dienstes stimmen Sie dieser zu.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              7. Geistiges Eigentum
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Alle Rechte an der PhilogicHub-Plattform, einschließlich Design, Code, Marken und Inhalten, 
              liegen bei PhilogicHub. Die von Ihnen hochgeladenen Inhalte bleiben Ihr Eigentum. Sie gewähren 
              uns jedoch das Recht, diese Inhalte zur Erbringung des Dienstes zu nutzen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              8. Haftung
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Wir haften für Schäden, die durch vorsätzliches oder grob fahrlässiges Verhalten unsererseits 
              verursacht werden. Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen, sofern nicht 
              wesentliche Vertragspflichten verletzt werden.
            </p>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }} className="mt-4">
              <strong>Insbesondere übernehmen wir keine Haftung für:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              <li>Datenverluste aufgrund unzureichender Backups seitens des Nutzers</li>
              <li>Schäden durch unbefugten Zugriff Dritter</li>
              <li>Inhalte und Handlungen anderer Nutzer</li>
              <li>Technische Störungen außerhalb unseres Einflussbereichs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              9. Kündigung
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Beide Parteien können das Vertragsverhältnis jederzeit mit einer Frist von 30 Tagen kündigen. 
              Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
            </p>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }} className="mt-4">
              Nach Beendigung des Vertrags werden Ihre Daten gemäß unserer Datenschutzerklärung gelöscht. 
              Sie sind selbst dafür verantwortlich, Ihre Daten vor der Kündigung zu sichern.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              10. Änderungen der AGB
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Wir behalten uns das Recht vor, diese AGB zu ändern. Änderungen werden Ihnen per E-Mail 
              mitgeteilt und gelten als genehmigt, wenn Sie nicht innerhalb von 30 Tagen widersprechen. 
              Im Falle eines Widerspruchs endet das Vertragsverhältnis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              11. Salvatorische Klausel
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit 
              der übrigen Bestimmungen hiervon unberührt. Die unwirksame Bestimmung wird durch eine wirksame 
              Regelung ersetzt, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              12. Anwendbares Recht und Gerichtsstand
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. 
              Ausschließlicher Gerichtsstand für alle Streitigkeiten ist, soweit gesetzlich zulässig, 
              der Sitz von PhilogicHub.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
              13. Kontakt
            </h2>
            <p style={{ color: 'rgb(255 255 255 / 0.7)' }}>
              Bei Fragen zu diesen AGB können Sie uns unter folgender Adresse erreichen:<br />
              <strong>E-Mail:</strong> legal@philogic.de
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
