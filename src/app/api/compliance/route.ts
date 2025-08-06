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

    // Get compliance metrics
    const threats = await db.threat.findMany({
      where: { companyId },
      include: {
        communication: {
          select: {
            language: true,
            type: true
          }
        }
      }
    })

    const communications = await db.communication.findMany({
      where: {
        integration: {
          companyId
        }
      }
    })

    const users = await db.user.findMany({
      where: { companyId }
    })

    const integrations = await db.integration.findMany({
      where: { companyId }
    })

    // Calculate compliance metrics
    const complianceData = {
      threatMetrics: {
        total: threats.length,
        byType: threats.reduce((acc, threat) => {
          acc[threat.type] = (acc[threat.type] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        bySeverity: threats.reduce((acc, threat) => {
          acc[threat.severity] = (acc[threat.severity] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        resolved: threats.filter(t => t.status === 'RESOLVED').length,
        open: threats.filter(t => t.status === 'OPEN').length,
        inProgress: threats.filter(t => t.status === 'IN_PROGRESS').length
      },
      communicationMetrics: {
        total: communications.length,
        byType: communications.reduce((acc, comm) => {
          acc[comm.type] = (acc[comm.type] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        byLanguage: communications.reduce((acc, comm) => {
          acc[comm.language] = (acc[comm.language] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        analyzed: communications.filter(c => c.analyzedAt !== null).length
      },
      userMetrics: {
        total: users.length,
        byRole: users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        byLanguage: users.reduce((acc, user) => {
          acc[user.language] = (acc[user.language] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      },
      integrationMetrics: {
        total: integrations.length,
        active: integrations.filter(i => i.status === 'ACTIVE').length,
        byType: integrations.reduce((acc, integration) => {
          acc[integration.type] = (acc[integration.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      },
      complianceScore: this.calculateComplianceScore(threats, communications, integrations)
    }

    return NextResponse.json({ complianceData })
  } catch (error) {
    console.error('Error fetching compliance data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compliance data' },
      { status: 500 }
    )
  }
}

function calculateComplianceScore(threats: any[], communications: any[], integrations: any[]) {
  // Simple compliance score calculation
  const totalThreats = threats.length
  const resolvedThreats = threats.filter(t => t.status === 'RESOLVED').length
  const analyzedCommunications = communications.filter(c => c.analyzedAt !== null).length
  const activeIntegrations = integrations.filter(i => i.status === 'ACTIVE').length

  const threatResolutionRate = totalThreats > 0 ? resolvedThreats / totalThreats : 1
  const communicationAnalysisRate = communications.length > 0 ? analyzedCommunications / communications.length : 1
  const integrationHealthRate = integrations.length > 0 ? activeIntegrations / integrations.length : 1

  const score = Math.round((threatResolutionRate * 0.4 + communicationAnalysisRate * 0.4 + integrationHealthRate * 0.2) * 100)

  return {
    score,
    grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F',
    details: {
      threatResolutionRate: Math.round(threatResolutionRate * 100),
      communicationAnalysisRate: Math.round(communicationAnalysisRate * 100),
      integrationHealthRate: Math.round(integrationHealthRate * 100)
    }
  }
}