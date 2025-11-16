import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, auditLog, getRequestMetadata, requireSuperadmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requirePermission('academy:content:read');
  if (error) return error;

  try {
    const content = await prisma.academyContent.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        versions: {
          orderBy: {
            version: 'desc',
          },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        reviews: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Failed to fetch academy content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requirePermission([
    'academy:content:create:all',
    'academy:content:create:self_domain',
  ]);
  if (error) return error;

  try {
    const body = await req.json();
    const { title, category, markdown, status } = body;

    const existingContent = await prisma.academyContent.findUnique({
      where: { id: params.id },
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Check if protected
    if (existingContent.isProtected && !session.user.isSuperadmin) {
      return NextResponse.json(
        { error: 'This content is protected and can only be edited by superadmin' },
        { status: 403 }
      );
    }

    // Update content metadata
    const updateData: any = {};
    if (title) updateData.title = title;
    if (category) updateData.category = category;
    if (status) updateData.status = status;

    // If markdown is provided, create new version
    if (markdown) {
      const newVersion = existingContent.currentVersion + 1;
      
      await prisma.academyContentVersion.create({
        data: {
          contentId: params.id,
          version: newVersion,
          markdown,
          createdBy: session.user.id,
        },
      });

      updateData.currentVersion = newVersion;
    }

    const updated = await prisma.academyContent.update({
      where: { id: params.id },
      data: updateData,
      include: {
        versions: {
          where: {
            version: updateData.currentVersion || existingContent.currentVersion,
          },
        },
      },
    });

    // Audit log
    const metadata = getRequestMetadata(req.headers);
    await auditLog({
      userId: session.user.id,
      action: 'academy.content.updated',
      resourceType: 'academy_content',
      resourceId: params.id,
      metadata: { title, category, status, newVersion: markdown ? updateData.currentVersion : null },
      ...metadata,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update academy content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requirePermission('academy:content:delete');
  if (error) return error;

  try {
    const content = await prisma.academyContent.findUnique({
      where: { id: params.id },
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Check if protected
    if (content.isProtected && !session.user.isSuperadmin) {
      return NextResponse.json(
        { error: 'Protected content can only be deleted by superadmin' },
        { status: 403 }
      );
    }

    // Soft delete by archiving
    await prisma.academyContent.update({
      where: { id: params.id },
      data: { status: 'archived' },
    });

    // Audit log
    const metadata = getRequestMetadata(req.headers);
    await auditLog({
      userId: session.user.id,
      action: 'academy.content.deleted',
      resourceType: 'academy_content',
      resourceId: params.id,
      metadata: { title: content.title, slug: content.slug },
      ...metadata,
    });

    return NextResponse.json({ message: 'Content archived successfully' });
  } catch (error) {
    console.error('Failed to delete academy content:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}
