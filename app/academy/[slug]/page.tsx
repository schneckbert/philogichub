'use client';

import { useState, useEffect, use } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  AcademicCapIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

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
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AcademyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [content, setContent] = useState<AcademyContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [slug]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/academy/content?slug=${slug}&status=published`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setContent(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !content) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const context = `Du bist ein hilfreicher Assistent für die PhilogicAI-Academy.
      
Aktueller Artikel: "${content.title}"
Kategorie: ${content.category}

Artikelinhalt:
${content.versions[0]?.markdown || ''}

Beantworte die Frage des Nutzers basierend auf dem Artikelinhalt. Sei präzise und hilfreich.`;

      const response = await fetch('/api/philogic-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: context },
            ...chatMessages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: chatInput },
          ],
        }),
      });

      if (!response.ok) throw new Error('Chat failed');

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.choices[0].message.content,
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Entschuldigung, ich konnte deine Frage nicht beantworten. Bitte versuche es später erneut.',
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--clr-surface-a0)' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" 
            style={{ borderColor: 'var(--clr-primary-a10)' }}
          />
          <p className="mt-4" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Lade Inhalt...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--clr-surface-a0)' }}>
        <div className="text-center">
          <AcademicCapIcon className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgb(255 255 255 / 0.3)' }} />
          <p className="text-lg" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Inhalt nicht gefunden</p>
          <Link href="/academy" className="mt-4 inline-block text-sm" style={{ color: 'var(--clr-primary-a10)' }}>
            ← Zurück zur Academy
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--clr-surface-a0)' }}>
      {/* Header */}
      <div 
        className="border-b sticky top-0 z-10"
        style={{ 
          borderColor: 'var(--clr-surface-a30)',
          backgroundColor: 'var(--clr-surface-a10)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/academy"
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-opacity-80"
              style={{ color: 'rgb(255 255 255 / 0.7)' }}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="text-sm">Zurück</span>
            </Link>

            <button
              onClick={() => setShowChat(!showChat)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: showChat ? 'var(--clr-primary-a10)' : 'var(--clr-surface-a20)',
                color: showChat ? 'var(--clr-light-a0)' : 'rgb(255 255 255 / 0.7)',
              }}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span className="text-sm font-medium">AI-Assistent</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className={showChat ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <div 
              className="rounded-lg border p-8"
              style={{
                backgroundColor: 'var(--clr-surface-a10)',
                borderColor: 'var(--clr-surface-a30)',
              }}
            >
              {/* Meta */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: 'var(--clr-primary-a10)',
                      color: 'var(--clr-light-a0)',
                    }}
                  >
                    {content.category}
                  </span>
                  <span className="text-xs" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                    Version {content.currentVersion}
                  </span>
                </div>

                <h1 className="text-4xl font-bold mb-4" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                  {content.title}
                </h1>

                <div className="flex items-center gap-4 text-sm" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {new Date(content.updatedAt).toLocaleDateString('de-DE')}
                  </span>
                  <span>•</span>
                  <span>von {content.creator.name}</span>
                </div>
              </div>

              {/* Markdown Content */}
              <div 
                className="mt-8 prose prose-invert prose-lg max-w-none"
                style={{
                  '--tw-prose-body': 'rgb(255 255 255 / 0.8)',
                  '--tw-prose-headings': 'rgb(255 255 255 / 0.9)',
                  '--tw-prose-links': 'var(--clr-primary-a10)',
                  '--tw-prose-code': 'var(--clr-primary-a10)',
                  '--tw-prose-pre-bg': 'var(--clr-surface-a20)',
                } as any}
              >
                {content.versions.length > 0 && (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content.versions[0].markdown}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          </div>

          {/* AI Chat Sidebar */}
          {showChat && (
            <div className="lg:col-span-1">
              <div 
                className="rounded-lg border p-4 sticky top-24"
                style={{
                  backgroundColor: 'var(--clr-surface-a10)',
                  borderColor: 'var(--clr-surface-a30)',
                  maxHeight: 'calc(100vh - 8rem)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Chat Header */}
                <div className="flex items-center gap-2 mb-4 pb-4 border-b"
                  style={{ borderColor: 'var(--clr-surface-a30)' }}
                >
                  <SparklesIcon className="w-5 h-5" style={{ color: 'var(--clr-primary-a10)' }} />
                  <h3 className="font-semibold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                    AI-Assistent
                  </h3>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                        Stelle eine Frage zu diesem Artikel!
                      </p>
                    </div>
                  )}

                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${msg.role === 'user' ? 'ml-4' : 'mr-4'}`}
                      style={{
                        backgroundColor: msg.role === 'user' 
                          ? 'var(--clr-primary-a10)' 
                          : 'var(--clr-surface-a20)',
                      }}
                    >
                      <p className="text-sm" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                        {msg.content}
                      </p>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: 'var(--clr-surface-a20)' }}>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--clr-primary-a10)' }} />
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--clr-primary-a10)', animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--clr-primary-a10)', animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Frage stellen..."
                    className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--clr-surface-a20)',
                      borderColor: 'var(--clr-surface-a30)',
                      color: 'rgb(255 255 255 / 0.9)',
                    }}
                    disabled={chatLoading}
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={chatLoading || !chatInput.trim()}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--clr-primary-a10)',
                      color: 'var(--clr-light-a0)',
                    }}
                  >
                    Senden
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
