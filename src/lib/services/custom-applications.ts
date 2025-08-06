export interface CustomApplication {
  id: string
  name: string
  description: string
  type: 'attendance' | 'leave' | 'performance' | 'custom'
  enabled: boolean
  config: ApplicationConfig
  analysisRules: AnalysisRule[]
  createdAt: Date
  updatedAt: Date
}

export interface ApplicationConfig {
  dataSources: DataSource[]
  schedule: AnalysisSchedule
  thresholds: Threshold[]
  notifications: NotificationConfig
}

export interface DataSource {
  id: string
  name: string
  type: 'api' | 'database' | 'file' | 'webhook'
  endpoint?: string
  query?: string
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
  authMethod?: 'bearer' | 'basic' | 'apikey' | 'none'
  authConfig?: Record<string, string>
}

export interface AnalysisSchedule {
  enabled: boolean
  frequency: 'continuous' | 'hourly' | 'daily' | 'weekly' | 'monthly'
  time?: string // For specific time schedules
  days?: number[] // For weekly schedules
}

export interface Threshold {
  id: string
  name: string
  type: 'numeric' | 'percentage' | 'boolean' | 'categorical'
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'contains' | 'between'
  value: any
  severity: 'low' | 'medium' | 'high' | 'critical'
  action: 'alert' | 'report' | 'block' | 'notify'
}

export interface NotificationConfig {
  enabled: boolean
  channels: ('email' | 'slack' | 'webhook' | 'in_app')[]
  recipients: string[]
  template?: string
}

export interface AnalysisRule {
  id: string
  name: string
  description: string
  type: 'pattern' | 'anomaly' | 'threshold' | 'correlation'
  conditions: RuleCondition[]
  actions: RuleAction[]
  enabled: boolean
}

export interface RuleCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'matches_regex'
  value: any
  weight?: number
}

export interface RuleAction {
  type: 'alert' | 'report' | 'escalate' | 'notify' | 'block'
  config: Record<string, any>
}

export interface AnalysisResult {
  id: string
  applicationId: string
  timestamp: Date
  anomalies: Anomaly[]
  threats: DetectedThreat[]
  metrics: AnalysisMetric[]
  overallRisk: 'low' | 'medium' | 'high' | 'critical'
}

export interface Anomaly {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  value: any
  expectedValue?: any
  confidence: number
  evidence: string[]
}

export interface DetectedThreat {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  confidence: number
  affectedUsers: string[]
  mitigation: string
}

export interface AnalysisMetric {
  name: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  change: number
}

export class CustomApplicationService {
  private static instance: CustomApplicationService
  private applications: Map<string, CustomApplication> = new Map()

  static getInstance(): CustomApplicationService {
    if (!CustomApplicationService.instance) {
      CustomApplicationService.instance = new CustomApplicationService()
    }
    return CustomApplicationService.instance
  }

  getApplications(): CustomApplication[] {
    return Array.from(this.applications.values())
  }

  getApplication(id: string): CustomApplication | undefined {
    return this.applications.get(id)
  }

  addApplication(application: Omit<CustomApplication, 'id' | 'createdAt' | 'updatedAt'>): CustomApplication {
    const newApplication: CustomApplication = {
      ...application,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.applications.set(newApplication.id, newApplication)
    return newApplication
  }

  updateApplication(id: string, updates: Partial<CustomApplication>): CustomApplication | null {
    const application = this.applications.get(id)
    if (!application) return null

    const updatedApplication = {
      ...application,
      ...updates,
      updatedAt: new Date()
    }
    this.applications.set(id, updatedApplication)
    return updatedApplication
  }

  removeApplication(id: string): boolean {
    return this.applications.delete(id)
  }

  enableApplication(id: string): boolean {
    const application = this.applications.get(id)
    if (application) {
      application.enabled = true
      application.updatedAt = new Date()
      return true
    }
    return false
  }

  disableApplication(id: string): boolean {
    const application = this.applications.get(id)
    if (application) {
      application.enabled = false
      application.updatedAt = new Date()
      return true
    }
    return false
  }

  async analyzeApplication(id: string): Promise<AnalysisResult> {
    const application = this.applications.get(id)
    if (!application || !application.enabled) {
      throw new Error('Application not found or disabled')
    }

    // Simulate analysis process
    const anomalies = this.generateAnomalies(application)
    const threats = this.generateThreats(application)
    const metrics = this.generateMetrics(application)
    const overallRisk = this.calculateOverallRisk(anomalies, threats)

    return {
      id: this.generateId(),
      applicationId: id,
      timestamp: new Date(),
      anomalies,
      threats,
      metrics,
      overallRisk
    }
  }

  private generateAnomalies(application: CustomApplication): Anomaly[] {
    // Simulate anomaly detection based on application type
    const anomalies: Anomaly[] = []

    if (application.type === 'attendance') {
      // Check for irregular clock-in/clock-out patterns
      if (Math.random() > 0.7) {
        anomalies.push({
          id: this.generateId(),
          type: 'irregular_attendance',
          severity: 'medium',
          description: 'Irregular clock-in/clock-out patterns detected',
          value: { lateArrivals: 5, earlyDepartures: 3 },
          expectedValue: { lateArrivals: 1, earlyDepartures: 1 },
          confidence: 0.85,
          evidence: ['Employee A arrived 45 minutes late 3 times this week', 'Employee B left 2 hours early twice']
        })
      }
    }

    if (application.type === 'leave') {
      // Check for excessive leave patterns
      if (Math.random() > 0.8) {
        anomalies.push({
          id: this.generateId(),
          type: 'excessive_leave',
          severity: 'high',
          description: 'Excessive sick leave pattern detected',
          value: { sickDays: 12, totalLeave: 15 },
          expectedValue: { sickDays: 5, totalLeave: 8 },
          confidence: 0.92,
          evidence: ['Employee C took 10 sick days in the last month', 'Pattern of Monday/Friday sick leave']
        })
      }
    }

    return anomalies
  }

  private generateThreats(application: CustomApplication): DetectedThreat[] {
    const threats: DetectedThreat[] = []

    // Generate threats based on analysis rules
    for (const rule of application.analysisRules.filter(r => r.enabled)) {
      if (Math.random() > 0.6) {
        threats.push({
          id: this.generateId(),
          type: rule.name,
          severity: this.getRandomSeverity(),
          description: rule.description,
          confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
          affectedUsers: this.generateAffectedUsers(),
          mitigation: 'Review and investigate the detected pattern'
        })
      }
    }

    return threats
  }

  private generateMetrics(application: CustomApplication): AnalysisMetric[] {
    const metrics: AnalysisMetric[] = []

    if (application.type === 'attendance') {
      metrics.push({
        name: 'Attendance Rate',
        value: 94.5,
        unit: '%',
        trend: 'stable',
        change: 0.2
      })
      metrics.push({
        name: 'Late Arrivals',
        value: 2.3,
        unit: 'avg/day',
        trend: 'up',
        change: 0.8
      })
    }

    if (application.type === 'leave') {
      metrics.push({
        name: 'Leave Utilization',
        value: 78.2,
        unit: '%',
        trend: 'up',
        change: 5.2
      })
      metrics.push({
        name: 'Sick Leave Rate',
        value: 3.1,
        unit: '%',
        trend: 'up',
        change: 1.2
      })
    }

    return metrics
  }

  private calculateOverallRisk(anomalies: Anomaly[], threats: DetectedThreat[]): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0

    // Calculate risk from anomalies
    anomalies.forEach(anomaly => {
      switch (anomaly.severity) {
        case 'low': riskScore += 1; break
        case 'medium': riskScore += 3; break
        case 'high': riskScore += 5; break
        case 'critical': riskScore += 10; break
      }
      riskScore *= anomaly.confidence
    })

    // Calculate risk from threats
    threats.forEach(threat => {
      switch (threat.severity) {
        case 'low': riskScore += 2; break
        case 'medium': riskScore += 4; break
        case 'high': riskScore += 7; break
        case 'critical': riskScore += 15; break
      }
      riskScore *= threat.confidence
    })

    // Determine overall risk level
    if (riskScore >= 50) return 'critical'
    if (riskScore >= 30) return 'high'
    if (riskScore >= 15) return 'medium'
    return 'low'
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private getRandomSeverity(): 'low' | 'medium' | 'high' | 'critical' {
    const severities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical']
    return severities[Math.floor(Math.random() * severities.length)]
  }

  private generateAffectedUsers(): string[] {
    const users = ['Employee A', 'Employee B', 'Employee C', 'Employee D', 'Employee E']
    const count = Math.floor(Math.random() * 3) + 1
    return users.slice(0, count)
  }

  // Predefined application templates
  getApplicationTemplates(): Array<{
    name: string
    description: string
    type: CustomApplication['type']
    config: Partial<ApplicationConfig>
    analysisRules: Partial<AnalysisRule>[]
  }> {
    return [
      {
        name: 'Employee Attendance Tracking',
        description: 'Monitor employee clock-in/clock-out patterns and attendance anomalies',
        type: 'attendance',
        config: {
          schedule: {
            enabled: true,
            frequency: 'daily'
          },
          thresholds: [
            {
              id: 'late-threshold',
              name: 'Late Arrival Threshold',
              type: 'numeric',
              condition: 'greater_than',
              value: 3,
              severity: 'medium',
              action: 'alert'
            }
          ]
        },
        analysisRules: [
          {
            name: 'Irregular Attendance Pattern',
            description: 'Detect irregular clock-in/clock-out patterns',
            type: 'pattern',
            conditions: [
              {
                field: 'lateArrivals',
                operator: 'greater_than',
                value: 3,
                weight: 0.7
              }
            ],
            actions: [
              {
                type: 'alert',
                config: { message: 'Irregular attendance pattern detected' }
              }
            ]
          }
        ]
      },
      {
        name: 'Leave Management Analysis',
        description: 'Analyze employee leave patterns and identify excessive absenteeism',
        type: 'leave',
        config: {
          schedule: {
            enabled: true,
            frequency: 'weekly'
          },
          thresholds: [
            {
              id: 'sick-leave-threshold',
              name: 'Sick Leave Threshold',
              type: 'numeric',
              condition: 'greater_than',
              value: 8,
              severity: 'high',
              action: 'alert'
            }
          ]
        },
        analysisRules: [
          {
            name: 'Excessive Sick Leave',
            description: 'Detect patterns of excessive sick leave usage',
            type: 'threshold',
            conditions: [
              {
                field: 'sickDays',
                operator: 'greater_than',
                value: 8,
                weight: 0.8
              }
            ],
            actions: [
              {
                type: 'alert',
                config: { message: 'Excessive sick leave pattern detected' }
              }
            ]
          }
        ]
      },
      {
        name: 'Performance Monitoring',
        description: 'Monitor employee performance metrics and identify trends',
        type: 'performance',
        config: {
          schedule: {
            enabled: true,
            frequency: 'monthly'
          }
        },
        analysisRules: [
          {
            name: 'Performance Decline',
            description: 'Detect significant performance decline',
            type: 'anomaly',
            conditions: [
              {
                field: 'performanceScore',
                operator: 'less_than',
                value: 70,
                weight: 0.9
              }
            ],
            actions: [
              {
                type: 'notify',
                config: { message: 'Performance decline detected' }
              }
            ]
          }
        ]
      }
    ]
  }
}