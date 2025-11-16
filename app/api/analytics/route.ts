// @ts-nocheck - Prisma 6 + Next.js 16 Turbopack has field name mapping bug
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Stage distribution
    const stageDistribution = await prisma.opportunity.groupBy({
      by: ['stage'],
      _count: { id: true },
      _sum: { estimated_value: true },
    });

    // Pipeline by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const pipelineTrend = await prisma.$queryRaw<Array<{
      month: string;
      count: number;
      total_value: number;
    }>>`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*)::int as count,
        COALESCE(SUM(estimated_value), 0)::float as total_value
      FROM baucrm.opportunity
      WHERE created_at >= ${sixMonthsAgo}
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month ASC
    `;

    // Conversion rates
    const totalOpportunities = await prisma.opportunity.count();
    const wonOpportunities = await prisma.opportunity.count({
      where: { stage: 'closed_won' }
    });
    const lostOpportunities = await prisma.opportunity.count({
      where: { stage: 'closed_lost' }
    });

    // Average deal size
    const avgDealSize = await prisma.opportunity.aggregate({
      _avg: { estimated_value: true },
      where: { stage: 'closed_won' }
    });

    // Top performing companies
    const companiesWithOpportunities = await prisma.company.findMany({
      include: {
        opportunity: {
          select: {
            stage: true,
            estimated_value: true,
          },
        },
        _count: {
          select: {
            opportunity: true,
          },
        },
      },
      where: {
        opportunity: {
          some: {},
        },
      },
    });

    const companyPerformance = companiesWithOpportunities.map(company => {
      const wonOpps = company.opportunity.filter(o => o.stage === 'closed_won').length;
      const totalOpps = company.opportunity.length;
      const winRate = totalOpps > 0 ? (wonOpps / totalOpps) * 100 : 0;
      const totalValue = company.opportunity.reduce((sum, opp) => {
        return sum + (opp.estimated_value ? Number(opp.estimated_value) : 0);
      }, 0);

      return {
        id: company.id,
        name: company.name_brand || company.name_legal,
        tier: company.tier,
        totalOpportunities: totalOpps,
        wonOpportunities: wonOpps,
        winRate: Math.round(winRate),
        totalValue,
      };
    }).sort((a, b) => b.totalValue - a.totalValue).slice(0, 10);

    // Activities by type
    const activitiesByType = await prisma.activity.groupBy({
      by: ['activity_type'],
      _count: { id: true },
    });

    // Recent wins
    const recentWins = await prisma.opportunity.findMany({
      where: { stage: 'closed_won' },
      take: 5,
      orderBy: { won_date: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            name_legal: true,
            name_brand: true,
          },
        },
      },
    });

    return NextResponse.json({
      stageDistribution: stageDistribution.map(item => ({
        stage: item.stage,
        count: item._count.id,
        value: item._sum.estimated_value ? Number(item._sum.estimated_value) : 0,
      })),
      pipelineTrend: pipelineTrend.map(item => ({
        month: item.month,
        count: Number(item.count),
        value: Number(item.total_value),
      })),
      metrics: {
        totalOpportunities,
        wonOpportunities,
        lostOpportunities,
        winRate: totalOpportunities > 0 ? Math.round((wonOpportunities / totalOpportunities) * 100) : 0,
        avgDealSize: avgDealSize._avg.estimated_value ? Number(avgDealSize._avg.estimated_value) : 0,
      },
      companyPerformance,
      activitiesByType: activitiesByType.map(item => ({
        type: item.activity_type,
        count: item._count.id,
      })),
      recentWins: recentWins.map(opp => ({
        id: opp.id,
        company: opp.company.name_brand || opp.company.name_legal,
        value: opp.estimated_value ? Number(opp.estimated_value) : 0,
        wonDate: opp.won_date,
      })),
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
