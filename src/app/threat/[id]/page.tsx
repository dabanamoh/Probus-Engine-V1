"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Shield, 
  Mail, 
  MessageSquare, 
  Users, 
  AlertTriangle,
  Clock,
  CheckCircle,
  Settings,
  Download,
  Share
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface Threat {
  id: string
  type: string
  severity: string
  title: string
  description: string
  confidence: number
  status: string
  createdAt: string
  updatedAt: string
  communication?: {
    id: string
    type: string
    content: string
    language: string
    metadata: any
  }
  recommendations: Array<{
    id: string
    type: string
    title: string
    description: string
    priority: string
    status: string
    steps: string[]
  }>
}

export default function ThreatDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [threat, setThreat] = useState<Threat | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchThreatDetails(params.id as string)
    }
  }, [params.id])

  const fetchThreatDetails = async (threatId: string) => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`/api/threats/${threatId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setThreat(data.threat)
      } else {
        setError("Failed to fetch threat details")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const updateThreatStatus = async (status: string) => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`/api/threats/${params.id}/status`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        fetchThreatDetails(params.id as string)
      }
    } catch (error) {
      console.error("Error updating threat status:", error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "destructive"
      case "HIGH": return "destructive"
      case "MEDIUM": return "secondary"
      case "LOW": return "outline"
      default: return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "destructive"
      case "IN_PROGRESS": return "secondary"
      case "RESOLVED": return "default"
      case "FALSE_POSITIVE": return "outline"
      default: return "outline"
    }
  }

  const getThreatIcon = (type: string) => {
    switch (type) {
      case "HARASSMENT": return <AlertTriangle className="h-5 w-5" />
      case "INFORMATION_LEAKAGE": return <Shield className="h-5 w-5" />
      case "BURNOUT": return <Users className="h-5 w-5" />
      case "FRAUD": return <Shield className="h-5 w-5" />
      case "DISSATISFACTION": return <Users className="h-5 w-5" />
      default: return <AlertTriangle className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading threat details...</p>
        </div>
      </div>
    )
  }

  if (error || !threat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error || "Threat not found"}</p>
            <Button className="mt-4" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              {getThreatIcon(threat.type)}
              <h1 className="text-2xl font-bold">Threat Details</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getSeverityColor(threat.severity)}>
              {threat.severity}
            </Badge>
            <Badge variant={getStatusColor(threat.status)}>
              {threat.status.replace("_", " ")}
            </Badge>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Threat Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{threat.title}</span>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant={threat.status === "IN_PROGRESS" ? "default" : "outline"}
                      onClick={() => updateThreatStatus("IN_PROGRESS")}
                    >
                      In Progress
                    </Button>
                    <Button 
                      size="sm" 
                      variant={threat.status === "RESOLVED" ? "default" : "outline"}
                      onClick={() => updateThreatStatus("RESOLVED")}
                    >
                      Resolve
                    </Button>
                    <Button 
                      size="sm" 
                      variant={threat.status === "FALSE_POSITIVE" ? "default" : "outline"}
                      onClick={() => updateThreatStatus("FALSE_POSITIVE")}
                    >
                      False Positive
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  {threat.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <p className="text-lg font-semibold">{Math.round(threat.confidence * 100)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-lg font-semibold">{new Date(threat.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Communication Details */}
            {threat.communication && (
              <Card>
                <CardHeader>
                  <CardTitle>Communication Details</CardTitle>
                  <CardDescription>
                    Source communication that triggered this threat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      {threat.communication.type === "EMAIL" ? 
                        <Mail className="h-4 w-4" /> : 
                        <MessageSquare className="h-4 w-4" />
                      }
                      <span className="font-medium">{threat.communication.type}</span>
                      <Badge variant="outline">{threat.communication.language}</Badge>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">{threat.communication.content}</p>
                    </div>

                    {threat.communication.metadata && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Metadata</h4>
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(threat.communication.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  Suggested actions to address this threat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {threat.recommendations.map((rec) => (
                    <div key={rec.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant={rec.priority === "URGENT" ? "destructive" : 
                                       rec.priority === "HIGH" ? "destructive" :
                                       rec.priority === "MEDIUM" ? "secondary" : "outline"}>
                            {rec.priority}
                          </Badge>
                          <Badge variant={rec.status === "COMPLETED" ? "default" : "outline"}>
                            {rec.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {rec.description}
                      </p>
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Action Steps:</h5>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          {rec.steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Threat Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Threat Detected</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(threat.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {threat.updatedAt !== threat.createdAt && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Last Updated</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(threat.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Alerts
                </Button>
                <Button className="w-full" variant="outline">
                  <Share className="h-4 w-4 mr-2" />
                  Assign to Team Member
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Evidence
                </Button>
              </CardContent>
            </Card>

            {/* Related Threats */}
            <Card>
              <CardHeader>
                <CardTitle>Related Threats</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No related threats found.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}