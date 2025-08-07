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

  const totalWeight = threats.reduce((sum, threat) => {
    return sum + (severityWeights[threat.severity] || 1)
  }, 0)

  const maxPossibleWeight = threats.length * Math.max(...Object.values(severityWeights))

  const complianceScore = 100 - (totalWeight / maxPossibleWeight) * 100

  return Math.max(0, Math.round(complianceScore * 100) / 100)
}
