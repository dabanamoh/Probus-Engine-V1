"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Plus, 
  Settings, 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowLeft,
  TestTube,
  Save
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface Integration {
  id: string
  type: string
  name: string
  status: string
  lastSyncAt?: string
  config: any
}

interface NewIntegration {
  type: string
  name: string
  config: any
}

export default function IntegrationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [newIntegration, setNewIntegration] = useState<NewIntegration>({
    type: "",
    name: "",
    config: {}
  })

  useEffect(() => {
    if (user?.company?.id) {
      fetchIntegrations()
    }
  }, [user])

  const fetchIntegrations = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`/api/integrations?companyId=${user?.company?.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIntegrations(data.integrations)
      }
    } catch (error) {
      console.error("Error fetching integrations:", error)
    } finally {
      setLoading(false)
    }
  }

  const createIntegration = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          companyId: user?.company?.id,
          ...newIntegration
        })
      })

      if (response.ok) {
        setShowAddDialog(false)
        setNewIntegration({ type: "", name: "", config: {} })
        fetchIntegrations()
      }
    } catch (error) {
      console.error("Error creating integration:", error)
    }
  }

  const testConnection = async (integrationId: string) => {
    setTesting(integrationId)
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`/api/integrations/${integrationId}/test`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Show success message
        alert("Connection test successful!")
      } else {
        alert("Connection test failed. Please check your configuration.")
      }
    } catch (error) {
      alert("Connection test failed. Please check your configuration.")
    } finally {
      setTesting(null)
    }
  }

  const syncIntegration = async (integrationId: string) => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`/api/integrations/${integrationId}/sync`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchIntegrations()
      }
    } catch (error) {
      console.error("Error syncing integration:", error)
    }
  }

  const getIntegrationIcon = (type: string) => {
    if (type.includes("EMAIL")) {
      return <Mail className="h-5 w-5" />
    }
    return <MessageSquare className="h-5 w-5" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "default"
      case "INACTIVE": return "secondary"
      case "ERROR": return "destructive"
      default: return "outline"
    }
  }

  const getConfigFields = (type: string) => {
    switch (type) {
      case "EMAIL_GMAIL":
        return [
          { key: "clientId", label: "Client ID", type: "text" },
          { key: "clientSecret", label: "Client Secret", type: "password" },
          { key: "accessToken", label: "Access Token", type: "text" },
          { key: "refreshToken", label: "Refresh Token", type: "text" }
        ]
      case "EMAIL_OUTLOOK":
        return [
          { key: "clientId", label: "Client ID", type: "text" },
          { key: "clientSecret", label: "Client Secret", type: "password" },
          { key: "accessToken", label: "Access Token", type: "text" },
          { key: "refreshToken", label: "Refresh Token", type: "text" }
        ]
      case "EMAIL_EXCHANGE":
        return [
          { key: "server", label: "Exchange Server", type: "text" },
          { key: "username", label: "Username", type: "text" },
          { key: "password", label: "Password", type: "password" }
        ]
      case "CHAT_SLACK":
        return [
          { key: "botToken", label: "Bot Token", type: "password" },
          { key: "signingSecret", label: "Signing Secret", type: "password" }
        ]
      case "CHAT_TEAMS":
        return [
          { key: "botToken", label: "Bot Token", type: "password" },
          { key: "appId", label: "App ID", type: "text" }
        ]
      case "CHAT_WHATSAPP":
        return [
          { key: "phoneNumber", label: "Phone Number", type: "text" },
          { key: "apiToken", label: "API Token", type: "password" }
        ]
      default:
        return []
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading integrations...</p>
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
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Integrations</h1>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Integration</DialogTitle>
                <DialogDescription>
                  Connect a new communication platform to monitor for threats
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="integration-type">Integration Type</Label>
                  <Select 
                    value={newIntegration.type} 
                    onValueChange={(value) => setNewIntegration(prev => ({ 
                      ...prev, 
                      type: value,
                      config: {}
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select integration type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMAIL_GMAIL">Gmail</SelectItem>
                      <SelectItem value="EMAIL_OUTLOOK">Outlook</SelectItem>
                      <SelectItem value="EMAIL_EXCHANGE">Exchange Server</SelectItem>
                      <SelectItem value="CHAT_SLACK">Slack</SelectItem>
                      <SelectItem value="CHAT_TEAMS">Microsoft Teams</SelectItem>
                      <SelectItem value="CHAT_WHATSAPP">WhatsApp Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="integration-name">Integration Name</Label>
                  <Input
                    id="integration-name"
                    placeholder="e.g., Company Gmail, Team Slack"
                    value={newIntegration.name}
                    onChange={(e) => setNewIntegration(prev => ({ 
                      ...prev, 
                      name: e.target.value 
                    }))}
                  />
                </div>

                {newIntegration.type && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Configuration</h4>
                    {getConfigFields(newIntegration.type).map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Input
                          id={field.key}
                          type={field.type}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          value={newIntegration.config[field.key] || ""}
                          onChange={(e) => setNewIntegration(prev => ({
                            ...prev,
                            config: {
                              ...prev.config,
                              [field.key]: e.target.value
                            }
                          }))}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={createIntegration}
                    disabled={!newIntegration.type || !newIntegration.name}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Create Integration
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {integrations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Integrations Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                Connect your email and chat platforms to start monitoring for threats
              </p>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Integration
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Integration</DialogTitle>
                    <DialogDescription>
                      Connect a new communication platform to monitor for threats
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="integration-type">Integration Type</Label>
                      <Select 
                        value={newIntegration.type} 
                        onValueChange={(value) => setNewIntegration(prev => ({ 
                          ...prev, 
                          type: value,
                          config: {}
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select integration type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EMAIL_GMAIL">Gmail</SelectItem>
                          <SelectItem value="EMAIL_OUTLOOK">Outlook</SelectItem>
                          <SelectItem value="EMAIL_EXCHANGE">Exchange Server</SelectItem>
                          <SelectItem value="CHAT_SLACK">Slack</SelectItem>
                          <SelectItem value="CHAT_TEAMS">Microsoft Teams</SelectItem>
                          <SelectItem value="CHAT_WHATSAPP">WhatsApp Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="integration-name">Integration Name</Label>
                      <Input
                        id="integration-name"
                        placeholder="e.g., Company Gmail, Team Slack"
                        value={newIntegration.name}
                        onChange={(e) => setNewIntegration(prev => ({ 
                          ...prev, 
                          name: e.target.value 
                        }))}
                      />
                    </div>

                    {newIntegration.type && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Configuration</h4>
                        {getConfigFields(newIntegration.type).map((field) => (
                          <div key={field.key} className="space-y-2">
                            <Label htmlFor={field.key}>{field.label}</Label>
                            <Input
                              id={field.key}
                              type={field.type}
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                              value={newIntegration.config[field.key] || ""}
                              onChange={(e) => setNewIntegration(prev => ({
                                ...prev,
                                config: {
                                  ...prev.config,
                                  [field.key]: e.target.value
                                }
                              }))}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={createIntegration}
                        disabled={!newIntegration.type || !newIntegration.name}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Create Integration
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getIntegrationIcon(integration.type)}
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                    </div>
                    <Badge variant={getStatusColor(integration.status)}>
                      {integration.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {integration.type.replace(/_/g, ' ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {integration.lastSyncAt && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      Last sync: {new Date(integration.lastSyncAt).toLocaleString()}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => testConnection(integration.id)}
                      disabled={testing === integration.id}
                    >
                      <TestTube className="h-3 w-3 mr-1" />
                      {testing === integration.id ? "Testing..." : "Test"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => syncIntegration(integration.id)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Sync
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}