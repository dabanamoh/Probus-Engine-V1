import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { calculateComplianceScore } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    // Authenticate using JWT
    const userData = await requireAuth(req);

    const { title, description, format, type, threats } = await req.json();

    const user = await db.user.findUnique({
      where: {
        id: userData.userId
      },
      include: {
        company: true
      }
    });

    if (!user || !user.companyId) {
      return NextResponse.json({ error: 'User or company not found' }, { status: 404 });
    }

    const companyId = user.companyId;

    const report = await db.report.create({
      data: {
        company: {
          connect: { id: companyId }
        },
        type,
        title,
        description,
        format,
        status: 'GENERATING'
      }
    });

    // Simulate threat analysis summary and compliance score
    const threatSummary = generateThreatSummary(threats);
    const complianceScore = calculateComplianceScore(threats);

    return NextResponse.json({
      message: 'Report generated',
      report,
      threatSummary,
      complianceScore
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper function to summarize threats
function generateThreatSummary(threats: any[]) {
  return {
    totalThreats: threats.length,
    summary: {
      byType: threats.reduce((acc, threat) => {
        acc[threat.type] = (acc[threat.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySeverity: threats.reduce((acc, threat) => {
        acc[threat.severity] = (acc[threat.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byStatus: threats.reduce((acc, threat) => {
        acc[threat.status] = (acc[threat.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    }
  };
}
