// @ts-nocheck - Prisma 6 + Next.js 16 Turbopack has field name mapping bug
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const stage = searchParams.get('stage');

    const where: any = {};
    if (companyId) where.company_id = companyId;
    if (stage) where.stage = stage;

    const opportunities = await prisma.opportunity.findMany({
      where,
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
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(opportunities);
  } catch (error) {
    console.error('Opportunities API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyId,
      primaryContactId,
      stage,
      estimatedValue,
      currency,
      expectedCloseDate,
      probability,
      offerType,
      projectType,
    } = body;

    const opportunity = await prisma.opportunity.create({
      data: {
        company_id: companyId,
        primary_contact_id: primaryContactId,
        stage: stage || 'new',
        estimated_value: estimatedValue,
        currency: currency || 'EUR',
        expected_close_date: expectedCloseDate ? new Date(expectedCloseDate) : null,
        probability,
        offer_type: offerType,
        project_type: projectType,
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

    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error('Create opportunity error:', error);
    return NextResponse.json(
      { error: 'Failed to create opportunity' },
      { status: 500 }
    );
  }
}
