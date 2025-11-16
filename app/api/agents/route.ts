// @ts-nocheck - Prisma 6 + Next.js 16 Turbopack has field name mapping bug
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/agents - List all agents with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const agents = await prisma.agent.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        agent_log: {
          take: 5,
          orderBy: { created_at: 'desc' },
        },
        _count: {
          select: {
            agent_log: true,
          },
        },
      },
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// POST /api/agents - Create new agent
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, description, config } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        type,
        description,
        config: config || {},
        status: 'idle',
      },
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
