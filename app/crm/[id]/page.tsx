import { notFound } from 'next/navigation';
import CompanyDetailClient from './company-detail-client';

async function getCompany(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/companies/${id}`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch company');
  }
  
  return res.json();
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await getCompany(id);
  
  return <CompanyDetailClient company={company} />;
}
