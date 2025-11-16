'use client';

import { useState, useEffect } from 'react';
import { Protected } from '@/components/Protected';

interface AcademyContent {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  author: {
    email: string;
    name: string | null;
  };
  createdAt: string;
  publishedAt: string | null;
  _count: {
    versions: number;
    reviews: number;
  };
}

export default function AcademyPage() {
  const [content, setContent] = useState<AcademyContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    try {
      const res = await fetch('/api/academy/content');
      if (!res.ok) throw new Error('Failed to load content');
      const data = await res.json();
      // Handle both array and object responses
      const contentArray = Array.isArray(data) ? data : data.content || [];
      setContent(contentArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading content');
    } finally {
      setLoading(false);
    }
  }

  async function reviewContent(contentId: string, action: 'approve' | 'reject') {
    const comment = prompt(
      action === 'approve'
        ? 'Optional approval comment:'
        : 'Reason for rejection (required):'
    );

    if (action === 'reject' && !comment) {
      alert('Rejection reason is required');
      return;
    }

    try {
      const res = await fetch(`/api/academy/content/${contentId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, comment }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit review');
      }

      await loadContent();
      alert(`Content ${action}ed successfully!`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error submitting review');
    }
  }

  const filteredContent = content.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  if (loading) {
    return <div className="text-center py-12">Loading content...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-12">Error: {error}</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Academy Content</h1>
        <p className="mt-2 text-gray-600">
          Manage and review knowledge contributions
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <span className="text-sm text-gray-600">
            {filteredContent.length} items
          </span>
        </div>

        <Protected permission="academy:create">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            + Create Content
          </button>
        </Protected>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No content found.
          </div>
        ) : (
          filteredContent.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow p-6 border-l-4"
              style={{
                borderLeftColor:
                  item.status === 'published'
                    ? '#10b981'
                    : item.status === 'pending_review'
                    ? '#f59e0b'
                    : item.status === 'approved'
                    ? '#3b82f6'
                    : '#6b7280',
              }}
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {item.title}
                </h3>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {item.category}
                  </span>
                  <span
                    className={`px-2 py-1 rounded font-semibold ${
                      item.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'pending_review'
                        ? 'bg-yellow-100 text-yellow-800'
                        : item.status === 'approved'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="mb-4 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Author:</span>
                  <span className="font-medium">
                    {item.author.name || item.author.email}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>Versions:</span>
                  <span className="font-medium">{item._count.versions}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>Reviews:</span>
                  <span className="font-medium">{item._count.reviews}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View Details
                </button>

                {item.status === 'pending_review' && (
                  <Protected permission="academy:review">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => reviewContent(item.id, 'approve')}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => reviewContent(item.id, 'reject')}
                        className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </Protected>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
