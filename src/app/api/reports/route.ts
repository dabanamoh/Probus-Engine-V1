import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { calculateComplianceScore } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, format, type, threats } = await req.json();

    const user = await db.user.findUnique({
      where: {
        email: session.user.email
      },
      include: {
        company: true
      }
    });

    if (!user || !user.companyId) {
      return NextResponse.json({ error: 'User or company not found' }, { status: 404 });
    }

    const companyId = user.companyId;

    const initialData = {
      threatSummary: {},
      complianceScore: 0
    };

    const report = await db.report.create({
      data: {
        companyId,
        type,
        title,
        description,
        format,
        status: 'GENERATING',
        data: initialData
      }
    });

    const threatSummary = generateThreatSummary(threats);
    const complianceScore = calculateComplianceScore(threats);

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
    });

    return NextResponse.json({
      message: 'Report generated',
      reportId: report.id,
      threatSummary,
      complianceScore
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || !user.companyId) {
      return NextResponse.json({ error: 'User or company not found' }, { status: 404 });
    }

    const reports = await db.report.findMany({
      where: {
        companyId: user.companyId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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
