// @ts-nocheck - Prisma 6 + Next.js 16 Turbopack has field name mapping bug
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  try {
    // Company stats
    const totalCompanies = await prisma.company.count();
    const customers = await prisma.company.count({
      where: { status_sales: 'customer' }
    });
    const prospects = await prisma.company.count({
      where: { status_sales: 'prospect' }
    });
    
    // New companies this month
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCompanies = await prisma.company.count({
      where: {
        created_at: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Tier distribution
    const tierA = await prisma.company.count({
      where: { tier: 'A' }
    });
    const tierB = await prisma.company.count({
      where: { tier: 'B' }
    });
    const tierC = await prisma.company.count({
      where: { tier: 'C' }
    });

    // Opportunity pipeline by stage
    const opportunityPipeline = await prisma.opportunity.groupBy({
      by: ['stage'],
      _count: { id: true },
      _sum: { estimated_value: true },
      _avg: { probability: true }
    });

    // Recent activities
    const recentActivities = await prisma.activity.findMany({
      take: 10,
      orderBy: { activity_datetime: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            name_legal: true,
            name_brand: true
          }
        },
        contact: {
          select: {
            id: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });

    // Top companies (simple version)
    const topCompanies = await prisma.company.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name_legal: true,
        name_brand: true,
        status_sales: true,
        tier: true
      }
    });

    // Format for response
    const companiesWithPipelineValue = topCompanies.map(company => ({
      id: company.id,
      nameLegal: company.name_legal,
      nameBrand: company.name_brand,
      statusSales: company.status_sales,
      tier: company.tier,
      pipelineValue: 0,
      opportunityCount: 0,
      contactCount: 0
    }));

    return NextResponse.json({
      companyStats: {
        total: totalCompanies,
        customers,
        prospects,
        newThisMonth: newCompanies,
        tierA,
        tierB,
        tierC
      },
      opportunityPipeline: opportunityPipeline.map(item => ({
        stage: item.stage,
        count: item._count?._all || 0,
        totalValue: item._sum?.estimated_value ? Number(item._sum.estimated_value) : 0,
        avgProbability: item._avg?.probability || 0
      })),
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        type: activity.activity_type,
        channel: activity.channel,
        subject: activity.subject,
        datetime: activity.activity_datetime,
        outcome: activity.outcome,
        company: activity.company ? {
          id: activity.company.id,
          name: activity.company.name_brand || activity.company.name_legal
        } : null,
        contact: activity.contact ? {
          id: activity.contact.id,
          name: `${activity.contact.first_name} ${activity.contact.last_name}`
        } : null
      })),
      topCompanies: companiesWithPipelineValue
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
