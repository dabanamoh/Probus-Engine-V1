// src/lib/utils.ts

export function cn(...args: any[]) {
  return args.filter(Boolean).join(' ')
}

// Add this function
export function calculateComplianceScore(threats: any[]): number {
  if (!threats || threats.length === 0) return 100

  const totalThreats = threats.length
  const severityWeights: Record<string, number> = {
    high: 3,
    medium: 2,
    low: 1
  }

  let riskPoints = 0

  for (const threat of threats) {
    const severity = threat.severity?.toLowerCase?.()
    riskPoints += severityWeights[severity] || 1
  }

  // Max risk = all threats are high
  const maxRisk = totalThreats * severityWeights.high
  const score = ((maxRisk - riskPoints) / maxRisk) * 100

  return Math.round(score)
}
