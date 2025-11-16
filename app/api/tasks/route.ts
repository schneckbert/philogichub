import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/activities - Liste aller Activities
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const contactId = searchParams.get('contactId');
    const limit = searchParams.get('limit');
    
    const activities = await prisma.activity.findMany({
      where: {
        ...(companyId && { company_id: companyId }),
        ...(contactId && { contact_id: contactId }),
      },
      include: {
        company: {
          select: { id: true, name_legal: true, name_brand: true }
        },
        contact: {
          select: { 
            id: true, 
            first_name: true, 
            last_name: true 
          }
        },
        opportunity: {
          select: { 
            id: true, 
            stage: true,
            estimated_value: true 
          }
        }
      },
      orderBy: { activity_datetime: 'desc' },
      take: limit ? parseInt(limit) : 50
    });
    
    return NextResponse.json(activities);
  } catch (error) {
    console.error('GET /api/activities error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Activities' },
      { status: 500 }
    );
  }
}

// POST /api/activities - Neue Activity erstellen
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const activity = await prisma.activity.create({
      data: {
        company_id: body.companyId,
        contact_id: body.contactId || null,
        user_id: body.userId || null,
        activity_type: body.activityType,
        channel: body.channel || null,
        direction: body.direction || null,
        activity_datetime: new Date(body.activityDatetime),
        duration_minutes: body.durationMinutes || null,
        subject: body.subject || null,
        notes: body.notes || null,
        related_opportunity_id: body.relatedOpportunityId || null,
        outcome: body.outcome || null,
        next_step: body.nextStep || null,
        next_step_due_date: body.nextStepDueDate ? new Date(body.nextStepDueDate) : null,
      },
      include: {
        company: true,
        contact: true,
        opportunity: true
      }
    });
    
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('POST /api/activities error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Activity' },
      { status: 500 }
    );
  }
}
