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

    // Get security audit data
    const threats = await db.threat.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    })

    const communications = await db.communication.findMany({
      where: {
        integration: {
          companyId
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const users = await db.user.findMany({
      where: { companyId }
    })

    const integrations = await db.integration.findMany({
      where: { companyId }
    })

    // Perform security analysis
    const securityAudit = {
      riskAssessment: this.assessRisks(threats),
      dataProtection: this.assessDataProtection(communications),
      accessControl: this.assessAccessControl(users),
      systemIntegrity: this.assessSystemIntegrity(integrations),
      recommendations: this.generateSecurityRecommendations(threats, communications, integrations),
      auditSummary: {
        totalRisks: threats.length,
        highRiskCount: threats.filter(t => t.severity === 'CRITICAL' || t.severity === 'HIGH').length,
        mediumRiskCount: threats.filter(t => t.severity === 'MEDIUM').length,
        lowRiskCount: threats.filter(t => t.severity === 'LOW').length,
        auditDate: new Date().toISOString(),
        auditor: 'Probi AI Security System'
      }
    }

    return NextResponse.json({ securityAudit })
  } catch (error) {
    console.error('Error performing security audit:', error)
    return NextResponse.json(
      { error: 'Failed to perform security audit' },
      { status: 500 }
    )
  }
}

function assessRisks(threats: any[]) {
  const riskCategories = {
    informationLeakage: threats.filter(t => t.type === 'INFORMATION_LEAKAGE'),
    harassment: threats.filter(t => t.type === 'HARASSMENT'),
    fraud: threats.filter(t => t.type === 'FRAUD'),
    burnout: threats.filter(t => t.type === 'BURNOUT'),
    dissatisfaction: threats.filter(t => t.type === 'DISSATISFACTION')
  }

  const riskLevels = {
    critical: threats.filter(t => t.severity === 'CRITICAL'),
    high: threats.filter(t => t.severity === 'HIGH'),
    medium: threats.filter(t => t.severity === 'MEDIUM'),
    low: threats.filter(t => t.severity === 'LOW')
  }

  return {
    byCategory: Object.entries(riskCategories).reduce((acc, [category, items]) => {
      acc[category] = {
        count: items.length,
        severity: items.reduce((severityAcc, item) => {
          severityAcc[item.severity] = (severityAcc[item.severity] || 0) + 1
          return severityAcc
        }, {} as Record<string, number>)
      }
      return acc
    }, {} as any),
    bySeverity: Object.entries(riskLevels).reduce((acc, [severity, items]) => {
      acc[severity] = {
        count: items.length,
        types: items.reduce((typeAcc, item) => {
          typeAcc[item.type] = (typeAcc[item.type] || 0) + 1
          return typeAcc
        }, {} as Record<string, number>)
      }
      return acc
    }, {} as any),
    trends: this.calculateRiskTrends(threats)
  }
}

function assessDataProtection(communications: any[]) {
  const sensitiveKeywords = [
    'password', 'ssn', 'social security', 'credit card', 'bank account',
    'confidential', 'secret', 'proprietary', 'personal information'
  ]

  const potentialDataLeaks = communications.filter(comm => {
    const content = comm.content.toLowerCase()
    return sensitiveKeywords.some(keyword => content.includes(keyword))
  })

  return {
    totalCommunications: communications.length,
    potentialDataLeaks: potentialDataLeaks.length,
    dataLeakPercentage: communications.length > 0 ? 
      Math.round((potentialDataLeaks.length / communications.length) * 100) : 0,
    byLanguage: potentialDataLeaks.reduce((acc, comm) => {
      acc[comm.language] = (acc[comm.language] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byType: potentialDataLeaks.reduce((acc, comm) => {
      acc[comm.type] = (acc[comm.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

function assessAccessControl(users: any[]) {
  const roleDistribution = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const adminCount = roleDistribution['ADMIN'] || 0
  const totalCount = users.length

  return {
    totalUsers: totalCount,
    adminUsers: adminCount,
    adminPercentage: totalCount > 0 ? Math.round((adminCount / totalCount) * 100) : 0,
    roleDistribution,
    securityConcerns: []
  }
}

function assessSystemIntegrity(integrations: any[]) {
  const activeIntegrations = integrations.filter(i => i.status === 'ACTIVE')
  const inactiveIntegrations = integrations.filter(i => i.status === 'INACTIVE')
  const errorIntegrations = integrations.filter(i => i.status === 'ERROR')

  return {
    totalIntegrations: integrations.length,
    activeIntegrations: activeIntegrations.length,
    inactiveIntegrations: inactiveIntegrations.length,
    errorIntegrations: errorIntegrations.length,
    healthPercentage: integrations.length > 0 ? 
      Math.round((activeIntegrations.length / integrations.length) * 100) : 0,
    byType: integrations.reduce((acc, integration) => {
      acc[integration.type] = {
        total: (acc[integration.type]?.total || 0) + 1,
        active: (acc[integration.type]?.active || 0) + (integration.status === 'ACTIVE' ? 1 : 0)
      }
      return acc
    }, {} as any)
  }
}

function generateSecurityRecommendations(threats: any[], communications: any[], integrations: any[]) {
  const recommendations = []

  // Check for high-severity threats
  const highSeverityThreats = threats.filter(t => t.severity === 'CRITICAL' || t.severity === 'HIGH')
  if (highSeverityThreats.length > 0) {
    recommendations.push({
      priority: 'URGENT',
      category: 'Threat Response',
      title: 'Address High-Severity Threats',
      description: `There are ${highSeverityThreats.length} high-severity threats requiring immediate attention.`,
      actionItems: [
        'Review and prioritize all critical and high-severity threats',
        'Assign appropriate personnel to investigate each threat',
        'Implement immediate containment measures if necessary',
        'Establish response timeline for each threat'
      ]
    })
  }

  // Check for data protection issues
  const potentialDataLeaks = communications.filter(comm => {
    const content = comm.content.toLowerCase()
    const sensitiveKeywords = ['password', 'ssn', 'credit card', 'bank account', 'confidential']
    return sensitiveKeywords.some(keyword => content.includes(keyword))
  })

  if (potentialDataLeaks.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Data Protection',
      title: 'Enhance Data Protection Measures',
      description: `Detected ${potentialDataLeaks.length} potential data leaks in communications.`,
      actionItems: [
        'Implement data loss prevention (DLP) tools',
        'Train employees on data handling best practices',
        'Review and update data classification policies',
        'Monitor for sensitive data sharing patterns'
      ]
    })
  }

  // Check integration health
  const inactiveIntegrations = integrations.filter(i => i.status !== 'ACTIVE')
  if (inactiveIntegrations.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'System Maintenance',
      title: 'Restore Inactive Integrations',
      description: `${inactiveIntegrations.length} integrations are not active, affecting monitoring capabilities.`,
      actionItems: [
        'Investigate and resolve integration issues',
        'Test integration connectivity and authentication',
        'Implement integration health monitoring',
        'Establish backup monitoring methods'
      ]
    })
  }

  // General security recommendations
  recommendations.push({
    priority: 'MEDIUM',
    category: 'Security Awareness',
    title: 'Enhance Security Training',
    description: 'Regular security training helps prevent many types of threats.',
    actionItems: [
      'Conduct regular security awareness training',
      'Simulate phishing exercises',
      'Update security policies and procedures',
      'Establish security incident reporting process'
    ]
  })

  return recommendations
}

function calculateRiskTrends(threats: any[]) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const recentThreats = threats.filter(t => new Date(t.createdAt) >= thirtyDaysAgo)

  const threatsByDay = recentThreats.reduce((acc, threat) => {
    const date = new Date(threat.createdAt).toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const trend = Object.entries(threatsByDay).map(([date, count]) => ({
    date,
    count,
    severity: recentThreats.filter(t => 
      new Date(t.createdAt).toISOString().split('T')[0] === date
    ).reduce((severityAcc, t) => {
      severityAcc[t.severity] = (severityAcc[t.severity] || 0) + 1
      return severityAcc
    }, {} as Record<string, number>)
  }))

  return {
    period: 'Last 30 days',
    totalThreats: recentThreats.length,
    dailyAverage: Math.round(recentThreats.length / 30),
    trend: trend.sort((a, b) => a.date.localeCompare(b.date))
  }
}