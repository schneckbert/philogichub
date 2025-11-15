export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg" />
              <h1 className="text-xl font-semibold">Philogic-Hub</h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-300">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Control Center v0.1
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
            Die Zentrale, in der deine Firma{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              von allein läuft
            </span>
            .
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Philogic-Hub bündelt Datenströme, Tools und Agenten an einem Ort. Von hier aus
            steuerst du Flows, Reports und Automationen – und baust echte Business-Intelligenz auf.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 transition-all hover:scale-105">
              Dashboard öffnen
            </button>
            <button className="rounded-lg border border-slate-700 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800/80 transition-all">
              Agenten-Modus · Beta
            </button>
          </div>
        </div>
      </section>

      {/* Dashboard Cards Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Agenten */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 hover:border-emerald-500/50 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xl">
                🤖
              </div>
              <h3 className="text-lg font-semibold">Agenten</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Starte, überwache und verwalte deine Automations-Agenten zentral.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block h-2 w-2 rounded-full bg-slate-600" />
              Bald verfügbar
            </div>
          </div>

          {/* Card 2: Datenquellen */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 hover:border-cyan-500/50 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xl">
                📊
              </div>
              <h3 className="text-lg font-semibold">Datenquellen</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Verbinde Postgres, APIs und externe Systeme für zentrale Business-Intelligence.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block h-2 w-2 rounded-full bg-slate-600" />
              In Planung
            </div>
          </div>

          {/* Card 3: Quick Actions */}
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 hover:border-purple-500/50 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 text-xl">
                ⚡
              </div>
              <h3 className="text-lg font-semibold">Quick Actions</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Führe häufige Workflows per Knopfdruck aus: Reports, Exports, Alerts.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block h-2 w-2 rounded-full bg-slate-600" />
              Roadmap
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-slate-500">
          <p>
            Philogic-Hub v0.1 · Built with Next.js · Deployed on Vercel
          </p>
          <p className="mt-2">
            <a
              href="https://github.com/schneckbert/philogichub"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
