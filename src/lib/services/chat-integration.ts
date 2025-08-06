import { db } from '@/lib/db'
import { threatDetectionService } from './threat-detection'

interface ChatConfig {
  provider: 'slack' | 'teams' | 'whatsapp'
  credentials: {
    accessToken?: string
    botToken?: string
    webhookUrl?: string
    teamId?: string
    channelId?: string
  }
  settings: {
    monitorDirectMessages: boolean
    monitorGroupChats: boolean
    monitorChannels: boolean
    includeFiles: boolean
    maxMessagesPerSync: number
  }
}

interface ChatMessage {
  id: string
  threadId?: string
  content: string
  from: string
  to?: string
  channel?: string
  timestamp: string
  type: 'direct' | 'group' | 'channel'
  attachments: any[]
  reactions: any[]
  language: string
}

export class ChatIntegrationService {
  async syncMessages(integrationId: string): Promise<void> {
    try {
      const integration = await db.integration.findUnique({
        where: { id: integrationId },
        include: { company: true }
      })

      if (!integration) {
        throw new Error('Integration not found')
      }

      const config = integration.config as ChatConfig
      const messages = await this.fetchMessages(config)

      for (const message of messages) {
        await this.processMessage(message, integration.id, integration.company.id)
      }

      await db.integration.update({
        where: { id: integrationId },
        data: { lastSyncAt: new Date() }
      })
    } catch (error) {
      console.error('Error syncing chat messages:', error)
      throw error
    }
  }

  private async fetchMessages(config: ChatConfig): Promise<ChatMessage[]> {
    // This is a mock implementation - in a real application, you would
    // integrate with actual chat APIs like Slack API, Teams API, etc.
    
    const mockMessages: ChatMessage[] = [
      {
        id: 'msg1',
        content: 'Hey everyone, I\'m really tired of this project. The management is terrible and I don\'t see why we should keep working overtime for no appreciation.',
        from: 'user1',
        channel: 'general',
        timestamp: new Date().toISOString(),
        type: 'channel',
        attachments: [],
        reactions: [],
        language: 'en'
      },
      {
        id: 'msg2',
        content: 'Can someone send me the customer list? I need it for the presentation tomorrow.',
        from: 'user2',
        channel: 'sales',
        timestamp: new Date().toISOString(),
        type: 'channel',
        attachments: [],
        reactions: [],
        language: 'en'
      },
      {
        id: 'msg3',
        content: 'You\'re completely incompetent! This is the worst work I\'ve ever seen. Do it again or you\'re fired!',
        from: 'manager',
        to: 'employee',
        timestamp: new Date().toISOString(),
        type: 'direct',
        attachments: [],
        reactions: [],
        language: 'en'
      }
    ]

    return mockMessages
  }

  private async processMessage(message: ChatMessage, integrationId: string, companyId: string): Promise<void> {
    try {
      // Check if message already exists
      const existingCommunication = await db.communication.findUnique({
        where: { sourceId: message.id }
      })

      if (existingCommunication) {
        return
      }

      // Detect language
      const language = await this.detectLanguage(message.content)

      // Create communication record
      const communication = await db.communication.create({
        data: {
          integrationId,
          type: message.type === 'direct' ? 'CHAT_DIRECT' : 
                message.type === 'group' ? 'CHAT_GROUP' : 'CHAT_CHANNEL',
          sourceId: message.id,
          content: message.content,
          language,
          metadata: {
            from: message.from,
            to: message.to,
            channel: message.channel,
            timestamp: message.timestamp,
            attachments: message.attachments,
            reactions: message.reactions,
            threadId: message.threadId
          }
        }
      })

      // Analyze for threats
      const threats = await threatDetectionService.analyzeCommunication({
        id: communication.id,
        type: message.type === 'direct' ? 'CHAT_DIRECT' : 
              message.type === 'group' ? 'CHAT_GROUP' : 'CHAT_CHANNEL',
        content: message.content,
        language,
        metadata: {
          from: message.from,
          to: message.to,
          channel: message.channel
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
      console.error('Error processing chat message:', error)
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

  async testConnection(config: ChatConfig): Promise<boolean> {
    try {
      // Mock connection test - in production, actually test the chat API connection
      return true
    } catch (error) {
      console.error('Error testing chat connection:', error)
      return false
    }
  }
}

export const chatIntegrationService = new ChatIntegrationService()