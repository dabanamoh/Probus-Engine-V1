import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateComplianceScore } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, format, threats } = await req.json()

    const user = await db.user.findUnique({
      where: {
        email: session.user.email
      },
      include: {
        company: true
      }
    })

    if (!user || !user.companyId) {
      return NextResponse.json({ error: 'User or company not found' }, { status: 404 })
    }

    const report = await db.report.create({
      data: {
        company: { connect: { id: user.companyId } },
        user: { connect: { id: user.id } },
        type: 'AUDIT',
        title,
        description,
        format,
        status: 'GENERATING'
      }
    })

    const threatSummary = generateThreatSummary(threats)
    const complianceScore = calculateComplianceScore(threats)

    // Optionally update the report with the generated data
    await db.report.update({
      where: { id: report.id },
      data: {
        data: {
          threatSummary,
          complianceScore
        },
        status: 'COMPLETED',
        completedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Audit report generated successfully',
      reportId: report.id,
      threatSummary,
      complianceScore
    })
  } catch (error) {
    console.error('Audit report creation failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: {
        email: session.user.email
      }
    })

    if (!user || !user.companyId) {
      return NextResponse.json({ error: 'User or company not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    const [reports, total] = await Promise.all([
      db.report.findMany({
        where: {
          companyId: user.companyId,
          type: 'AUDIT'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          company: {
            select: {
              id: true,
              name: true
            }
          }
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      db.report.count({
        where: {
          companyId: user.companyId,
          type: 'AUDIT'
        }
      })
    ])

    return NextResponse.json({
      page,
      pageSize,
      total,
      reports
    })
  } catch (error) {
    console.error('Fetching audit reports failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Helper function to summarize threats
function generateThreatSummary(threats: any[]) {
  return {
    totalThreats: threats.length,
    summary: {
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
    }
  }
}
