import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emailIntegrationService } from '@/lib/services/email-integration'
import { chatIntegrationService } from '@/lib/services/chat-integration'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const integration = await db.integration.findUnique({
      where: { id: params.id }
    })

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      )
    }

    // Update integration status to syncing
    await db.integration.update({
      where: { id: params.id },
      data: { status: 'ACTIVE' }
    })

    // Start sync process
    if (integration.type.includes('EMAIL')) {
      await emailIntegrationService.syncEmails(params.id)
    } else if (integration.type.includes('CHAT')) {
      await chatIntegrationService.syncMessages(params.id)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Integration sync completed successfully'
    })
  } catch (error) {
    console.error('Error syncing integration:', error)
    
    // Update integration status to error
    await db.integration.update({
      where: { id: params.id },
      data: { status: 'ERROR' }
    })

    return NextResponse.json(
      { error: 'Failed to sync integration' },
      { status: 500 }
    )
  }
}