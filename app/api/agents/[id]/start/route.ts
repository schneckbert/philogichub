import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/agents/[id]/start - Start agent
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Update agent status to running
    const agent = await prisma.agent.update({
      where: { id },
      data: { 
        status: 'running',
        last_run: new Date(),
      },
    });

    // Log the start event
    await prisma.agent_log.create({
      data: {
        agent_id: id,
        level: 'info',
        message: `Agent "${agent.name}" started`,
        data: { action: 'start' },
      },
    });

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error starting agent:', error);
    return NextResponse.json(
      { error: 'Failed to start agent' },
      { status: 500 }
    );
  }
}
