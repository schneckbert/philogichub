import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    await requirePermission(['audit:read:all']);

    const logs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1000, // Last 1000 logs
    });

    // Transform to match frontend expectations
    const transformedLogs = logs.map((log: any) => ({
      id: log.id,
      action: log.action,
      resource: log.resourceType,
      resourceId: log.resourceId,
      userId: log.userId,
      user: log.user,
      metadata: log.metadata,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      timestamp: log.createdAt.toISOString(),
    }));

    return NextResponse.json({ logs: transformedLogs });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch audit logs' },
      { status: error.message?.includes('permission') ? 403 : 500 }
    );
  }
}
