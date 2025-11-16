import { notFound } from 'next/navigation';
import AgentDetailClient from './agent-detail-client';

async function getAgent(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/agents/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch agent');
  }

  return response.json();
}

export default async function AgentDetailPage({ params }: { params: { id: string } }) {
  const agent = await getAgent(params.id);

  return <AgentDetailClient agent={agent} />;
}
