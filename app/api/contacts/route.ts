// @ts-nocheck - Prisma 6 + Next.js 16 Turbopack has field name mapping bug
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/contacts - Liste aller Contacts (Bau-CRM)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    const contacts = await prisma.contact.findMany({
      where: companyId ? { company_id: companyId } : {},
      include: {
        company: {
          select: { id: true, name_legal: true, name_brand: true }
        },
        company_location: {
          select: { id: true, name: true, city: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    
    return NextResponse.json(contacts);
  } catch (error) {
    console.error('GET /api/contacts error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Contacts' },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Neuer Contact erstellen
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const contact = await prisma.contact.create({
      data: {
        first_name: body.firstName,
        last_name: body.lastName,
        company_id: body.companyId,
        location_id: body.locationId || null,
        email_work: body.emailWork || null,
        phone_work: body.phoneWork || null,
        job_title: body.jobTitle || null,
        role_standardized: body.roleStandardized || null,
        seniority_level: body.seniorityLevel || null,
        department: body.department || null,
        linkedin_url: body.linkedinUrl || null,
        notes_personal: body.notesPersonal || null,
      },
      include: {
        company: {
          select: { id: true, name_legal: true, name_brand: true }
        },
        company_location: true
      }
    });
    
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('POST /api/contacts error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Contacts' },
      { status: 500 }
    );
  }
}
