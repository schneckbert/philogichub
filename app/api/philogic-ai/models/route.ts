import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const PHILOGIC_AI_URL = process.env.PHILOGIC_AI_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call PhilogicAI backend
    const response = await fetch(`${PHILOGIC_AI_URL}/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch models:', response.statusText);
      // Return default model if API fails
      return NextResponse.json({
        models: [{ name: 'llama3.1:latest' }],
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Models API Error:', error);
    // Return default model on error
    return NextResponse.json({
      models: [{ name: 'llama3.1:latest' }],
    });
  }
}
