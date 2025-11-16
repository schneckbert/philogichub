import { notFound } from 'next/navigation';
import OpportunityDetailClient from './opportunity-detail-client';

async function getOpportunity(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/opportunities/${id}`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch opportunity');
  }
  
  return res.json();
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = await getOpportunity(id);
  
  return <OpportunityDetailClient opportunity={opportunity} />;
}
