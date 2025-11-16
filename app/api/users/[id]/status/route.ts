import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, auditLog, getRequestMetadata } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requirePermission('user:write:all');
  if (error) return error;

  try {
    const { status } = await req.json();

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: active, inactive, or suspended' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user status
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { status },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        updatedAt: true,
      },
    });

    // Audit log
    const metadata = getRequestMetadata(req.headers);
    await auditLog({
      userId: session.user.id,
      action: 'user.status_changed',
      resourceType: 'user',
      resourceId: user.id,
      metadata: { 
        oldStatus: existingUser.status || 'active',
        newStatus: status,
        email: user.email 
      },
      ...metadata,
    });

    return NextResponse.json({
      message: 'User status updated successfully',
      user,
    });
  } catch (error) {
    console.error('Failed to update user status:', error);
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
}
