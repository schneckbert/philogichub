import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, auditLog, getRequestMetadata } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requirePermission('academy:content:approve');
  if (error) return error;

  try {
    const { id } = await params;
    const body = await req.json();
    const { action, comment } = body;

    if (!action || !['approved', 'rejected', 'requested_changes'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action (approved/rejected/requested_changes) is required' },
        { status: 400 }
      );
    }

    const content = await prisma.academyContent.findUnique({
      where: { id },
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Create review record
    await prisma.academyReview.create({
      data: {
        contentId: id,
        reviewerId: session.user.id,
        action,
        comment,
      },
    });

    // Update content status based on action
    let newStatus = content.status;
    if (action === 'approved') {
      newStatus = 'published';
    } else if (action === 'rejected') {
      newStatus = 'draft';
    }

    await prisma.academyContent.update({
      where: { id },
      data: { status: newStatus },
    });

    // Audit log
    const metadata = getRequestMetadata(req.headers);
    await auditLog({
      userId: session.user.id,
      action: `academy.content.${action}`,
      resourceType: 'academy_content',
      resourceId: id,
      metadata: { action, comment, newStatus },
      ...metadata,
    });

    return NextResponse.json({
      message: `Content ${action} successfully`,
      newStatus,
    });
  } catch (error) {
    console.error('Failed to review content:', error);
    return NextResponse.json(
      { error: 'Failed to review content' },
      { status: 500 }
    );
  }
}
