"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Settings, 
  Plus, 
  Trash2, 
  TestTube, 
  Brain, 
  CheckCircle, 
  XCircle,
  Zap,
  Shield,
  MessageSquare,
  BarChart3
} from "lucide-react"

// Define types locally instead of importing from service
interface AIModel {
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

interface AIModelConfig {
  models: AIModel[]
  defaultModel: string
  fallbackModel: string
}

export default function AIModelsPage() {
  const [config, setConfig] = useState<AIModelConfig | null>(null)
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<{modelId: string, status: 'success' | 'error', message: string}[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Add Model dialog state
  const [isAddModelDialogOpen, setIsAddModelDialogOpen] = useState(false)
  const [newModel, setNewModel] = useState({
    name: '',
    provider: 'openai' as AIModel['provider'],
    model: '',
    apiKey: '',
    baseUrl: '',
    enabled: true,
    capabilities: ['text-generation'],
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/ai-models')
      const data = await response.json()
      if (data.success) {
        setConfig(data.config)
      }
    } catch (error) {
      console.error('Error loading AI models config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleModel = async (modelId: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateModel',
          modelId,
          updates: { enabled }
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setConfig(data.config)
      }
    } catch (error) {
      console.error('Error toggling model:', error)
    }
  }

  const handleSetDefault = async (modelId: string) => {
    try {
      const response = await fetch('/api/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateConfig',
          defaultModel: modelId
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setConfig(data.config)
      }
    } catch (error) {
      console.error('Error setting default model:', error)
    }
  }

  const handleSetFallback = async (modelId: string) => {
    try {
      const response = await fetch('/api/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateConfig',
          fallbackModel: modelId
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setConfig(data.config)
      }
    } catch (error) {
      console.error('Error setting fallback model:', error)
    }
  }

  const handleRemoveModel = async (modelId: string) => {
    try {
      const response = await fetch('/api/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'removeModel',
          modelId
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setConfig(data.config)
      }
    } catch (error) {
      console.error('Error removing model:', error)
    }
  }

  const testModel = async (model: AIModel) => {
    setIsTesting(true)
    try {
      const response = await fetch('/api/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateText',
          prompt: 'Hello, please respond with "Test successful"',
          options: {
            modelId: model.id,
            maxTokens: 10
          }
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setTestResults(prev => [...prev, {
          modelId: model.id,
          status: 'success',
          message: `Model responded: ${data.result}`
        }])
      } else {
        setTestResults(prev => [...prev, {
          modelId: model.id,
          status: 'error',
          message: `Error: ${data.error}`
        }])
      }
    } catch (error) {
      setTestResults(prev => [...prev, {
        modelId: model.id,
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }])
    } finally {
      setIsTesting(false)
    }
  }

  const testAllModels = async () => {
    setIsTesting(true)
    setTestResults([])
    
    if (!config) return
    
    const enabledModels = config.models.filter(m => m.enabled)
    
    for (const model of enabledModels) {
      try {
        await testModel(model)
      } catch (error) {
        console.error(`Error testing ${model.name}:`, error)
      }
    }
    
    setIsTesting(false)
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return <Brain className="h-4 w-4" />
      case 'google': return <BarChart3 className="h-4 w-4" />
      case 'deepseek': return <Zap className="h-4 w-4" />
      case 'anthropic': return <Shield className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getCapabilityIcon = (capability: string) => {
    switch (capability) {
      case 'threat-detection': return <Shield className="h-3 w-3" />
      case 'text-generation': return <MessageSquare className="h-3 w-3" />
      case 'analysis': return <BarChart3 className="h-3 w-3" />
      default: return <Brain className="h-3 w-3" />
    }
  }

  // Form handlers for Add Model dialog
  const handleAddModel = () => {
    if (!newModel.name || !newModel.model) {
      alert('Please fill in the required fields (Model Name and Model ID)')
      return
    }

    const modelToAdd: AIModel = {
      id: newModel.model.toLowerCase().replace(/\s+/g, '-'),
      ...newModel
    }

    // Add the model via API
    fetch('/api/ai-models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'addModel',
        model: modelToAdd
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        loadConfig()
        setIsAddModelDialogOpen(false)
        setNewModel({
          name: '',
          provider: 'openai',
          model: '',
          apiKey: '',
          baseUrl: '',
          enabled: true,
          capabilities: ['text-generation'],
          maxTokens: 4096,
          temperature: 0.7,
          topP: 1.0,
          frequencyPenalty: 0,
          presencePenalty: 0
        })
        alert(`Model "${newModel.name}" added successfully!`)
      } else {
        alert(`Failed to add model: ${data.error}`)
      }
    })
    .catch(error => {
      console.error('Error adding model:', error)
      alert('Failed to add model. Please try again.')
    })
  }

  const handleInputChange = (field: string, value: string | number | boolean | string[]) => {
    setNewModel(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading AI Models...</p>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Failed to load AI models configuration</p>
          <Button onClick={loadConfig} className="mt-4">Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative w-8 h-8">
              <img src="/probus-logo.png" alt="Probus Engine" className="w-full h-full" />
            </div>
            <h1 className="text-2xl font-bold">Probus Engine</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">AI Models Configuration</h2>
            <p className="text-muted-foreground">
              Manage and configure AI models for threat detection and analysis
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={testAllModels}
              disabled={isTesting}
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isTesting ? 'Testing...' : 'Test All Models'}
            </Button>
            <Dialog open={isAddModelDialogOpen} onOpenChange={setIsAddModelDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Model
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New AI Model</DialogTitle>
                  <DialogDescription>
                    Configure a new AI model for threat detection and analysis
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="modelName">Model Name</Label>
                      <Input 
                        id="modelName" 
                        placeholder="e.g., Custom GPT-4" 
                        value={newModel.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="provider">Provider</Label>
                      <Select value={newModel.provider} onValueChange={(value) => handleInputChange('provider', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="deepseek">DeepSeek</SelectItem>
                          <SelectItem value="anthropic">Anthropic</SelectItem>
                          <SelectItem value="cohere">Cohere</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="modelId">Model ID</Label>
                    <Input 
                      id="modelId" 
                      placeholder="e.g., gpt-4" 
                      value={newModel.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input 
                      id="apiKey" 
                      type="password" 
                      placeholder="Enter API key"
                      value={newModel.apiKey}
                      onChange={(e) => handleInputChange('apiKey', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="baseUrl">Base URL (Optional)</Label>
                    <Input 
                      id="baseUrl" 
                      placeholder="Custom API endpoint"
                      value={newModel.baseUrl}
                      onChange={(e) => handleInputChange('baseUrl', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="maxTokens">Max Tokens</Label>
                      <Input 
                        id="maxTokens" 
                        type="number" 
                        value={newModel.maxTokens}
                        onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="temperature">Temperature</Label>
                      <Input 
                        id="temperature" 
                        type="number" 
                        step="0.1" 
                        value={newModel.temperature}
                        onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="topP">Top P</Label>
                      <Input 
                        id="topP" 
                        type="number" 
                        step="0.1" 
                        value={newModel.topP}
                        onChange={(e) => handleInputChange('topP', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Add Model</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="models" className="space-y-4">
          <TabsList>
            <TabsTrigger value="models">AI Models</TabsTrigger>
            <TabsTrigger value="settings">Global Settings</TabsTrigger>
            <TabsTrigger value="testing">Testing Results</TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {config.models.map((model) => (
                <Card key={model.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getProviderIcon(model.provider)}
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                      </div>
                      <Switch
                        checked={model.enabled}
                        onCheckedChange={(checked) => handleToggleModel(model.id, checked)}
                      />
                    </div>
                    <CardDescription className="text-sm">
                      {model.provider} • {model.model}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {model.capabilities.map((capability) => (
                        <Badge key={capability} variant="secondary" className="text-xs">
                          {getCapabilityIcon(capability)}
                          <span className="ml-1">{capability}</span>
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Tokens:</span>
                        <span>{model.maxTokens}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temperature:</span>
                        <span>{model.temperature}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {model.id === config.defaultModel && (
                        <Badge variant="default">Default</Badge>
                      )}
                      {model.id === config.fallbackModel && (
                        <Badge variant="secondary">Fallback</Badge>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => testModel(model)}
                        disabled={isTesting || !model.enabled}
                      >
                        <TestTube className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedModel(model)}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>

                    {model.id !== config.defaultModel && model.id !== config.fallbackModel && (
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => handleRemoveModel(model.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Default Model</CardTitle>
                  <CardDescription>
                    Primary model used for AI operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={config.defaultModel} onValueChange={handleSetDefault}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {config.models.filter(m => m.enabled).map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fallback Model</CardTitle>
                  <CardDescription>
                    Backup model when default fails
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={config.fallbackModel} onValueChange={handleSetFallback}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {config.models.filter(m => m.enabled).map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="testing" className="space-y-4">
            {testResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Test Results</h3>
                {testResults.map((result, index) => {
                  const model = config.models.find(m => m.id === result.modelId)
                  return (
                    <Alert key={index} className={result.status === 'success' ? 'border-green-200' : 'border-red-200'}>
                      <div className="flex items-center space-x-2">
                        {result.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{model?.name}</span>
                            <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                              {result.status}
                            </Badge>
                          </div>
                          <AlertDescription className="text-sm">
                            {result.message}
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  )
                })}
              </div>
            )}
            
            {testResults.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <TestTube className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Test Results</h3>
                  <p className="text-muted-foreground text-center">
                    Test your AI models to ensure they are working correctly.
                    Click "Test All Models" to get started.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}