import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/opportunities - Liste aller Opportunities
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const stage = searchParams.get('stage');
    
    const opportunities = await prisma.opportunity.findMany({
      where: {
        ...(companyId && { company_id: companyId }),
        ...(stage && { stage }),
      },
      include: {
        company: {
          select: { id: true, name_legal: true, name_brand: true }
        },
        contact: {
          select: { 
            id: true, 
            first_name: true, 
            last_name: true,
            email_work: true 
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    
    return NextResponse.json(opportunities);
  } catch (error) {
    console.error('GET /api/opportunities error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Opportunities' },
      { status: 500 }
    );
  }
}

// POST /api/opportunities - Neue Opportunity erstellen
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const opportunity = await prisma.opportunity.create({
      data: {
        company_id: body.companyId,
        primary_contact_id: body.primaryContactId || null,
        source: body.source || 'other',
        offer_type: body.offerType || null,
        project_type: body.projectType || null,
        estimated_value: body.estimatedValue || null,
        currency: body.currency || 'EUR',
        expected_close_date: body.expectedCloseDate ? new Date(body.expectedCloseDate) : null,
        stage: body.stage || 'new',
        probability: body.probability || null,
      },
      include: {
        company: {
          select: { id: true, name_legal: true, name_brand: true }
        },
        contact: true
      }
    });
    
    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error('POST /api/opportunities error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Opportunity' },
      { status: 500 }
    );
  }
}
