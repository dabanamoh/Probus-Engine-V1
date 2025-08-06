import { db } from '@/lib/db'

interface AlertData {
  userId: string
  threatId: string
  type: string
  title: string
  message: string
  metadata?: any
}

interface NotificationConfig {
  email: boolean
  push: boolean
  sms: boolean
  severityThreshold: string
}

export class AlertingService {
  async createAlert(data: AlertData) {
    try {
      const alert = await db.alert.create({
        data: {
          userId: data.userId,
          threatId: data.threatId,
          type: data.type,
          title: data.title,
          message: data.message,
          metadata: data.metadata || {}
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              language: true
            }
          },
          threat: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      })

      // Send notifications based on user preferences
      await this.sendNotifications(alert)

      return alert
    } catch (error) {
      console.error('Error creating alert:', error)
      throw error
    }
  }

  async getAlertsByUser(userId: string, filters?: {
    status?: string
    type?: string
    limit?: number
  }) {
    try {
      const where: any = { userId }

      if (filters?.status) {
        where.status = filters.status
      }

      if (filters?.type) {
        where.type = filters.type
      }

      const alerts = await db.alert.findMany({
        where,
        include: {
          threat: {
            select: {
              id: true,
              type: true,
              severity: true,
              title: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: filters?.limit || 50
      })

      return alerts
    } catch (error) {
      console.error('Error fetching user alerts:', error)
      throw error
    }
  }

  async markAlertAsRead(alertId: string) {
    try {
      const alert = await db.alert.update({
        where: { id: alertId },
        data: { 
          status: 'READ',
          readAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          threat: {
            select: {
              id: true,
              type: true,
              severity: true,
              title: true
            }
          }
        }
      })

      return alert
    } catch (error) {
      console.error('Error marking alert as read:', error)
      throw error
    }
  }

  async getUnreadAlertCount(userId: string) {
    try {
      const count = await db.alert.count({
        where: {
          userId,
          status: 'UNREAD'
        }
      })

      return count
    } catch (error) {
      console.error('Error fetching unread alert count:', error)
      throw error
    }
  }

  async createThreatAlert(threat: any, userIds: string[]) {
    try {
      const alerts = []

      for (const userId of userIds) {
        const alertData: AlertData = {
          userId,
          threatId: threat.id,
          type: 'THREAT_DETECTED',
          title: `New ${threat.type} Threat Detected`,
          message: `A ${threat.severity.toLowerCase()} severity ${threat.type.toLowerCase()} threat has been detected: ${threat.title}`,
          metadata: {
            threatType: threat.type,
            severity: threat.severity,
            timestamp: threat.createdAt
          }
        }

        const alert = await this.createAlert(alertData)
        alerts.push(alert)
      }

      return alerts
    } catch (error) {
      console.error('Error creating threat alerts:', error)
      throw error
    }
  }

  async createSeverityChangeAlert(threat: any, oldSeverity: string, userIds: string[]) {
    try {
      const alerts = []

      for (const userId of userIds) {
        const alertData: AlertData = {
          userId,
          threatId: threat.id,
          type: 'SEVERITY_CHANGE',
          title: `Threat Severity Changed`,
          message: `Threat severity has changed from ${oldSeverity} to ${threat.severity}: ${threat.title}`,
          metadata: {
            threatType: threat.type,
            oldSeverity,
            newSeverity: threat.severity,
            timestamp: threat.updatedAt
          }
        }

        const alert = await this.createAlert(alertData)
        alerts.push(alert)
      }

      return alerts
    } catch (error) {
      console.error('Error creating severity change alerts:', error)
      throw error
    }
  }

  async createRecommendationAlert(threat: any, userIds: string[]) {
    try {
      const alerts = []

      for (const userId of userIds) {
        const alertData: AlertData = {
          userId,
          threatId: threat.id,
          type: 'RECOMMENDATION_AVAILABLE',
          title: 'New Recommendations Available',
          message: `New recommendations are available for the threat: ${threat.title}`,
          metadata: {
            threatType: threat.type,
            severity: threat.severity,
            timestamp: threat.createdAt
          }
        }

        const alert = await this.createAlert(alertData)
        alerts.push(alert)
      }

      return alerts
    } catch (error) {
      console.error('Error creating recommendation alerts:', error)
      throw error
    }
  }

  private async sendNotifications(alert: any) {
    try {
      // Get user notification preferences
      const userPreferences = await this.getUserNotificationPreferences(alert.userId)

      if (!userPreferences) {
        return
      }

      // Check if alert severity meets threshold
      const severityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }
      const alertSeverity = alert.threat?.severity || 'LOW'
      const threshold = userPreferences.severityThreshold || 'LOW'

      if (severityOrder[alertSeverity as keyof typeof severityOrder] < 
          severityOrder[threshold as keyof typeof severityOrder]) {
        return
      }

      // Send email notification
      if (userPreferences.email) {
        await this.sendEmailNotification(alert)
      }

      // Send push notification
      if (userPreferences.push) {
        await this.sendPushNotification(alert)
      }

      // Send SMS notification
      if (userPreferences.sms) {
        await this.sendSMSNotification(alert)
      }
    } catch (error) {
      console.error('Error sending notifications:', error)
    }
  }

  private async getUserNotificationPreferences(userId: string): Promise<NotificationConfig | null> {
    try {
      // Mock implementation - in production, this would fetch from user settings
      return {
        email: true,
        push: true,
        sms: false,
        severityThreshold: 'MEDIUM'
      }
    } catch (error) {
      console.error('Error fetching user notification preferences:', error)
      return null
    }
  }

  private async sendEmailNotification(alert: any) {
    try {
      // Mock email implementation - in production, integrate with email service
      console.log(`Email notification sent to ${alert.user.email}: ${alert.title}`)
    } catch (error) {
      console.error('Error sending email notification:', error)
    }
  }

  private async sendPushNotification(alert: any) {
    try {
      // Mock push notification implementation - in production, integrate with push service
      console.log(`Push notification sent to ${alert.user.id}: ${alert.title}`)
    } catch (error) {
      console.error('Error sending push notification:', error)
    }
  }

  private async sendSMSNotification(alert: any) {
    try {
      // Mock SMS implementation - in production, integrate with SMS service
      console.log(`SMS notification sent to ${alert.user.id}: ${alert.title}`)
    } catch (error) {
      console.error('Error sending SMS notification:', error)
    }
  }

  async getAlertStats(companyId: string) {
    try {
      const stats = await db.alert.groupBy({
        by: ['status'],
        where: {
          user: {
            companyId
          }
        },
        _count: {
          status: true
        }
      })

      const typeStats = await db.alert.groupBy({
        by: ['type'],
        where: {
          user: {
            companyId
          }
        },
        _count: {
          type: true
        }
      })

      return {
        statusStats: stats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.status
          return acc
        }, {} as Record<string, number>),
        typeStats: typeStats.reduce((acc, stat) => {
          acc[stat.type] = stat._count.type
          return acc
        }, {} as Record<string, number>)
      }
    } catch (error) {
      console.error('Error fetching alert stats:', error)
      throw error
    }
  }
}

export const alertingService = new AlertingService()