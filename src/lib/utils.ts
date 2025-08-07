// src/lib/utils.ts

export function cn(...args: any[]) {
  return args.filter(Boolean).join(' ')
}

export function calculateComplianceScore(threats: any[]): number {
  if (!threats || threats.length === 0) return 100.0

  const severityWeights: Record<string, number> = {
    CRITICAL: 5,
    HIGH: 4,
    MEDIUM: 2,
    LOW: 1,
  }

  const scores = threats.map(threat =>
    severityWeights[threat.severity] ?? 1
  )

  const average = scores.reduce((a, b) => a + b, 0) / scores.length
  const maxWeight = Math.max(...Object.values(severityWeights))

  const complianceScore = 100 - (average / maxWeight) * 100
  return Math.max(0, Math.round(complianceScore * 100) / 100)
}
