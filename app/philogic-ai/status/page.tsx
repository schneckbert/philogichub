"use client";

import React from 'react';

type Health = {
  status?: string;
  ollama?: string;
  model_loaded?: boolean;
  timestamp?: string;
  error?: string;
};

export default function PhilogicStatusPage() {
  const [health, setHealth] = React.useState<Health | null>(null);
  const [models, setModels] = React.useState<{ name: string }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const [hRes, mRes] = await Promise.all([
          fetch('/api/philogic-ai/health', { cache: 'no-store' }),
          fetch('/api/philogic-ai/models', { cache: 'no-store' }),
        ]);

        if (!hRes.ok) {
          const text = await hRes.text();
          throw new Error(`Health failed: ${text}`);
        }
        const h = (await hRes.json()) as Health;

        let modelList: { name: string }[] = [];
        if (mRes.ok) {
          const m = (await mRes.json()) as { models?: { name: string }[] };
          modelList = m.models || [];
        }

        if (!cancelled) {
          setHealth(h);
          setModels(modelList);
        }
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">PhilogicAI Status</h1>

      {loading && <div className="text-gray-500">Prüfe Status…</div>}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {health && (
        <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex h-3 w-3 rounded-full ${health.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="font-medium">{health.status || 'unknown'}</span>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            {health.ollama && (
              <div>
                <span className="font-medium">Ollama:</span> {health.ollama}
              </div>
            )}
            {typeof health.model_loaded === 'boolean' && (
              <div>
                <span className="font-medium">Model loaded:</span> {health.model_loaded ? 'yes' : 'no'}
              </div>
            )}
            {health.timestamp && (
              <div>
                <span className="font-medium">Zeitstempel:</span> {new Date(health.timestamp).toLocaleString()}
              </div>
            )}
            {health.error && (
              <div className="text-red-600">
                <span className="font-medium">Fehler:</span> {health.error}
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">Verfügbare Modelle</h2>
        {models.length === 0 ? (
          <div className="text-gray-500">Keine Modelle gefunden.</div>
        ) : (
          <ul className="list-disc list-inside text-gray-800">
            {models.map((m) => (
              <li key={m.name}>{m.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
