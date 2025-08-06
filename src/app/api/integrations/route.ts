import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const type = searchParams.get('type')

    const where: any = {}
    
    if (companyId) {
      where.companyId = companyId
    }
    
    if (type) {
      where.type = type
    }

    const integrations = await db.integration.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        },
        communications: {
          select: {
            id: true,
            type: true,
            language: true,
            createdAt: true
          },
          take: 5,
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ integrations })
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      companyId,
      type,
      name,
      config,
      status
    } = body

    if (!companyId || !type || !name || !config) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const integration = await db.integration.create({
      data: {
        companyId,
        type,
        name,
        config,
        status: status || 'ACTIVE'
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({ integration }, { status: 201 })
  } catch (error) {
    console.error('Error creating integration:', error)
    return NextResponse.json(
      { error: 'Failed to create integration' },
      { status: 500 }
    )
  }
}