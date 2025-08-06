import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const integrationId = searchParams.get('integrationId')
    const type = searchParams.get('type')
    const language = searchParams.get('language')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    
    if (integrationId) {
      where.integrationId = integrationId
    }
    
    if (type) {
      where.type = type
    }
    
    if (language) {
      where.language = language
    }

    const communications = await db.communication.findMany({
      where,
      include: {
        integration: {
          select: {
            id: true,
            type: true,
            name: true
          }
        },
        threats: {
          select: {
            id: true,
            type: true,
            severity: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json({ communications })
  } catch (error) {
    console.error('Error fetching communications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch communications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      integrationId,
      type,
      sourceId,
      content,
      metadata,
      language
    } = body

    if (!integrationId || !type || !sourceId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const communication = await db.communication.create({
      data: {
        integrationId,
        type,
        sourceId,
        content,
        metadata: metadata || {},
        language: language || 'en'
      },
      include: {
        integration: {
          select: {
            id: true,
            type: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({ communication }, { status: 201 })
  } catch (error) {
    console.error('Error creating communication:', error)
    return NextResponse.json(
      { error: 'Failed to create communication' },
      { status: 500 }
    )
  }
}