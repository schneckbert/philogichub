'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  AcademicCapIcon, 
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface AcademyContent {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: string;
  currentVersion: number;
  isProtected: boolean;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  versions: Array<{
    id: string;
    version: number;
    markdown: string;
    createdAt: string;
  }>;
  _count: {
    versions: number;
    reviews: number;
  };
}

export default function AcademyPage() {
  const [contents, setContents] = useState<AcademyContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedContent, setSelectedContent] = useState<AcademyContent | null>(null);

  useEffect(() => {
    fetchContents();
  }, [selectedCategory]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      params.append('status', 'published'); // Nur veröffentlichte Inhalte anzeigen
      
      const response = await fetch(`/api/academy/content?${params}`);
      if (response.ok) {
        const data = await response.json();
        setContents(data);
      }
    } catch (error) {
      console.error('Failed to fetch academy content:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContents = contents.filter(content =>
    content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    content.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ['all', ...Array.from(new Set(contents.map(c => c.category)))];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--clr-surface-a0)' }}>
      {/* Header */}
      <div 
        className="border-b"
        style={{ 
          borderColor: 'var(--clr-surface-a30)',
          backgroundColor: 'var(--clr-surface-a10)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--clr-primary-a10)' }}
              >
                <AcademicCapIcon className="w-7 h-7" style={{ color: 'var(--clr-light-a0)' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                  PhilogicAI-Academy
                </h1>
                <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                  Lerne alles über PhilogicAI und unsere Features
                </p>
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: 'rgb(255 255 255 / 0.4)' }}
              />
              <input
                type="text"
                placeholder="Suche nach Themen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: 'var(--clr-surface-a20)',
                  borderColor: 'var(--clr-surface-a30)',
                  color: 'rgb(255 255 255 / 0.9)',
                }}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: selectedCategory === category 
                      ? 'var(--clr-primary-a10)' 
                      : 'var(--clr-surface-a20)',
                    color: selectedCategory === category
                      ? 'var(--clr-light-a0)'
                      : 'rgb(255 255 255 / 0.7)',
                  }}
                >
                  {category === 'all' ? 'Alle' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" 
              style={{ borderColor: 'var(--clr-primary-a10)' }}
            />
            <p className="mt-4" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
              Lade Academy-Inhalte...
            </p>
          </div>
        ) : selectedContent ? (
          /* Detail-Ansicht */
          <div>
            <button
              onClick={() => setSelectedContent(null)}
              className="mb-6 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: 'var(--clr-surface-a20)',
                color: 'rgb(255 255 255 / 0.7)',
              }}
            >
              ← Zurück zur Übersicht
            </button>

            <div 
              className="rounded-lg border p-8"
              style={{
                backgroundColor: 'var(--clr-surface-a10)',
                borderColor: 'var(--clr-surface-a30)',
              }}
            >
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: 'var(--clr-primary-a10)',
                      color: 'var(--clr-light-a0)',
                    }}
                  >
                    {selectedContent.category}
                  </span>
                  {selectedContent.isProtected && (
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: 'var(--clr-warning-a10)',
                        color: 'var(--clr-light-a0)',
                      }}
                    >
                      Geschützt
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                  {selectedContent.title}
                </h2>
                <div className="flex items-center gap-4 text-sm" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {new Date(selectedContent.updatedAt).toLocaleDateString('de-DE')}
                  </span>
                  <span>v{selectedContent.currentVersion}</span>
                  <span>von {selectedContent.creator.name}</span>
                </div>
              </div>

              <div className="mt-8 prose prose-invert max-w-none">
                {selectedContent.versions.length > 0 && (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedContent.versions[0].markdown}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Grid-Ansicht */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <SparklesIcon 
                  className="w-16 h-16 mx-auto mb-4"
                  style={{ color: 'rgb(255 255 255 / 0.3)' }}
                />
                <p className="text-lg" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                  Keine Inhalte gefunden
                </p>
                <p className="text-sm mt-2" style={{ color: 'rgb(255 255 255 / 0.4)' }}>
                  Versuche einen anderen Suchbegriff oder eine andere Kategorie
                </p>
              </div>
            ) : (
              filteredContents.map((content) => (
                <div
                  key={content.id}
                  onClick={() => setSelectedContent(content)}
                  className="rounded-lg border p-6 cursor-pointer transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'var(--clr-surface-a10)',
                    borderColor: 'var(--clr-surface-a30)',
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: 'var(--clr-primary-a10)',
                        color: 'var(--clr-light-a0)',
                      }}
                    >
                      {content.category}
                    </span>
                    <CheckCircleIcon 
                      className="w-5 h-5"
                      style={{ color: 'var(--clr-success-a10)' }}
                    />
                  </div>

                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                    {content.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {new Date(content.updatedAt).toLocaleDateString('de-DE')}
                    </span>
                    <span>v{content.currentVersion}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between"
                    style={{ borderColor: 'var(--clr-surface-a30)' }}
                  >
                    <span className="text-xs" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                      {content._count.versions} Version(en)
                    </span>
                    <span 
                      className="text-xs font-medium"
                      style={{ color: 'var(--clr-primary-a10)' }}
                    >
                      Mehr erfahren →
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
