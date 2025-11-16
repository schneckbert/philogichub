import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name_legal: true,
            name_brand: true,
            tier: true,
          },
        },
        contact: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email_work: true,
            phone_work: true,
            job_title: true,
          },
        },
        activity: {
          take: 20,
          orderBy: { activity_datetime: 'desc' },
          select: {
            id: true,
            activity_type: true,
            channel: true,
            activity_datetime: true,
            subject: true,
            outcome: true,
          },
        },
      },
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error('Opportunity detail API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunity' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      stage,
      estimatedValue,
      currency,
      expectedCloseDate,
      probability,
      offerType,
      projectType,
    } = body;

    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        ...(stage && { stage }),
        ...(estimatedValue !== undefined && { estimatedValue }),
        ...(currency && { currency }),
        ...(expectedCloseDate && { expectedCloseDate: new Date(expectedCloseDate) }),
        ...(probability !== undefined && { probability }),
        ...(offerType && { offerType }),
        ...(projectType && { projectType }),
      },
      include: {
        company: {
          select: {
            id: true,
            name_legal: true,
            name_brand: true,
            tier: true,
          },
        },
        contact: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error('Update opportunity error:', error);
    return NextResponse.json(
      { error: 'Failed to update opportunity' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.opportunity.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete opportunity error:', error);
    return NextResponse.json(
      { error: 'Failed to delete opportunity' },
      { status: 500 }
    );
  }
}
