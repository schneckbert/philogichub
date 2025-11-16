import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './dashboard-client';
import LandingClient from './landing-client';

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If user is logged in, show dashboard
  if (session) {
    return <DashboardClient />;
  }

  // If not logged in, show landing page
  return <LandingClient />;
}
