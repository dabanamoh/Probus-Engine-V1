import ZAI from 'z-ai-web-dev-sdk'

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
  private zaiInstance: any

  private constructor() {
    this.config = this.getDefaultConfig()
    this.initializeZAI()
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

  private async initializeZAI() {
    try {
      this.zaiInstance = await ZAI.create()
    } catch (error) {
      console.error('Failed to initialize ZAI:', error)
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

  async generateText(
    prompt: string,
    options: {
      modelId?: string
      systemPrompt?: string
      temperature?: number
      maxTokens?: number
    } = {}
  ): Promise<string> {
    const modelId = options.modelId || this.config.defaultModel
    const model = this.getModel(modelId)
    
    if (!model || !model.enabled) {
      throw new Error(`Model ${modelId} not found or disabled`)
    }

    try {
      const messages = []
      if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt })
      }
      messages.push({ role: 'user', content: prompt })

      const completion = await this.zaiInstance.chat.completions.create({
        messages,
        model: model.model,
        temperature: options.temperature ?? model.temperature,
        max_tokens: options.maxTokens ?? model.maxTokens,
        top_p: model.topP,
        frequency_penalty: model.frequencyPenalty,
        presence_penalty: model.presencePenalty
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error) {
      console.error(`Error with model ${modelId}:`, error)
      
      // Try fallback model
      if (modelId !== this.config.fallbackModel) {
        console.log(`Attempting fallback to ${this.config.fallbackModel}`)
        return this.generateText(prompt, { ...options, modelId: this.config.fallbackModel })
      }
      
      throw error
    }
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
    const capableModels = this.getModelsByCapability('threat-detection')
    const model = capableModels[0] || this.getModel(this.config.defaultModel)

    if (!model) {
      throw new Error('No suitable model found for threat detection')
    }

    const systemPrompt = `You are an advanced threat detection AI. Analyze the provided content for the following threat types: ${threatTypes.join(', ')}. 

For each detected threat, provide:
- Type of threat
- Severity level (low, medium, high, critical)
- Confidence score (0-1)
- Description of the threat
- Specific evidence from the content

Also provide an overall risk assessment for the entire content.

Respond in JSON format with the following structure:
{
  "threats": [
    {
      "type": "threat_type",
      "severity": "severity_level",
      "confidence": 0.0,
      "description": "description",
      "evidence": ["evidence1", "evidence2"]
    }
  ],
  "overallRisk": "risk_level"
}`

    try {
      const response = await this.generateText(content, {
        modelId: model.id,
        systemPrompt,
        temperature: 0.3
      })

      return JSON.parse(response)
    } catch (error) {
      console.error('Error analyzing threat:', error)
      throw error
    }
  }

  async generateRecommendations(
    threats: Array<{
      type: string
      severity: string
      description: string
    }>,
    context: string
  ): Promise<{
    recommendations: Array<{
      priority: 'low' | 'medium' | 'high' | 'critical'
      category: string
      action: string
      description: string
      timeline: string
      resources: string[]
    }>
  }> {
    const capableModels = this.getModelsByCapability('analysis')
    const model = capableModels[0] || this.getModel(this.config.defaultModel)

    if (!model) {
      throw new Error('No suitable model found for generating recommendations')
    }

    const systemPrompt = `You are an expert security and HR consultant. Based on the detected threats and context, generate actionable recommendations.

For each recommendation, provide:
- Priority level (low, medium, high, critical)
- Category (technical, policy, training, monitoring)
- Specific action to take
- Detailed description
- Timeline for implementation
- Required resources

Respond in JSON format with the following structure:
{
  "recommendations": [
    {
      "priority": "priority_level",
      "category": "category",
      "action": "specific_action",
      "description": "detailed_description",
      "timeline": "implementation_timeline",
      "resources": ["resource1", "resource2"]
    }
  ]
}`

    const prompt = `Threats detected:
${threats.map(t => `- ${t.type} (${t.severity}): ${t.description}`).join('\n')}

Context: ${context}

Please generate comprehensive recommendations to address these threats.`

    try {
      const response = await this.generateText(prompt, {
        modelId: model.id,
        systemPrompt,
        temperature: 0.5
      })

      return JSON.parse(response)
    } catch (error) {
      console.error('Error generating recommendations:', error)
      throw error
    }
  }
}