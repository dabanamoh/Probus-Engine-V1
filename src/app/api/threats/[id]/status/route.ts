import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(request: NextRequest) {
  try {
    // Get the threat ID from the URL path
    const id = request.url.split('/').slice(-2)[0]

    if (!id) {
      return NextResponse.json(
        { error: 'Threat ID is missing in URL' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    const threat = await db.threat.update({
      where: { id },
      data: {
        status,
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
    console.error('Error updating threat status:', error)
    return NextResponse.json(
      { error: 'Failed to update threat status' },
      { status: 500 }
    )
  }
}
