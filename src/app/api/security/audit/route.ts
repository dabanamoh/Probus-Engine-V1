// src/app/api/security/audit/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateComplianceScore } from '@/lib/reports/compliance';

type CustomUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  companyId: string; // ✅ Add this so TypeScript knows it exists
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const user = session.user as CustomUser; // ✅ Cast to extended user type

  const { title, description, data } = await req.json();

  try {
    const report = await prisma.report.create({
      data: {
        company: { connect: { id: user.companyId } },
        // user: { connect: { id: user.id } }, // ❌ This line was causing the error — removed
        type: 'AUDIT',
        title,
        description,
        data,
        status: 'COMPLETED',
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error creating audit report:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const user = session.user as CustomUser; // ✅ Cast to extended user type

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');

  try {
    const reports = await prisma.report.findMany({
      where: {
        companyId: user.companyId,
        type: 'AUDIT',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.report.count({
      where: {
        companyId: user.companyId,
        type: 'AUDIT',
      },
    });

    return NextResponse.json({
      data: reports,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching audit reports:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
