import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateComplianceScore } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, format, threats } = await req.json()

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { company: true },
    })

    if (!user?.companyId) {
      return NextResponse.json({ error: 'User or company not found' }, { status: 404 })
    }

    const report = await db.report.create({
      data: {
        company: { connect: { id: user.companyId } },
        type: 'audit', // hardcoded to "audit"
        title,
        description,
        format,
        status: 'GENERATING',
      },
    })

    const threatSummary = generateThreatSummary(threats)
    const complianceScore = calculateComplianceScore(threats)

    return NextResponse.json({
      message: 'Audit report generated',
      report,
      threatSummary,
      complianceScore,
    })
  } catch (error) {
    console.error('Audit report error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

function generateThreatSummary(threats: any[]) {
  return {
    totalThreats: threats.length,
    summary: {
      byType: threats.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      bySeverity: threats.reduce((acc, t) => {
        acc[t.severity] = (acc[t.severity] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byStatus: threats.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1
        return acc
      }, {} as Record<string, number>),
    },
  }
}
