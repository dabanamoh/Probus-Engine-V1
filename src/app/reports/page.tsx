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
  ArrowLeft, 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Shield,
  Users,
  Mail,
  MessageSquare
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface Report {
  id: string
  type: string
  title: string
  description?: string
  format: string
  status: string
  createdAt: string
  completedAt?: string
}

export default function ReportsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [newReport, setNewReport] = useState({
    type: "",
    title: "",
    description: "",
    format: "PDF"
  })

  useEffect(() => {
    if (user?.company?.id) {
      fetchReports()
    }
  }, [user])

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`/api/reports?companyId=${user?.company?.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setReports(data.reports)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    setGenerating(true)
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          companyId: user?.company?.id,
          ...newReport
        })
      })

      if (response.ok) {
        setShowGenerateDialog(false)
        setNewReport({ type: "", title: "", description: "", format: "PDF" })
        fetchReports()
      }
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setGenerating(false)
    }
  }

  const downloadReport = async (reportId: string) => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`/api/reports/${reportId}/download`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `report-${reportId}.${response.headers.get('content-type')?.includes('pdf') ? 'pdf' : 'json'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error downloading report:", error)
    }
  }

  const getReportIcon = (type: string) => {
    switch (type) {
      case "THREAT_SUMMARY": return <AlertTriangle className="h-5 w-5" />
      case "COMPLIANCE_REPORT": return <Shield className="h-5 w-5" />
      case "USER_ACTIVITY": return <Users className="h-5 w-5" />
      case "INTEGRATION_HEALTH": return <BarChart3 className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "default"
      case "GENERATING": return "secondary"
      case "FAILED": return "destructive"
      default: return "outline"
    }
  }

  const reportTypes = [
    { value: "THREAT_SUMMARY", label: "Threat Summary", description: "Comprehensive threat analysis report" },
    { value: "COMPLIANCE_REPORT", label: "Compliance Report", description: "Regulatory compliance status" },
    { value: "USER_ACTIVITY", label: "User Activity", description: "User behavior and patterns" },
    { value: "INTEGRATION_HEALTH", label: "Integration Health", description: "System integration status" }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading reports...</p>
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
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          </div>
          <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
            <DialogTrigger asChild>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Generate New Report</DialogTitle>
                <DialogDescription>
                  Create a comprehensive report for analysis and compliance
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select 
                    value={newReport.type} 
                    onValueChange={(value) => setNewReport(prev => ({ 
                      ...prev, 
                      type: value,
                      title: reportTypes.find(rt => rt.value === value)?.label || ""
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-title">Report Title</Label>
                  <Input
                    id="report-title"
                    placeholder="Enter report title"
                    value={newReport.title}
                    onChange={(e) => setNewReport(prev => ({ 
                      ...prev, 
                      title: e.target.value 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-description">Description (Optional)</Label>
                  <Textarea
                    id="report-description"
                    placeholder="Enter report description"
                    value={newReport.description}
                    onChange={(e) => setNewReport(prev => ({ 
                      ...prev, 
                      description: e.target.value 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-format">Format</Label>
                  <Select 
                    value={newReport.format} 
                    onValueChange={(value) => setNewReport(prev => ({ 
                      ...prev, 
                      format: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="JSON">JSON</SelectItem>
                      <SelectItem value="CSV">CSV</SelectItem>
                      <SelectItem value="HTML">HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={generateReport}
                    disabled={!newReport.type || !newReport.title || generating}
                  >
                    {generating ? "Generating..." : "Generate Report"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">
                {reports.filter(r => r.status === "COMPLETED").length} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Generating</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reports.filter(r => r.status === "GENERATING").length}
              </div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reports.filter(r => r.status === "COMPLETED").length}
              </div>
              <p className="text-xs text-muted-foreground">Ready for download</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reports.filter(r => r.status === "FAILED").length}
              </div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Report Templates */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Generate</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((type) => (
              <Card key={type.value} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getReportIcon(type.value)}
                    <span className="text-lg">{type.label}</span>
                  </CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setNewReport(prev => ({
                        ...prev,
                        type: type.value,
                        title: type.label
                      }))
                      setShowGenerateDialog(true)
                    }}
                  >
                    Generate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Generated Reports */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Generated Reports</h2>
          {reports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Generate your first report to get started with analytics and compliance
                </p>
                <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Your First Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Generate New Report</DialogTitle>
                      <DialogDescription>
                        Create a comprehensive report for analysis and compliance
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="report-type">Report Type</Label>
                        <Select 
                          value={newReport.type} 
                          onValueChange={(value) => setNewReport(prev => ({ 
                            ...prev, 
                            type: value,
                            title: reportTypes.find(rt => rt.value === value)?.label || ""
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                          <SelectContent>
                            {reportTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="report-title">Report Title</Label>
                        <Input
                          id="report-title"
                          placeholder="Enter report title"
                          value={newReport.title}
                          onChange={(e) => setNewReport(prev => ({ 
                            ...prev, 
                            title: e.target.value 
                          }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="report-description">Description (Optional)</Label>
                        <Textarea
                          id="report-description"
                          placeholder="Enter report description"
                          value={newReport.description}
                          onChange={(e) => setNewReport(prev => ({ 
                            ...prev, 
                            description: e.target.value 
                          }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="report-format">Format</Label>
                        <Select 
                          value={newReport.format} 
                          onValueChange={(value) => setNewReport(prev => ({ 
                            ...prev, 
                            format: value 
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PDF">PDF</SelectItem>
                            <SelectItem value="JSON">JSON</SelectItem>
                            <SelectItem value="CSV">CSV</SelectItem>
                            <SelectItem value="HTML">HTML</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={generateReport}
                          disabled={!newReport.type || !newReport.title || generating}
                        >
                          {generating ? "Generating..." : "Generate Report"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getReportIcon(report.type)}
                        <div>
                          <h3 className="font-semibold">{report.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {report.description || report.type.replace(/_/g, ' ')}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Created: {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                            {report.completedAt && (
                              <span className="flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed: {new Date(report.completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusColor(report.status)}>
                          {report.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline">{report.format}</Badge>
                        {report.status === "COMPLETED" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => downloadReport(report.id)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}