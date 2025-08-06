import { NextRequest, NextResponse } from 'next/server'
import { AIModelService } from '@/lib/services/ai-models'

// This is a server-side only route - it can safely use the z-ai-web-dev-sdk

export async function GET(request: NextRequest) {
  try {
    const service = AIModelService.getInstance()
    const config = service.getConfig()
    
    return NextResponse.json({
      success: true,
      config
    })
  } catch (error) {
    console.error('Error getting AI models config:', error)
    return NextResponse.json(
      { error: 'Failed to get AI models configuration' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json()
    const service = AIModelService.getInstance()
    
    switch (action) {
      case 'updateConfig':
        service.updateConfig(data)
        break
        
      case 'addModel':
        service.addModel(data.model)
        break
        
      case 'updateModel':
        service.updateModel(data.modelId, data.updates)
        break
        
      case 'removeModel':
        service.removeModel(data.modelId)
        break
        
      case 'generateText':
        const result = await service.generateText(data.prompt, data.options)
        return NextResponse.json({
          success: true,
          result
        })
        
      case 'analyzeThreat':
        const threatAnalysis = await service.analyzeThreat(data.content, data.threatTypes)
        return NextResponse.json({
          success: true,
          analysis: threatAnalysis
        })
        
      case 'generateRecommendations':
        const recommendations = await service.generateRecommendations(data.threats, data.context)
        return NextResponse.json({
          success: true,
          recommendations
        })
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
    
    const config = service.getConfig()
    return NextResponse.json({
      success: true,
      config
    })
  } catch (error) {
    console.error('Error in AI models API:', error)
    return NextResponse.json(
      { error: 'Failed to process AI models request' },
      { status: 500 }
    )
  }
}