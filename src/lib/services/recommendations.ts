import { db } from '@/lib/db'

interface RecommendationData {
  threatId: string
  type: string
  title: string
  description: string
  steps: string[]
  priority: string
  language: string
}

export class RecommendationsService {
  async createRecommendation(data: RecommendationData) {
    try {
      const recommendation = await db.recommendation.create({
        data: {
          threatId: data.threatId,
          type: data.type,
          title: data.title,
          description: data.description,
          steps: data.steps,
          priority: data.priority,
          language: data.language
        },
        include: {
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

      return recommendation
    } catch (error) {
      console.error('Error creating recommendation:', error)
      throw error
    }
  }

  async getRecommendationsByThreat(threatId: string) {
    try {
      const recommendations = await db.recommendation.findMany({
        where: { threatId },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ]
      })

      return recommendations
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      throw error
    }
  }

  async updateRecommendationStatus(id: string, status: string) {
    try {
      const recommendation = await db.recommendation.update({
        where: { id },
        data: { status },
        include: {
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

      return recommendation
    } catch (error) {
      console.error('Error updating recommendation status:', error)
      throw error
    }
  }

  async getRecommendationsByCompany(companyId: string, filters?: {
    status?: string
    priority?: string
    type?: string
  }) {
    try {
      const where: any = {
        threat: {
          companyId
        }
      }

      if (filters?.status) {
        where.status = filters.status
      }

      if (filters?.priority) {
        where.priority = filters.priority
      }

      if (filters?.type) {
        where.type = filters.type
      }

      const recommendations = await db.recommendation.findMany({
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
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ]
      })

      return recommendations
    } catch (error) {
      console.error('Error fetching company recommendations:', error)
      throw error
    }
  }

  async getRecommendationStats(companyId: string) {
    try {
      const stats = await db.recommendation.groupBy({
        by: ['status'],
        where: {
          threat: {
            companyId
          }
        },
        _count: {
          status: true
        }
      })

      const priorityStats = await db.recommendation.groupBy({
        by: ['priority'],
        where: {
          threat: {
            companyId
          }
        },
        _count: {
          priority: true
        }
      })

      const typeStats = await db.recommendation.groupBy({
        by: ['type'],
        where: {
          threat: {
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
        priorityStats: priorityStats.reduce((acc, stat) => {
          acc[stat.priority] = stat._count.priority
          return acc
        }, {} as Record<string, number>),
        typeStats: typeStats.reduce((acc, stat) => {
          acc[stat.type] = stat._count.type
          return acc
        }, {} as Record<string, number>)
      }
    } catch (error) {
      console.error('Error fetching recommendation stats:', error)
      throw error
    }
  }

  getLocalizedRecommendationTemplate(type: string, language: string = 'en') {
    const templates = {
      en: {
        POLICY_UPDATE: {
          title: 'Policy Update Required',
          description: 'Update company policies to address the identified threat',
          steps: [
            'Review current policies related to the threat type',
            'Identify gaps or weaknesses in existing policies',
            'Draft updated policy language',
            'Review with legal and compliance teams',
            'Communicate changes to all employees',
            'Schedule training on updated policies'
          ]
        },
        TRAINING: {
          title: 'Employee Training Required',
          description: 'Conduct training sessions to educate employees about the threat',
          steps: [
            'Develop training materials specific to the threat',
            'Identify employees who need training',
            'Schedule training sessions',
            'Conduct interactive training workshops',
            'Assess understanding through quizzes or scenarios',
            'Provide ongoing support and resources'
          ]
        },
        INVESTIGATION: {
          title: 'Investigation Required',
          description: 'Conduct a thorough investigation into the incident',
          steps: [
            'Secure all relevant evidence and communications',
            'Identify all involved parties',
            'Conduct interviews with relevant individuals',
            'Document findings and timeline',
            'Determine root cause and contributing factors',
            'Develop action plan to prevent recurrence'
          ]
        },
        SYSTEM_CONFIG: {
          title: 'System Configuration Update',
          description: 'Update system configurations to prevent similar threats',
          steps: [
            'Review current system settings and permissions',
            'Identify configuration vulnerabilities',
            'Implement necessary security controls',
            'Test configuration changes',
            'Monitor system for unusual activity',
            'Document configuration changes for audit purposes'
          ]
        },
        COMMUNICATION_GUIDELINE: {
          title: 'Communication Guidelines Update',
          description: 'Update communication guidelines to promote positive interactions',
          steps: [
            'Review current communication policies',
            'Develop clear guidelines for appropriate communication',
            'Create examples of acceptable and unacceptable communication',
            'Train managers on enforcing guidelines',
            'Implement monitoring and reporting mechanisms',
            'Regularly review and update guidelines'
          ]
        }
      },
      es: {
        POLICY_UPDATE: {
          title: 'Actualización de Política Requerida',
          description: 'Actualice las políticas de la empresa para abordar la amenaza identificada',
          steps: [
            'Revisar políticas actuales relacionadas con el tipo de amenaza',
            'Identificar brechas o debilidades en las políticas existentes',
            'Redactar lenguaje de política actualizado',
            'Revisar con equipos legales y de cumplimiento',
            'Comunicar cambios a todos los empleados',
            'Programar capacitación sobre políticas actualizadas'
          ]
        },
        TRAINING: {
          title: 'Capacitación de Empleados Requerida',
          description: 'Realizar sesiones de capacitación para educar a los empleados sobre la amenaza',
          steps: [
            'Desarrollar materiales de capacitación específicos para la amenaza',
            'Identificar empleados que necesitan capacitación',
            'Programar sesiones de capacitación',
            'Realizar talleres de capacitación interactivos',
            'Evaluar comprensión mediante cuestionarios o escenarios',
            'Proporcionar apoyo y recursos continuos'
          ]
        }
      },
      fr: {
        POLICY_UPDATE: {
          title: 'Mise à Jour de la Politique Requise',
          description: 'Mettre à jour les politiques de l\'entreprise pour traiter la menace identifiée',
          steps: [
            'Examiner les politiques actuelles liées au type de menace',
            'Identifier les lacunes ou faiblesses dans les politiques existantes',
            'Rédiger le langage de politique mis à jour',
            'Revoir avec les équipes juridiques et de conformité',
            'Communiquer les changements à tous les employés',
            'Planifier la formation sur les politiques mises à jour'
          ]
        }
      }
    }

    return templates[language as keyof typeof templates]?.[type as keyof typeof templates.en] || templates.en[type as keyof typeof templates.en]
  }
}

export const recommendationsService = new RecommendationsService()