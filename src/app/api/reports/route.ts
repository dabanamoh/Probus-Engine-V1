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
        company: {
          connect: { id: companyId }
        },
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
        acc[threat.status] = (acc[threat.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    },
    threats: threats.map(threat => ({
      id: threat.id,
      type: threat.type,
      severity: threat.severity,
      title: threat.title,
      description: threat.description,
      confidence: threat.confidence,
      status: threat.status,
      createdAt: threat.createdAt,
      communicationType: threat.communication?.type
    }))
  }
}

async function generateComplianceReport(companyId: string) {
  const threats = await db.threat.findMany({ where: { companyId } })
  const communications = await db.communication.findMany({
    where: {
      integration: { companyId }
    }
  })
  const integrations = await db.integration.findMany({ where: { companyId } })

  const resolvedThreats = threats.filter(t => t.status === 'RESOLVED').length
  const totalThreats = threats.length

  return {
    complianceScore: totalThreats > 0 ? Math.round((resolvedThreats / totalThreats) * 100) : 100,
    metrics: {
      totalThreats,
      resolvedThreats,
      openThreats: threats.filter(t => t.status === 'OPEN').length,
      communicationsAnalyzed: communications.filter(c => c.analyzedAt !== null).length,
      activeIntegrations: integrations.filter(i => i.status === 'ACTIVE').length
    },
    recommendations: [
      'Implement regular security training',
      'Monitor communication patterns',
      'Maintain up-to-date integrations',
      'Review and update security policies'
    ]
  }
}

async function generateUserActivityReport(companyId: string) {
  const users = await db.user.findMany({ where: { companyId } })
  const threats = await db.threat.findMany({ where: { companyId } })

  return {
    userSummary: {
      totalUsers: users.length,
      byRole: users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byLanguage: users.reduce((acc, user) => {
        acc[user.language] = (acc[user.language] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    },
    threatActivity: {
      totalThreats: threats.length,
      thisMonth: threats.filter(t => {
        const threatDate = new Date(t.createdAt)
        const now = new Date()
        return threatDate.getMonth() === now.getMonth() && 
               threatDate.getFullYear() === now.getFullYear()
      }).length,
      trends: 'Decreasing' // This would be calculated based on historical data
    }
  }
}

async function generateIntegrationHealthReport(companyId: string) {
  const integrations = await db.integration.findMany({ 
    where: { companyId },
    include: {
      communications: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  return {
    integrationSummary: {
      total: integrations.length,
      active: integrations.filter(i => i.status === 'ACTIVE').length,
      inactive: integrations.filter(i => i.status === 'INACTIVE').length,
      error: integrations.filter(i => i.status === 'ERROR').length
    },
    integrations: integrations.map(integration => ({
      id: integration.id,
      type: integration.type,
      name: integration.name,
      status: integration.status,
      lastSync: integration.lastSyncAt,
      recentCommunications: integration.communications.length
    }))
  }
}
