// src/lib/utils.ts

export function cn(...args: any[]) {
  return args.filter(Boolean).join(' ')
}

// ✅ Add and export this function
export function calculateComplianceScore(threats: any[]): number {
  if (!threats || threats.length === 0) return 100;

  let score = 100;
  for (const threat of threats) {
    if (threat.severity === 'HIGH') {
      score -= 20;
    } else if (threat.severity === 'MEDIUM') {
      score -= 10;
    } else if (threat.severity === 'LOW') {
      score -= 5;
    }
  }

  return Math.max(score, 0); // never go below 0
}
