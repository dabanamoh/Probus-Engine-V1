import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const threat = await db.threat.findUnique({
      where: { id: params.id },
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
            language: true,
            metadata: true
          }
        },
        recommendations: {
          select: {
            id: true,
            type: true,
            title: true,
            description: true,
            priority: true,
            status: true,
            steps: true
          }
        }
      }
    })

    if (!threat) {
      return NextResponse.json(
        { error: 'Threat not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ threat })
  } catch (error) {
    console.error('Error fetching threat:', error)
    return NextResponse.json(
      { error: 'Failed to fetch threat' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, assignedTo } = body

    const threat = await db.threat.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(assignedTo && { assignedTo }),
        updatedAt: new Date()
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

    return NextResponse.json({ threat })
  } catch (error) {
    console.error('Error updating threat:', error)
    return NextResponse.json(
      { error: 'Failed to update threat' },
      { status: 500 }
    )
  }
}