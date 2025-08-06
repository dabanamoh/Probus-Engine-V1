import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const severity = searchParams.get('severity')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    
    if (companyId) {
      where.companyId = companyId
    }
    
    if (severity) {
      where.severity = severity
    }
    
    if (type) {
      where.type = type
    }

    const threats = await db.threat.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        },
        communication: {
          select: {
            id: true,
            type: true,
            content: true,
            language: true
          }
        },
        recommendations: {
          select: {
            id: true,
            type: true,
            title: true,
            priority: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json({ threats })
  } catch (error) {
    console.error('Error fetching threats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch threats' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      companyId,
      communicationId,
      type,
      severity,
      title,
      description,
      confidence,
      metadata
    } = body

    if (!companyId || !type || !severity || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const threat = await db.threat.create({
      data: {
        companyId,
        communicationId,
        type,
        severity,
        title,
        description,
        confidence: confidence || 0.0,
        metadata: metadata || {}
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        },
        communication: {
          select: {
            id: true,
            type: true,
            content: true,
            language: true
          }
        }
      }
    })

    return NextResponse.json({ threat }, { status: 201 })
  } catch (error) {
    console.error('Error creating threat:', error)
    return NextResponse.json(
      { error: 'Failed to create threat' },
      { status: 500 }
    )
  }
}