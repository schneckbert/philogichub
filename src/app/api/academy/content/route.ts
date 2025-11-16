import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, auditLog, getRequestMetadata } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { session, error } = await requirePermission('academy:content:read');
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'published';
    const category = searchParams.get('category');

    const where: any = {};

    if (status === 'all') {
      // No filter
    } else {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    const contents = await prisma.academyContent.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        versions: {
          take: 1,
          orderBy: {
            version: 'desc',
          },
        },
        _count: {
          select: {
            versions: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(contents);
  } catch (error) {
    console.error('Failed to fetch academy content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requirePermission([
    'academy:content:create:all',
    'academy:content:create:self_domain',
    'academy:content:draft_create',
  ]);
  if (error) return error;

  try {
    const body = await req.json();
    const { title, slug, category, markdown, status = 'draft' } = body;

    if (!title || !slug || !category || !markdown) {
      return NextResponse.json(
        { error: 'Title, slug, category, and content are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.academyContent.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Content with this slug already exists' },
        { status: 400 }
      );
    }

    // Create content with first version
    const content = await prisma.academyContent.create({
      data: {
        title,
        slug,
        category,
        status,
        currentVersion: 1,
        createdBy: session.user.id,
        versions: {
          create: {
            version: 1,
            markdown,
            createdBy: session.user.id,
          },
        },
      },
      include: {
        versions: true,
      },
    });

    // Audit log
    const metadata = getRequestMetadata(req.headers);
    await auditLog({
      userId: session.user.id,
      action: 'academy.content.created',
      resourceType: 'academy_content',
      resourceId: content.id,
      metadata: { title, slug, category, status },
      ...metadata,
    });

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('Failed to create academy content:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}
