import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/agents/[id]/stop - Stop agent
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Update agent status to stopped
    const agent = await prisma.agent.update({
      where: { id },
      data: { 
        status: 'stopped',
      },
    });

    // Log the stop event
    await prisma.agent_log.create({
      data: {
        agent_id: id,
        level: 'info',
        message: `Agent "${agent.name}" stopped`,
        data: { action: 'stop' },
      },
    });

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error stopping agent:', error);
    return NextResponse.json(
      { error: 'Failed to stop agent' },
      { status: 500 }
    );
  }
}
