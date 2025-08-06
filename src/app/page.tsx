"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield, 
  Mail, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  BarChart3,
  Settings,
  TestTube,
  Plus
} from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/contexts/auth-context"

function Dashboard() {
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  
  // Mock data for demonstration
  const threatStats = {
    total: 24,
    critical: 3,
    high: 8,
    medium: 10,
    low: 3
  }

  const recentThreats = [
    {
      id: "1",
      type: "HARASSMENT",
      severity: "HIGH",
      title: "Inappropriate language detected",
      description: "Detected harassment pattern in team chat",
      source: "Slack",
      timestamp: "2 hours ago",
      language: "en"
    },
    {
      id: "2",
      type: "INFORMATION_LEAKAGE",
      severity: "CRITICAL",
      title: "Sensitive data shared externally",
      description: "Customer data shared in email thread",
      source: "Gmail",
      timestamp: "4 hours ago",
      language: "en"
    },
    {
      id: "3",
      type: "BURNOUT",
      severity: "MEDIUM",
      title: "Employee burnout indicators",
      description: "Decreased productivity and late hours detected",
      source: "Teams",
      timestamp: "1 day ago",
      language: "en"
    }
  ]

  const integrations = [
    { name: "Gmail", type: "EMAIL", status: "ACTIVE", lastSync: "5 min ago" },
    { name: "Slack", type: "CHAT", status: "ACTIVE", lastSync: "2 min ago" },
    { name: "Microsoft Teams", type: "CHAT", status: "ACTIVE", lastSync: "10 min ago" }
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "destructive"
      case "HIGH": return "destructive"
      case "MEDIUM": return "secondary"
      case "LOW": return "outline"
      default: return "outline"
    }
  }

  const getThreatIcon = (type: string) => {
    switch (type) {
      case "HARASSMENT": return <AlertTriangle className="h-4 w-4" />
      case "INFORMATION_LEAKAGE": return <Shield className="h-4 w-4" />
      case "BURNOUT": return <Users className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
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
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent border rounded px-2 py-1 text-sm"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文</option>
              </select>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                window.location.href = "/settings"
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Threats</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{threatStats.total}</div>
              <p className="text-xs text-muted-foreground">+12% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{threatStats.critical}</div>
              <p className="text-xs text-muted-foreground">Requires immediate action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{threatStats.high}</div>
              <p className="text-xs text-muted-foreground">Address within 24h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrations.length}</div>
              <p className="text-xs text-muted-foreground">All systems connected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Languages</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Multi-language support</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="threats" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="threats">Threats</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="ai-models">AI Models</TabsTrigger>
            <TabsTrigger value="custom-apps">Custom Apps</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="threats" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent Threats */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Threats</CardTitle>
                  <CardDescription>Latest detected threats requiring attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentThreats.map((threat) => (
                    <Alert key={threat.id} className="border-l-4 border-l-red-500">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getThreatIcon(threat.type)}
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold">{threat.title}</h4>
                              <Badge variant={getSeverityColor(threat.severity)}>
                                {threat.severity}
                              </Badge>
                            </div>
                            <AlertDescription className="text-sm">
                              {threat.description}
                            </AlertDescription>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                {threat.type === "HARASSMENT" ? <MessageSquare className="h-3 w-3 mr-1" /> : 
                                 threat.type === "INFORMATION_LEAKAGE" ? <Mail className="h-3 w-3 mr-1" /> :
                                 <Users className="h-3 w-3 mr-1" />}
                                {threat.source}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {threat.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.location.href = `/threat/${threat.id}`}
                        >
                          View
                        </Button>
                      </div>
                    </Alert>
                  ))}
                </CardContent>
              </Card>

              {/* Threat Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Threat Distribution</CardTitle>
                  <CardDescription>Breakdown by type and severity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Harassment</span>
                        <span>35%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: "35%" }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Information Leakage</span>
                        <span>25%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: "25%" }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Employee Burnout</span>
                        <span>20%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "20%" }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Fraud</span>
                        <span>15%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "15%" }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Dissatisfaction</span>
                        <span>5%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "5%" }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="communications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Communication Analysis</CardTitle>
                <CardDescription>Overview of analyzed communications across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Mail className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <h3 className="font-semibold">Email Analysis</h3>
                    <p className="text-2xl font-bold">1,247</p>
                    <p className="text-sm text-muted-foreground">Emails analyzed</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <h3 className="font-semibold">Chat Analysis</h3>
                    <p className="text-2xl font-bold">3,891</p>
                    <p className="text-sm text-muted-foreground">Messages analyzed</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Globe className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <h3 className="font-semibold">Languages</h3>
                    <p className="text-2xl font-bold">5</p>
                    <p className="text-sm text-muted-foreground">Languages detected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Integrations</CardTitle>
                <CardDescription>Connected communication platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {integrations.map((integration, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded">
                          {integration.type === "EMAIL" ? 
                            <Mail className="h-5 w-5" /> : 
                            <MessageSquare className="h-5 w-5" />
                          }
                        </div>
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Last sync: {integration.lastSync}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={integration.status === "ACTIVE" ? "default" : "secondary"}>
                          {integration.status}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => window.location.href = '/integrations'}>
                          Configure
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full" variant="outline" onClick={() => window.location.href = '/integrations'}>
                    + Add Integration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-models" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* AI Models Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Models Status</CardTitle>
                  <CardDescription>Overview of configured AI models</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active Models</span>
                      <Badge variant="default">4/5</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Default Model</span>
                      <Badge variant="secondary">GPT-4</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Fallback Model</span>
                      <Badge variant="outline">GPT-3.5 Turbo</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>OpenAI Models</span>
                        <span>2</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "40%" }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Google Models</span>
                        <span>1</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "20%" }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>DeepSeek Models</span>
                        <span>1</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: "20%" }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Anthropic Models</span>
                        <span>1</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: "20%" }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Model Capabilities */}
              <Card>
                <CardHeader>
                  <CardTitle>Model Capabilities</CardTitle>
                  <CardDescription>Available AI capabilities across models</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Threat Detection</span>
                      </div>
                      <Badge variant="default">3 Models</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Text Generation</span>
                      </div>
                      <Badge variant="default">5 Models</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Analysis</span>
                      </div>
                      <Badge variant="default">4 Models</Badge>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-2">Model Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Response Time</span>
                          <span className="text-green-600">Excellent</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div className="bg-green-500 h-1 rounded-full" style={{ width: "90%" }}></div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Accuracy</span>
                          <span className="text-green-600">95%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div className="bg-green-500 h-1 rounded-full" style={{ width: "95%" }}></div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Reliability</span>
                          <span className="text-yellow-600">87%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div className="bg-yellow-500 h-1 rounded-full" style={{ width: "87%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common AI model management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => window.location.href = '/ai-models'}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Models
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => {
                      // Simulate testing all models
                      alert('Testing all AI models... This would connect to the AI Models API and run diagnostic tests.')
                    }}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Models
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => window.location.href = '/ai-models'}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Model
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom-apps" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Custom Applications Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Custom Applications</CardTitle>
                  <CardDescription>Monitor custom application data for threats</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Applications</span>
                      <Badge variant="default">3</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active Applications</span>
                      <Badge variant="secondary">2</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Data Sources</span>
                      <Badge variant="outline">8</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Attendance Tracking</span>
                        <span>1</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "33%" }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Leave Management</span>
                        <span>1</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "33%" }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Performance Monitoring</span>
                        <span>1</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: "33%" }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Analysis Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Analysis</CardTitle>
                  <CardDescription>Latest threat detection results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Attendance Analysis</span>
                      </div>
                      <Badge variant="outline">Low Risk</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Leave Patterns</span>
                      </div>
                      <Badge variant="outline">Medium Risk</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Performance Metrics</span>
                      </div>
                      <Badge variant="outline">Low Risk</Badge>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-2">Detection Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Anomalies Detected</span>
                          <span className="text-yellow-600">2</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Threats Identified</span>
                          <span className="text-orange-600">1</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Alerts Generated</span>
                          <span className="text-red-600">3</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common custom application tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => window.location.href = '/custom-applications'}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Apps
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => {
                      // Simulate running analysis
                      alert('Running analysis on all custom applications... This would trigger the analysis process for attendance, leave, and performance monitoring.')
                    }}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Run Analysis
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => window.location.href = '/custom-applications'}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add App
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>Generate and view compliance reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">Threat Summary</CardTitle>
                      <CardDescription>Comprehensive threat analysis report</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" onClick={() => window.location.href = '/reports'}>
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">Compliance Report</CardTitle>
                      <CardDescription>Regulatory compliance status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" onClick={() => window.location.href = '/reports'}>
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">User Activity</CardTitle>
                      <CardDescription>User behavior and patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" onClick={() => window.location.href = '/reports'}>
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function Home() {
  const { user, login, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLogin={login} />
  }

  return <Dashboard />
}