import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const PHILOGIC_AI_URL = process.env.PHILOGIC_AI_URL || 'http://localhost:8000';
const PHILOGIC_AI_API_KEY = process.env.PHILOGIC_AI_API_KEY || 'local';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { model, messages, stream, temperature, max_tokens } = body;

    // Call PhilogicAI backend
    const response = await fetch(`${PHILOGIC_AI_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PHILOGIC_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model || 'llama3.1:latest',
        messages: messages || [],
        stream: stream !== false,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('PhilogicAI API Error:', error);
      return NextResponse.json(
        { error: 'PhilogicAI API request failed' },
        { status: response.status }
      );
    }

    // Return streaming response if requested
    if (stream !== false && response.body) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Return JSON response
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
