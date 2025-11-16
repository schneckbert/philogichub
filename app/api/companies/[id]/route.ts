import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/companies/[id] - Company by ID mit allen Details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        wz_code_company_wz_codeTowz_code: true,
        company_location_company_hq_location_idTocompany_location: true,
        company_location_company_location_company_idTocompany: {
          where: { is_active: true }
        },
        contact: {
          orderBy: { created_at: 'desc' }
        },
        opportunity: {
          orderBy: { created_at: 'desc' }
        },
        activity: {
          orderBy: { activity_datetime: 'desc' },
          take: 20
        },
        company_tech_profile: true,
        company_trade: {
          include: {
            trade: true
          }
        }
      }
    });
    
    if (!company) {
      return NextResponse.json(
        { error: 'Company nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Transform snake_case to camelCase for frontend
    const transformed = {
      ...company,
      nameLegal: company.name_legal,
      nameBrand: company.name_brand,
      wzCode: company.wz_code,
      tradeSegment: company.trade_segment,
      valueChainRole: company.value_chain_role,
      sizeEmployeeBucket: company.size_employee_bucket,
      sizeRevenueBucket: company.size_revenue_bucket,
      hqLocationId: company.hq_location_id,
      regionCluster: company.region_cluster,
      ownershipType: company.ownership_type,
      statusSales: company.status_sales,
      customerSince: company.customer_since,
      churnedAt: company.churned_at,
      buildingFocus: company.building_focus,
      projectSizeTypical: company.project_size_typical,
      tenderingStyle: company.tendering_style,
      unionMembership: company.union_membership,
      notesProfile: company.notes_profile,
      fitScoreManual: company.fit_score_manual,
      createdAt: company.created_at,
      updatedAt: company.updated_at,
      contacts: (company.contact || []).map((c: any) => ({
        ...c,
        firstName: c.first_name,
        lastName: c.last_name,
        jobTitle: c.job_title,
        roleStandardized: c.role_standardized,
        seniorityLevel: c.seniority_level,
        emailWork: c.email_work,
        phoneWork: c.phone_work,
        linkedinUrl: c.linkedin_url,
        optInStatus: c.opt_in_status,
        optInSource: c.opt_in_source,
        languagePreference: c.language_preference,
        engagementLevel: c.engagement_level,
        relationshipQuality: c.relationship_quality,
        notesPersonal: c.notes_personal,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        companyId: c.company_id,
        locationId: c.location_id
      })),
      opportunities: (company.opportunity || []).map((o: any) => ({
        ...o,
        companyId: o.company_id,
        primaryContactId: o.primary_contact_id,
        createdAt: o.created_at,
        offerType: o.offer_type,
        projectType: o.project_type,
        estimatedValue: o.estimated_value,
        expectedCloseDate: o.expected_close_date,
        wonDate: o.won_date,
        lostDate: o.lost_date,
        lostReason: o.lost_reason,
        lostReasonDetail: o.lost_reason_detail,
        contractTermMonths: o.contract_term_months,
        productBundle: o.product_bundle,
        predictionSnapshot: o.prediction_snapshot,
        feedbackOnPrediction: o.feedback_on_prediction,
        updatedAt: o.updated_at
      })),
      activities: (company.activity || []).map((a: any) => ({
        ...a,
        companyId: a.company_id,
        contactId: a.contact_id,
        userId: a.user_id,
        activityType: a.activity_type,
        activityDatetime: a.activity_datetime,
        durationMinutes: a.duration_minutes,
        relatedOpportunityId: a.related_opportunity_id,
        nextStep: a.next_step,
        nextStepDueDate: a.next_step_due_date,
        createdAt: a.created_at
      })),
      locations: (company.company_location_company_location_company_idTocompany || []).map((l: any) => ({
        ...l,
        companyId: l.company_id,
        postalCode: l.postal_code,
        federalState: l.federal_state,
        locationType: l.location_type,
        phoneMain: l.phone_main,
        emailGeneral: l.email_general,
        isActive: l.is_active,
        createdAt: l.created_at,
        updatedAt: l.updated_at
      })),
      hqLocation: company.company_location_company_hq_location_idTocompany_location ? {
        ...company.company_location_company_hq_location_idTocompany_location,
        companyId: company.company_location_company_hq_location_idTocompany_location.company_id,
        postalCode: company.company_location_company_hq_location_idTocompany_location.postal_code,
        federalState: company.company_location_company_hq_location_idTocompany_location.federal_state,
        locationType: company.company_location_company_hq_location_idTocompany_location.location_type,
        phoneMain: company.company_location_company_hq_location_idTocompany_location.phone_main,
        emailGeneral: company.company_location_company_hq_location_idTocompany_location.email_general,
        isActive: company.company_location_company_hq_location_idTocompany_location.is_active,
        createdAt: company.company_location_company_hq_location_idTocompany_location.created_at,
        updatedAt: company.company_location_company_hq_location_idTocompany_location.updated_at
      } : null,
      wzCodeRef: company.wz_code_company_wz_codeTowz_code ? {
        code: company.wz_code_company_wz_codeTowz_code.wz_code,
        class: company.wz_code_company_wz_codeTowz_code.class,
        description: company.wz_code_company_wz_codeTowz_code.description,
        mainSegment: company.wz_code_company_wz_codeTowz_code.main_segment
      } : null,
      techProfile: company.company_tech_profile ? {
        ...company.company_tech_profile,
        companyId: company.company_tech_profile.company_id,
        websiteUrl: company.company_tech_profile.website_url,
        cmsDetected: company.company_tech_profile.cms_detected,
        crmDetected: company.company_tech_profile.crm_detected,
        erpDetected: company.company_tech_profile.erp_detected,
        constructionSoftware: company.company_tech_profile.construction_software,
        saasAdoptionLevel: company.company_tech_profile.saas_adoption_level,
        digitalMaturityScore: company.company_tech_profile.digital_maturity_score,
        updatedAt: company.company_tech_profile.updated_at
      } : null,
      companyTrades: (company.company_trade || []).map((t: any) => ({
        ...t,
        companyId: t.company_id,
        tradeId: t.trade_id,
        coreTrade: t.core_trade,
        revenueShareBucket: t.revenue_share_bucket
      }))
    };
    
    return NextResponse.json(transformed);
  } catch (error) {
    console.error(`GET /api/companies/[id] error:`, error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Company' },
      { status: 500 }
    );
  }
}

// PATCH /api/companies/[id] - Company updaten
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const company = await prisma.company.update({
      where: { id },
      data: {
        name_legal: body.nameLegal,
        name_brand: body.nameBrand,
        wz_code: body.wzCode,
        trade_segment: body.tradeSegment,
        status_sales: body.statusSales,
        tier: body.tier,
        notes_profile: body.notesProfile,
        fit_score_manual: body.fitScoreManual,
      },
      include: {
        wz_code_company_wz_codeTowz_code: true,
        company_location_company_hq_location_idTocompany_location: true
      }
    });
    
    return NextResponse.json(company);
  } catch (error) {
    console.error(`PATCH /api/companies/[id] error:`, error);
    return NextResponse.json(
      { error: 'Fehler beim Updaten der Company' },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[id] - Company löschen
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.company.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/companies/[id] error:`, error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Company' },
      { status: 500 }
    );
  }
}
