'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      essential: true,
      analytics: true,
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
  };

  const acceptEssential = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      essential: true,
      analytics: false,
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
  };

  const saveSettings = (essential: boolean, analytics: boolean) => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      essential,
      analytics,
      timestamp: new Date().toISOString(),
    }));
    setShowSettings(false);
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      {/* Cookie Banner */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 p-4 shadow-2xl"
        style={{ 
          backgroundColor: 'var(--clr-surface-a0)',
          borderTop: '1px solid var(--clr-surface-a30)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          {!showSettings ? (
            // Main banner
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                  🍪 Cookie-Einstellungen
                </h3>
                <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.7)' }}>
                  Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Essentielle Cookies sind für die 
                  Funktionalität der Plattform erforderlich (Authentifizierung). Weitere Informationen finden 
                  Sie in unserer{' '}
                  <Link href="/privacy" className="underline" style={{ color: 'var(--clr-primary-a10)' }}>
                    Datenschutzerklärung
                  </Link>
                  .
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: 'var(--clr-surface-a10)',
                    color: 'rgb(255 255 255 / 0.9)',
                  }}
                >
                  Einstellungen
                </button>
                <button
                  onClick={acceptEssential}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: 'var(--clr-surface-a10)',
                    color: 'rgb(255 255 255 / 0.9)',
                  }}
                >
                  Nur Essentielle
                </button>
                <button
                  onClick={acceptAll}
                  className="px-6 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: 'linear-gradient(135deg, var(--clr-primary-a10), var(--clr-info-a10))',
                    color: 'var(--clr-light-a0)',
                  }}
                >
                  Alle akzeptieren
                </button>
              </div>
            </div>
          ) : (
            // Settings panel
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                Cookie-Einstellungen anpassen
              </h3>
              
              <div className="space-y-4 mb-6">
                {/* Essential Cookies */}
                <div 
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--clr-surface-a10)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                        Essentielle Cookies
                      </h4>
                      <p className="text-sm mt-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                        Erforderlich für die grundlegende Funktionalität der Website (Authentifizierung, Session-Management)
                      </p>
                    </div>
                    <div className="ml-4">
                      <span 
                        className="px-3 py-1 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: 'var(--clr-surface-a30)',
                          color: 'rgb(255 255 255 / 0.7)',
                        }}
                      >
                        Immer aktiv
                      </span>
                    </div>
                  </div>
                  <div className="text-xs mt-2" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                    <strong>Cookies:</strong> NextAuth Session Cookie
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div 
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--clr-surface-a10)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                        Analyse-Cookies
                      </h4>
                      <p className="text-sm mt-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                        Helfen uns zu verstehen, wie Sie die Website nutzen (derzeit nicht aktiv)
                      </p>
                    </div>
                    <div className="ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          disabled
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all opacity-50"></div>
                      </label>
                    </div>
                  </div>
                  <div className="text-xs mt-2" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                    <strong>Status:</strong> Derzeit nicht implementiert
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: 'var(--clr-surface-a10)',
                    color: 'rgb(255 255 255 / 0.9)',
                  }}
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => saveSettings(true, false)}
                  className="px-6 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: 'linear-gradient(135deg, var(--clr-primary-a10), var(--clr-info-a10))',
                    color: 'var(--clr-light-a0)',
                  }}
                >
                  Einstellungen speichern
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => {
          if (!showSettings) {
            acceptEssential();
          }
        }}
      />
    </>
  );
}
