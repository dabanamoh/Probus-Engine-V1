// Client-side version of AI Models service - doesn't use ZAI SDK
export interface AIModel {
  id: string
  name: string
  provider: 'openai' | 'google' | 'deepseek' | 'anthropic' | 'cohere' | 'custom'
  model: string
  apiKey?: string
  baseUrl?: string
  enabled: boolean
  capabilities: string[]
  maxTokens?: number
  temperature?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

export interface AIModelConfig {
  models: AIModel[]
  defaultModel: string
  fallbackModel: string
}

export class AIModelService {
  private static instance: AIModelService
  private config: AIModelConfig

  private constructor() {
    this.config = this.getDefaultConfig()
  }

  static getInstance(): AIModelService {
    if (!AIModelService.instance) {
      AIModelService.instance = new AIModelService()
    }
    return AIModelService.instance
  }

  private getDefaultConfig(): AIModelConfig {
    return {
      models: [
        {
          id: 'gpt-4',
          name: 'GPT-4',
          provider: 'openai',
          model: 'gpt-4',
          enabled: true,
          capabilities: ['text-generation', 'analysis', 'threat-detection'],
          maxTokens: 4096,
          temperature: 0.7,
          topP: 1.0,
          frequencyPenalty: 0,
          presencePenalty: 0
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          enabled: true,
          capabilities: ['text-generation', 'analysis'],
          maxTokens: 4096,
          temperature: 0.7,
          topP: 1.0
        },
        {
          id: 'gemini-pro',
          name: 'Gemini Pro',
          provider: 'google',
          model: 'gemini-pro',
          enabled: true,
          capabilities: ['text-generation', 'analysis', 'threat-detection'],
          maxTokens: 8192,
          temperature: 0.7,
          topP: 1.0
        },
        {
          id: 'deepseek-chat',
          name: 'DeepSeek Chat',
          provider: 'deepseek',
          model: 'deepseek-chat',
          enabled: true,
          capabilities: ['text-generation', 'analysis'],
          maxTokens: 4096,
          temperature: 0.7,
          topP: 1.0
        },
        {
          id: 'claude-3',
          name: 'Claude 3',
          provider: 'anthropic',
          model: 'claude-3-sonnet-20240229',
          enabled: true,
          capabilities: ['text-generation', 'analysis', 'threat-detection'],
          maxTokens: 4096,
          temperature: 0.7,
          topP: 1.0
        }
      ],
      defaultModel: 'gpt-4',
      fallbackModel: 'gpt-3.5-turbo'
    }
  }

  getConfig(): AIModelConfig {
    return this.config
  }

  updateConfig(config: Partial<AIModelConfig>): void {
    this.config = { ...this.config, ...config }
  }

  addModel(model: AIModel): void {
    this.config.models.push(model)
  }

  updateModel(modelId: string, updates: Partial<AIModel>): void {
    const index = this.config.models.findIndex(m => m.id === modelId)
    if (index !== -1) {
      this.config.models[index] = { ...this.config.models[index], ...updates }
    }
  }

  removeModel(modelId: string): void {
    this.config.models = this.config.models.filter(m => m.id !== modelId)
  }

  getModel(modelId: string): AIModel | undefined {
    return this.config.models.find(m => m.id === modelId)
  }

  getEnabledModels(): AIModel[] {
    return this.config.models.filter(m => m.enabled)
  }

  getModelsByCapability(capability: string): AIModel[] {
    return this.config.models.filter(m => 
      m.enabled && m.capabilities.includes(capability)
    )
  }

  // Client-side methods that make API calls to server
  async generateText(
    prompt: string,
    options: {
      modelId?: string
      systemPrompt?: string
      temperature?: number
      maxTokens?: number
    } = {}
  ): Promise<string> {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        options
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate text')
    }

    const data = await response.json()
    return data.text
  }

  async analyzeThreat(
    content: string,
    threatTypes: string[] = ['harassment', 'fraud', 'information_leakage']
  ): Promise<{
    threats: Array<{
      type: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      confidence: number
      description: string
      evidence: string[]
    }>
    overallRisk: 'low' | 'medium' | 'high' | 'critical'
  }> {
    const response = await fetch('/api/ai/analyze-threat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        threatTypes
      })
    })

    if (!response.ok) {
      throw new Error('Failed to analyze threat')
    }

    const data = await response.json()
    return data.analysis
  }

  async testModel(modelId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch('/api/ai/test-model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ modelId })
    })

    if (!response.ok) {
      return {
        success: false,
        message: 'Failed to test model'
      }
    }

    const data = await response.json()
    return {
      success: data.success,
      message: data.message
    }
  }
}