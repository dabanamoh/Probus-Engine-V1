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
  Plus, 
  Settings, 
  Trash2, 
  Play, 
  Pause, 
  BarChart3, 
  Users, 
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { CustomApplicationService, CustomApplication, AnalysisResult } from "@/lib/services/custom-applications"

export default function CustomApplicationsPage() {
  const [service] = useState(() => CustomApplicationService.getInstance())
  const [applications, setApplications] = useState<CustomApplication[]>([])
  const [selectedApplication, setSelectedApplication] = useState<CustomApplication | null>(null)
  const [analysisResults, setAnalysisResults] = useState<Map<string, AnalysisResult>>(new Map())
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Form state for adding new applications
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'custom',
    description: '',
    dataSourceName: '',
    dataSourceType: 'api',
    endpoint: ''
  })

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = () => {
    setApplications(service.getApplications())
  }

  const handleToggleApplication = (id: string, enabled: boolean) => {
    if (enabled) {
      service.enableApplication(id)
    } else {
      service.disableApplication(id)
    }
    loadApplications()
  }

  const handleRemoveApplication = (id: string) => {
    service.removeApplication(id)
    loadApplications()
    setAnalysisResults(prev => {
      const newResults = new Map(prev)
      newResults.delete(id)
      return newResults
    })
  }

  const analyzeApplication = async (id: string) => {
    setIsAnalyzing(true)
    try {
      const result = await service.analyzeApplication(id)
      setAnalysisResults(prev => new Map(prev).set(id, result))
    } catch (error) {
      console.error('Error analyzing application:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeAllApplications = async () => {
    setIsAnalyzing(true)
    const enabledApplications = applications.filter(app => app.enabled)
    
    for (const app of enabledApplications) {
      try {
        await analyzeApplication(app.id)
      } catch (error) {
        console.error(`Error analyzing ${app.name}:`, error)
      }
    }
    
    setIsAnalyzing(false)
  }

  const getApplicationIcon = (type: string) => {
    switch (type) {
      case 'attendance': return <Clock className="h-5 w-5" />
      case 'leave': return <Calendar className="h-5 w-5" />
      case 'performance': return <BarChart3 className="h-5 w-5" />
      default: return <Users className="h-5 w-5" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3" />
      case 'down': return <TrendingDown className="h-3 w-3" />
      default: return null
    }
  }

  const templates = service.getApplicationTemplates()

  // Form handlers
  const handleUseTemplate = (template: any) => {
    setSelectedTemplate(template)
    setFormData({
      name: template.name,
      type: template.type,
      description: template.description,
      dataSourceName: '',
      dataSourceType: 'api',
      endpoint: ''
    })
    alert(`Template "${template.name}" selected! This would pre-fill the form with template-specific configuration.`)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create new application from form data
    const newApplication = service.addApplication({
      name: formData.name,
      description: formData.description,
      type: formData.type as any,
      enabled: true,
      config: {
        dataSources: [{
          id: Math.random().toString(36).substr(2, 9),
          name: formData.dataSourceName,
          type: formData.dataSourceType as any,
          endpoint: formData.endpoint,
          frequency: 'daily'
        }],
        schedule: {
          enabled: true,
          frequency: 'daily'
        },
        thresholds: [],
        notifications: {
          enabled: true,
          channels: ['email'],
          recipients: ['admin@company.com']
        }
      },
      analysisRules: selectedTemplate?.analysisRules || []
    })

    loadApplications()
    setIsDialogOpen(false)
    setSelectedTemplate(null)
    setFormData({
      name: '',
      type: 'custom',
      description: '',
      dataSourceName: '',
      dataSourceType: 'api',
      endpoint: ''
    })
    
    alert(`Application "${newApplication.name}" created successfully!`)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
            <h2 className="text-3xl font-bold tracking-tight">Custom Applications</h2>
            <p className="text-muted-foreground">
              Monitor and analyze custom application data for threat detection
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={analyzeAllApplications}
              disabled={isAnalyzing}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze All'}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Application
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Custom Application</DialogTitle>
                  <DialogDescription>
                    Configure a new custom application for analysis and monitoring
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <form onSubmit={handleFormSubmit}>
                    <Tabs defaultValue="templates" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="templates">Use Template</TabsTrigger>
                      <TabsTrigger value="custom">Custom Configuration</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="templates" className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        {templates.map((template, index) => (
                          <Card key={index} className="cursor-pointer hover:bg-accent/50">
                            <CardHeader>
                              <div className="flex items-center space-x-2">
                                {getApplicationIcon(template.type)}
                                <div>
                                  <CardTitle className="text-lg">{template.name}</CardTitle>
                                  <CardDescription>{template.description}</CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline">{template.type}</Badge>
                                <Button size="sm" onClick={() => handleUseTemplate(template)}>Use Template</Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="custom" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="appName">Application Name</Label>
                          <Input 
                            id="appName" 
                            placeholder="e.g., Custom HR System" 
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="appType">Application Type</Label>
                          <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="attendance">Attendance Tracking</SelectItem>
                              <SelectItem value="leave">Leave Management</SelectItem>
                              <SelectItem value="performance">Performance Monitoring</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="appDescription">Description</Label>
                        <Input 
                          id="appDescription" 
                          placeholder="Describe what this application monitors" 
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Data Sources</h4>
                        <div className="border rounded-lg p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="dataSourceName">Source Name</Label>
                              <Input 
                                id="dataSourceName" 
                                placeholder="e.g., HR Database" 
                                value={formData.dataSourceName}
                                onChange={(e) => handleInputChange('dataSourceName', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="dataSourceType">Type</Label>
                              <Select value={formData.dataSourceType} onValueChange={(value) => handleInputChange('dataSourceType', value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="api">API</SelectItem>
                                  <SelectItem value="database">Database</SelectItem>
                                  <SelectItem value="file">File</SelectItem>
                                  <SelectItem value="webhook">Webhook</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="endpoint">Endpoint/Path</Label>
                            <Input 
                              id="endpoint" 
                              placeholder="API endpoint or file path" 
                              value={formData.endpoint}
                              onChange={(e) => handleInputChange('endpoint', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Application</Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="applications" className="space-y-4">
          <TabsList>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="results">Analysis Results</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {applications.map((application) => {
                const result = analysisResults.get(application.id)
                return (
                  <Card key={application.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getApplicationIcon(application.type)}
                          <CardTitle className="text-lg">{application.name}</CardTitle>
                        </div>
                        <Switch
                          checked={application.enabled}
                          onCheckedChange={(checked) => handleToggleApplication(application.id, checked)}
                        />
                      </div>
                      <CardDescription className="text-sm">
                        {application.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Type:</span>
                        <Badge variant="outline">{application.type}</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Data Sources:</span>
                        <span className="text-sm">{application.config.dataSources.length}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Analysis Rules:</span>
                        <span className="text-sm">{application.analysisRules.filter(r => r.enabled).length}</span>
                      </div>

                      {result && (
                        <div className="pt-3 border-t space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Overall Risk:</span>
                            <Badge className={getSeverityColor(result.overallRisk)}>
                              {result.overallRisk}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Anomalies:</span>
                            <span className="text-sm">{result.anomalies.length}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Threats:</span>
                            <span className="text-sm">{result.threats.length}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => analyzeApplication(application.id)}
                          disabled={isAnalyzing || !application.enabled}
                        >
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Analyze
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedApplication(application)}
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => handleRemoveApplication(application.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {applications.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Applications Configured</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Add custom applications to monitor and analyze for threats
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Application
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {analysisResults.size > 0 ? (
              <div className="space-y-4">
                {Array.from(analysisResults.entries()).map(([appId, result]) => {
                  const application = applications.find(app => app.id === appId)
                  if (!application) return null

                  return (
                    <Card key={appId}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getApplicationIcon(application.type)}
                            <div>
                              <CardTitle>{application.name}</CardTitle>
                              <CardDescription>
                                Analysis from {result.timestamp.toLocaleString()}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={getSeverityColor(result.overallRisk)}>
                            Overall Risk: {result.overallRisk}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Metrics */}
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Metrics</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {result.metrics.map((metric, index) => (
                              <div key={index} className="border rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">{metric.name}</span>
                                  <div className="flex items-center space-x-1">
                                    {getTrendIcon(metric.trend)}
                                    <span className={`text-xs ${
                                      metric.trend === 'up' ? 'text-red-600' : 
                                      metric.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                                    }`}>
                                      {metric.change > 0 ? '+' : ''}{metric.change}%
                                    </span>
                                  </div>
                                </div>
                                <div className="text-lg font-bold">{metric.value} {metric.unit}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Anomalies */}
                        {result.anomalies.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Anomalies Detected</h4>
                            <div className="space-y-2">
                              {result.anomalies.map((anomaly) => (
                                <Alert key={anomaly.id} className={getSeverityColor(anomaly.severity)}>
                                  <AlertTriangle className="h-4 w-4" />
                                  <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-medium">{anomaly.type}</span>
                                      <Badge variant="outline">
                                        {Math.round(anomaly.confidence * 100)}% confidence
                                      </Badge>
                                    </div>
                                    <AlertDescription>{anomaly.description}</AlertDescription>
                                  </div>
                                </Alert>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Threats */}
                        {result.threats.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Threats Detected</h4>
                            <div className="space-y-2">
                              {result.threats.map((threat) => (
                                <Alert key={threat.id} className={getSeverityColor(threat.severity)}>
                                  <AlertTriangle className="h-4 w-4" />
                                  <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-medium">{threat.type}</span>
                                      <Badge variant="outline">
                                        {Math.round(threat.confidence * 100)}% confidence
                                      </Badge>
                                    </div>
                                    <AlertDescription>{threat.description}</AlertDescription>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Affected: {threat.affectedUsers.join(', ')}
                                    </div>
                                  </div>
                                </Alert>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Analysis Results</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Run analysis on your applications to see results
                  </p>
                  <Button onClick={analyzeAllApplications} disabled={isAnalyzing}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analyze All Applications
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template, index) => (
                <Card key={index} className="cursor-pointer hover:bg-accent/50">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      {getApplicationIcon(template.type)}
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Type:</span>
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Rules:</span>
                        <span className="text-sm">{template.analysisRules.length}</span>
                      </div>
                      <Button className="w-full" size="sm">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}