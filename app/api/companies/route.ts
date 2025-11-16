// @ts-nocheck - Prisma 6 + Next.js 16 Turbopack has field name mapping bug
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/companies - Liste aller Companies (Bau-CRM)
export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        wz_code_company_wz_codeTowz_code: true,
        company_location_company_hq_location_idTocompany_location: {
          select: { id: true, name: true, city: true }
        },
        _count: {
          select: { 
            contact: true, 
            opportunity: true,
            company_location_company_location_company_idTocompany: true 
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    
    return NextResponse.json(companies);
  } catch (error) {
    console.error('GET /api/companies error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Companies' },
      { status: 500 }
    );
  }
}

// POST /api/companies - Neue Company erstellen
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const company = await prisma.company.create({
      data: {
        name_legal: body.nameLegal,
        name_brand: body.nameBrand || null,
        wz_code: body.wzCode || null,
        trade_segment: body.tradeSegment || null,
        status_sales: body.statusSales || 'prospect',
        tier: body.tier || null,
        notes_profile: body.notesProfile || null,
      },
      include: {
        wz_code_company_wz_codeTowz_code: true,
        company_location_company_hq_location_idTocompany_location: true
      }
    });
    
    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('POST /api/companies error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Company' },
      { status: 500 }
    );
  }
}
