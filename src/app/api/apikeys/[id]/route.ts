import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requirePermission, auditLog, getRequestMetadata } from '@/lib/middleware';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;
    const { session } = authResult;
    
    // Get the API key first
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: params.id },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    // Check permissions: Own keys or apikey:delete:all
    const deleteAllResult = await requirePermission(['apikey:delete:all']);
    const canDeleteAll = !deleteAllResult.error;
    const isOwner = apiKey.userId === session.user.id;

    if (!canDeleteAll && !isOwner) {
      return NextResponse.json(
        { error: 'Permission denied: You can only delete your own API keys' },
        { status: 403 }
      );
    }

    // Delete the API key
    await prisma.apiKey.delete({
      where: { id: params.id },
    });

    // Audit log
    const metadata = getRequestMetadata(req.headers);
    await auditLog({
      userId: session.user.id,
      action: 'apikey.deleted',
      resourceType: 'apikey',
      resourceId: params.id,
      metadata: {
        name: apiKey.name,
        provider: apiKey.provider,
      },
      ...metadata,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete API key' },
      { status: 500 }
    );
  }
}
