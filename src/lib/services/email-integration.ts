import { db } from '@/lib/db'
import { threatDetectionService } from './threat-detection'

interface EmailConfig {
  provider: 'gmail' | 'outlook' | 'exchange'
  credentials: {
    accessToken?: string
    refreshToken?: string
    clientId?: string
    clientSecret?: string
    username?: string
    password?: string
    server?: string
  }
  settings: {
    monitorInbox: boolean
    monitorSent: boolean
    monitorDrafts: boolean
    includeAttachments: boolean
    maxEmailsPerSync: number
  }
}

interface EmailData {
  id: string
  threadId: string
  subject: string
  body: string
  from: string
  to: string[]
  cc: string[]
  bcc: string[]
  date: string
  attachments: any[]
  labels: string[]
  language: string
}

export class EmailIntegrationService {
  async syncEmails(integrationId: string): Promise<void> {
    try {
      const integration = await db.integration.findUnique({
        where: { id: integrationId },
        include: { company: true }
      })

      if (!integration) {
        throw new Error('Integration not found')
      }

      const config = integration.config as EmailConfig
      const emails = await this.fetchEmails(config)

      for (const email of emails) {
        await this.processEmail(email, integration.id, integration.company.id)
      }

      await db.integration.update({
        where: { id: integrationId },
        data: { lastSyncAt: new Date() }
      })
    } catch (error) {
      console.error('Error syncing emails:', error)
      throw error
    }
  }

  private async fetchEmails(config: EmailConfig): Promise<EmailData[]> {
    // This is a mock implementation - in a real application, you would
    // integrate with actual email APIs like Gmail API, Outlook API, etc.
    
    const mockEmails: EmailData[] = [
      {
        id: 'email1',
        threadId: 'thread1',
        subject: 'Project Update - Q4 Review',
        body: 'Hi team, I wanted to share the latest project updates. We\'re making good progress but I\'m concerned about the timeline. The workload has been intense lately and I\'m feeling overwhelmed.',
        from: 'employee@company.com',
        to: ['team@company.com'],
        cc: [],
        bcc: [],
        date: new Date().toISOString(),
        attachments: [],
        labels: ['inbox', 'work'],
        language: 'en'
      },
      {
        id: 'email2',
        threadId: 'thread2',
        subject: 'Customer Data Request',
        body: 'Please send me the complete customer database for analysis. I need all personal information including addresses and phone numbers.',
        from: 'external@unknown.com',
        to: ['employee@company.com'],
        cc: [],
        bcc: [],
        date: new Date().toISOString(),
        attachments: [],
        labels: ['inbox'],
        language: 'en'
      }
    ]

    return mockEmails
  }

  private async processEmail(email: EmailData, integrationId: string, companyId: string): Promise<void> {
    try {
      // Check if email already exists
      const existingCommunication = await db.communication.findUnique({
        where: { sourceId: email.id }
      })

      if (existingCommunication) {
        return
      }

      // Detect language
      const language = await this.detectLanguage(email.body)

      // Create communication record
      const communication = await db.communication.create({
        data: {
          integrationId,
          type: 'EMAIL',
          sourceId: email.id,
          content: email.body,
          language,
          metadata: {
            subject: email.subject,
            from: email.from,
            to: email.to,
            cc: email.cc,
            bcc: email.bcc,
            date: email.date,
            attachments: email.attachments,
            labels: email.labels
          }
        }
      })

      // Analyze for threats
      const threats = await threatDetectionService.analyzeCommunication({
        id: communication.id,
        type: 'EMAIL',
        content: email.body,
        language,
        metadata: {
          subject: email.subject,
          from: email.from,
          to: email.to
        }
      })

      // Create threat records
      for (const threatData of threats) {
        const threat = await db.threat.create({
          data: {
            companyId,
            communicationId: communication.id,
            type: threatData.type,
            severity: threatData.severity,
            title: threatData.title,
            description: threatData.description,
            confidence: threatData.confidence,
            metadata: threatData.metadata
          }
        })

        // Generate recommendations
        const recommendations = await threatDetectionService.generateRecommendations(threat)
        
        for (const rec of recommendations) {
          await db.recommendation.create({
            data: {
              threatId: threat.id,
              type: rec.type,
              title: rec.title,
              description: rec.description,
              steps: rec.steps,
              priority: rec.priority,
              language: rec.language || 'en'
            }
          })
        }
      }
    } catch (error) {
      console.error('Error processing email:', error)
    }
  }

  private async detectLanguage(text: string): Promise<string> {
    try {
      // Simple language detection - in production, use a proper language detection library
      const patterns = {
        en: /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/i,
        es: /\b(el|la|y|o|pero|en|a|para|de|con|por)\b/i,
        fr: /\b(le|la|et|ou|mais|dans|à|pour|de|avec|par)\b/i,
        de: /\b(der|die|das|und|oder|aber|in|an|zu|für|von|mit)\b/i,
        zh: /[\u4e00-\u9fff]/
      }

      for (const [lang, pattern] of Object.entries(patterns)) {
        if (pattern.test(text)) {
          return lang
        }
      }

      return 'en' // default
    } catch (error) {
      console.error('Error detecting language:', error)
      return 'en'
    }
  }

  async testConnection(config: EmailConfig): Promise<boolean> {
    try {
      // Mock connection test - in production, actually test the email API connection
      return true
    } catch (error) {
      console.error('Error testing email connection:', error)
      return false
    }
  }
}

export const emailIntegrationService = new EmailIntegrationService()