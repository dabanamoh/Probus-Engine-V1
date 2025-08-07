import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    const reports = await db.report.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyId, type, title, description, format } = body

    if (!companyId || !type || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const report = await db.report.create({
      data: {
        companyId,
        type,
        title,
        description,
        format: format || 'PDF',
        status: 'GENERATING'
      }
    })

    // Start report generation in the background
    generateReportData(report.id).catch(console.error)

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    )
  }
}

async function generateReportData(reportId: string) {
  try {
    const report = await db.report.findUnique({
      where: { id: reportId },
      include: {
        company: true
      }
    })

    if (!report) return

    let reportData = {}

    switch (report.type) {
      case 'THREAT_SUMMARY':
        reportData = await generateThreatSummary(report.companyId)
        break
      case 'COMPLIANCE_REPORT':
        reportData = await generateComplianceReport(report.companyId)
        break
      case 'USER_ACTIVITY':
        reportData = await generateUserActivityReport(report.companyId)
        break
      case 'INTEGRATION_HEALTH':
        reportData = await generateIntegrationHealthReport(report.companyId)
        break
    }

    await db.report.update({
      where: { id: reportId },
      data: {
        data: reportData,
        status: 'COMPLETED',
        completedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Error generating report data:', error)
    await db.report.update({
      where: { id: reportId },
      data: { status: 'FAILED' }
    })
  }
}

async function generateThreatSummary(companyId: string) {
  const threats = await db.threat.findMany({
    where: { companyId },
    include: {
      communication: true
    }
  })

  return {
    summary: {
      totalThreats: threats.length,
      byType: threats.reduce((acc, threat) => {
        acc[threat.type] = (acc[threat.type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      bySeverity: threats.reduce((acc, threat) => {
        acc[threat.severity] = (acc[threat.severity] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byStatus: threats.reduce((acc, threat) => {
        acc[thre]()
