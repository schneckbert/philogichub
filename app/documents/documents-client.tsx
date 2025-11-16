'use client';

import { useState } from 'react';

interface Document {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  type: string;
}

export default function DocumentsClient() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    // TODO: Implement actual file upload to backend
    // For now, just simulate upload
    setTimeout(() => {
      const newDocs: Document[] = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Current User',
        type: file.type || 'application/octet-stream'
      }));
      setDocuments(prev => [...newDocs, ...prev]);
      setUploading(false);
    }, 1000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Dokument wirklich löschen?')) {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('zip') || type.includes('compressed')) return '🗜️';
    return '📁';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--clr-surface-a0)' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--clr-surface-a30)', backgroundColor: 'var(--clr-surface-a10)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                Dokumente
              </h1>
              <p className="text-sm mt-1" style={{ color: 'rgb(255 255 255 / 0.6)' }}>
                Globaler Dokumentenaustausch · {documents.length} Dokumente
              </p>
            </div>
            <label 
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              style={{ 
                backgroundColor: uploading ? 'var(--clr-surface-a30)' : 'var(--clr-info-a10)', 
                color: 'var(--clr-light-a0)',
                opacity: uploading ? 0.6 : 1
              }}
            >
              {uploading ? 'Lade hoch...' : '+ Dokument hochladen'}
              <input 
                type="file" 
                multiple 
                className="hidden" 
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
            <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Gesamt</div>
            <div className="text-3xl font-bold mt-1" style={{ color: 'rgb(255 255 255 / 0.9)' }}>{documents.length}</div>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
            <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Gesamtgröße</div>
            <div className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-info-a10)' }}>
              {formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0))}
            </div>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
            <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Heute hochgeladen</div>
            <div className="text-3xl font-bold mt-1" style={{ color: 'var(--clr-success-a10)' }}>
              {documents.filter(doc => {
                const today = new Date().toDateString();
                return new Date(doc.uploadedAt).toDateString() === today;
              }).length}
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--clr-surface-a20)', border: '1px solid var(--clr-surface-a30)' }}>
          {documents.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-6xl mb-4">📁</div>
              <div className="text-lg font-medium mb-2" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                Keine Dokumente vorhanden
              </div>
              <div className="text-sm" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                Laden Sie Ihr erstes Dokument hoch, um loszulegen
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--clr-surface-a30)', backgroundColor: 'var(--clr-surface-a10)' }}>
                  <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Typ</th>
                  <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Name</th>
                  <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Größe</th>
                  <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Hochgeladen</th>
                  <th className="text-left px-6 py-4 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Von</th>
                  <th className="text-right px-6 py-4 text-sm font-medium" style={{ color: 'rgb(255 255 255 / 0.6)' }}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr 
                    key={doc.id} 
                    className="transition-colors"
                    style={{ borderBottom: '1px solid var(--clr-surface-a30)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--clr-surface-a10)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td className="px-6 py-4 text-2xl">
                      {getFileIcon(doc.type)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium" style={{ color: 'rgb(255 255 255 / 0.9)' }}>
                        {doc.name}
                      </div>
                      <div className="text-xs" style={{ color: 'rgb(255 255 255 / 0.5)' }}>
                        {doc.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                      {formatFileSize(doc.size)}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                      {formatDate(doc.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'rgb(255 255 255 / 0.75)' }}>
                      {doc.uploadedBy}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        className="text-sm font-medium hover:underline mr-4"
                        style={{ color: 'var(--clr-info-a10)' }}
                        onClick={() => alert('Download-Funktion wird implementiert')}
                      >
                        Download
                      </button>
                      <button 
                        className="text-sm font-medium hover:underline"
                        style={{ color: 'var(--clr-danger-a10)' }}
                        onClick={() => handleDelete(doc.id)}
                      >
                        Löschen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
