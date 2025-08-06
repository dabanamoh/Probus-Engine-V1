import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'

interface ThreatDetectionResult {
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  confidence: number
  metadata: any
}

interface CommunicationData {
  id: string
  type: string
  content: string
  language: string
  metadata?: any
}

export class ThreatDetectionService {
  private zai: any

  constructor() {
    this.initializeZAI()
  }

  private async initializeZAI() {
    try {
      this.zai = await ZAI.create()
    } catch (error) {
      console.error('Failed to initialize ZAI:', error)
    }
  }

  async analyzeCommunication(communication: CommunicationData): Promise<ThreatDetectionResult[]> {
    try {
      if (!this.zai) {
        await this.initializeZAI()
      }

      const threats: ThreatDetectionResult[] = []

      // Analyze for different threat types
      const fraudResult = await this.detectFraud(communication)
      if (fraudResult) threats.push(fraudResult)

      const harassmentResult = await this.detectHarassment(communication)
      if (harassmentResult) threats.push(harassmentResult)

      const burnoutResult = await this.detectBurnout(communication)
      if (burnoutResult) threats.push(burnoutResult)

      const leakageResult = await this.detectInformationLeakage(communication)
      if (leakageResult) threats.push(leakageResult)

      const dissatisfactionResult = await this.detectDissatisfaction(communication)
      if (dissatisfactionResult) threats.push(dissatisfactionResult)

      return threats
    } catch (error) {
      console.error('Error analyzing communication:', error)
      return []
    }
  }

  private async detectFraud(communication: CommunicationData): Promise<ThreatDetectionResult | null> {
    try {
      const prompt = `
        Analyze the following communication for potential fraud indicators. 
        Look for patterns such as:
        - Unusual transaction requests
        - Pressure tactics or urgency
        - Requests for sensitive information
        - Suspicious links or attachments
        - Impersonation attempts
        
        Communication: "${communication.content}"
        Language: ${communication.language}
        
        Respond with a JSON object containing:
        - isFraud: boolean
        - confidence: number (0-1)
        - severity: "LOW", "MEDIUM", "HIGH", or "CRITICAL"
        - explanation: string
        - indicators: array of strings
      `

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert fraud detection AI. Analyze communications for fraud indicators and respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })

      const result = JSON.parse(response.choices[0].message.content)

      if (result.isFraud && result.confidence > 0.6) {
        return {
          type: 'FRAUD',
          severity: result.severity,
          title: 'Potential Fraud Detected',
          description: result.explanation,
          confidence: result.confidence,
          metadata: {
            indicators: result.indicators,
            communicationType: communication.type,
            language: communication.language
          }
        }
      }

      return null
    } catch (error) {
      console.error('Error detecting fraud:', error)
      return null
    }
  }

  private async detectHarassment(communication: CommunicationData): Promise<ThreatDetectionResult | null> {
    try {
      const prompt = `
        Analyze the following communication for potential harassment or bullying. 
        Consider:
        - Inappropriate language or slurs
        - Personal attacks or insults
        - Threats or intimidation
        - Discriminatory content
        - Unwanted advances
        
        Communication: "${communication.content}"
        Language: ${communication.language}
        
        Respond with a JSON object containing:
        - isHarassment: boolean
        - confidence: number (0-1)
        - severity: "LOW", "MEDIUM", "HIGH", or "CRITICAL"
        - explanation: string
        - indicators: array of strings
      `

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert harassment detection AI. Analyze communications for harassment indicators and respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })

      const result = JSON.parse(response.choices[0].message.content)

      if (result.isHarassment && result.confidence > 0.7) {
        return {
          type: 'HARASSMENT',
          severity: result.severity,
          title: 'Potential Harassment Detected',
          description: result.explanation,
          confidence: result.confidence,
          metadata: {
            indicators: result.indicators,
            communicationType: communication.type,
            language: communication.language
          }
        }
      }

      return null
    } catch (error) {
      console.error('Error detecting harassment:', error)
      return null
    }
  }

  private async detectBurnout(communication: CommunicationData): Promise<ThreatDetectionResult | null> {
    try {
      const prompt = `
        Analyze the following communication for potential employee burnout indicators. 
        Look for:
        - Expressions of exhaustion or overwhelm
        - Negative sentiment about work
        - Mention of excessive workload
        - Signs of stress or anxiety
        - Decreased engagement or motivation
        
        Communication: "${communication.content}"
        Language: ${communication.language}
        
        Respond with a JSON object containing:
        - isBurnoutIndicator: boolean
        - confidence: number (0-1)
        - severity: "LOW", "MEDIUM", "HIGH", or "CRITICAL"
        - explanation: string
        - indicators: array of strings
      `

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert in detecting employee burnout. Analyze communications for burnout indicators and respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })

      const result = JSON.parse(response.choices[0].message.content)

      if (result.isBurnoutIndicator && result.confidence > 0.6) {
        return {
          type: 'BURNOUT',
          severity: result.severity,
          title: 'Employee Burnout Indicators',
          description: result.explanation,
          confidence: result.confidence,
          metadata: {
            indicators: result.indicators,
            communicationType: communication.type,
            language: communication.language
          }
        }
      }

      return null
    } catch (error) {
      console.error('Error detecting burnout:', error)
      return null
    }
  }

  private async detectInformationLeakage(communication: CommunicationData): Promise<ThreatDetectionResult | null> {
    try {
      const prompt = `
        Analyze the following communication for potential information leakage. 
        Look for:
        - Sharing of sensitive company data
        - Customer information being shared inappropriately
        - Confidential business information
        - Personal data of employees or clients
        - Intellectual property being shared
        
        Communication: "${communication.content}"
        Language: ${communication.language}
        
        Respond with a JSON object containing:
        - isInformationLeakage: boolean
        - confidence: number (0-1)
        - severity: "LOW", "MEDIUM", "HIGH", or "CRITICAL"
        - explanation: string
        - indicators: array of strings
      `

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert in detecting information leakage. Analyze communications for data security risks and respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })

      const result = JSON.parse(response.choices[0].message.content)

      if (result.isInformationLeakage && result.confidence > 0.7) {
        return {
          type: 'INFORMATION_LEAKAGE',
          severity: result.severity,
          title: 'Potential Information Leakage',
          description: result.explanation,
          confidence: result.confidence,
          metadata: {
            indicators: result.indicators,
            communicationType: communication.type,
            language: communication.language
          }
        }
      }

      return null
    } catch (error) {
      console.error('Error detecting information leakage:', error)
      return null
    }
  }

  private async detectDissatisfaction(communication: CommunicationData): Promise<ThreatDetectionResult | null> {
    try {
      const prompt = `
        Analyze the following communication for potential employee dissatisfaction. 
        Look for:
        - Negative sentiment about company or management
        - Expressions of frustration or anger
        - Mention of wanting to leave or quit
        - Complaints about work environment
        - Lack of engagement or enthusiasm
        
        Communication: "${communication.content}"
        Language: ${communication.language}
        
        Respond with a JSON object containing:
        - isDissatisfaction: boolean
        - confidence: number (0-1)
        - severity: "LOW", "MEDIUM", "HIGH", or "CRITICAL"
        - explanation: string
        - indicators: array of strings
      `

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert in detecting employee dissatisfaction. Analyze communications for dissatisfaction indicators and respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })

      const result = JSON.parse(response.choices[0].message.content)

      if (result.isDissatisfaction && result.confidence > 0.6) {
        return {
          type: 'DISSATISFACTION',
          severity: result.severity,
          title: 'Employee Dissatisfaction Detected',
          description: result.explanation,
          confidence: result.confidence,
          metadata: {
            indicators: result.indicators,
            communicationType: communication.type,
            language: communication.language
          }
        }
      }

      return null
    } catch (error) {
      console.error('Error detecting dissatisfaction:', error)
      return null
    }
  }

  async generateRecommendations(threat: any): Promise<any[]> {
    try {
      if (!this.zai) {
        await this.initializeZAI()
      }

      const prompt = `
        Based on the following threat detection, generate actionable recommendations to address the issue.
        
        Threat Type: ${threat.type}
        Severity: ${threat.severity}
        Description: ${threat.description}
        Confidence: ${threat.confidence}
        Language: ${threat.metadata?.language || 'en'}
        
        Respond with a JSON object containing an array of recommendations, each with:
        - type: "POLICY_UPDATE", "TRAINING", "INVESTIGATION", "SYSTEM_CONFIG", or "COMMUNICATION_GUIDELINE"
        - title: string
        - description: string
        - priority: "LOW", "MEDIUM", "HIGH", or "URGENT"
        - steps: array of strings
        - language: string
      `

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert in threat mitigation and organizational security. Generate actionable recommendations and respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4
      })

      const result = JSON.parse(response.choices[0].message.content)
      
      return result.recommendations || []
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return []
    }
  }
}

export const threatDetectionService = new ThreatDetectionService()