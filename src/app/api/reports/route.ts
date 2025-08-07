import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateComplianceScore } from '@/lib/utils'

// GET: Fetch paginated and filtered reports
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { company: true }
    })

    if (!user || !user.companyId) {
      return NextResponse.json({ error: 'User or company not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const type = searchParams.get('type') as string | null

    const filters: any = {
      companyId: user.companyId
    }

    if (type) filters.type = type

    const [reports, total] = await Promise.all([
      db.report.findMany({
        where: filters,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          company: true
        }
      }),
      db.report.count({ where: filters })
    ])

    return NextResponse.json({
      reports,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    })
  } catch (error) {
    console.error('GET /api/reports error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST: Generate a new report
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, format, type, threats } = await req.json()

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { company: true }
    })

    if (!user || !user.companyId) {
      return NextResponse.json({ error: 'User or company not found' }, { status: 404 })
    }

    const companyId = user.companyId

    const dummyData = {
      threatSummary: {},
      complianceScore: 0
    }

    const report = await db.report.create({
      data: {
        companyId,
        type,
        title,
        description,
        format,
        status: 'GENERATING',
        data: dummyData
      }
    })

    const threatSummary = generateThreatSummary(threats)
    const complianceScore = calculateComplianceScore(threats)

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
      message: 'Report generated',
      reportId: report.id,
      threatSummary,
      complianceScore
    })
  } catch (error) {
    console.error('POST /api/reports error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Helper to summarize threats
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
