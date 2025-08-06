import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import emailIntegrationService from '@/lib/services/email-integration';
import chatIntegrationService from '@/lib/services/chat-integration';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing integration ID' }, { status: 400 });
    }

    const integration = await db.integration.findUnique({
      where: { id }
    });

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    await db.integration.update({
      where: { id },
      data: { status: 'ACTIVE' }
    });

    if (integration.type.includes('EMAIL')) {
      await emailIntegrationService.syncEmails(id);
    } else if (integration.type.includes('CHAT')) {
      await chatIntegrationService.syncMessages(id);
    }

    return NextResponse.json({
      success: true,
      message: 'Integration sync completed successfully'
    });
  } catch (error) {
    console.error('Error syncing integration:', error);

    return NextResponse.json({ error: 'Failed to sync integration' }, { status: 500 });
  }
}
